import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';

export interface Vibe {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'project' | 'tip' | 'post' | 'comment';
  created_at: string;
}

export type VibeContentType = 'project' | 'tip' | 'post' | 'comment';

interface VibeToggleParams {
  contentId: string;
  contentType: VibeContentType;
  isVibed: boolean;
}

// 특정 콘텐츠의 좋아요 수 조회
export const useVibeCount = (contentId: string, contentType: VibeContentType) => {
  return useQuery({
    queryKey: ['vibe-count', contentType, contentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vibes')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', contentId)
        .eq('content_type', contentType);

      if (error) {
        console.error('Error fetching vibe count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!contentId && !!contentType,
    retry: authAwareRetry,
  });
};

// 사용자의 특정 콘텐츠에 대한 좋아요 상태 확인
export const useVibeStatus = (contentId: string, contentType: VibeContentType) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vibe-status', contentType, contentId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('vibes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .maybeSingle();

      if (error) {
        console.error('Error checking vibe status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!contentId && !!contentType,
    retry: authAwareRetry,
  });
};

// 좋아요 토글 (낙관적 업데이트 포함)
export const useToggleVibe = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ contentId, contentType, isVibed }: VibeToggleParams) => {
      if (!user) throw new Error('User not authenticated');

      if (isVibed) {
        // 좋아요 제거
        const { error } = await supabase
          .from('vibes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .eq('content_type', contentType);

        if (error) {
          console.error('Error removing vibe:', error);
          throw error;
        }

        // 콘텐츠의 좋아요 수 감소
        await updateContentVibeCount(contentId, contentType, 'decrement');
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('vibes')
          .insert({
            user_id: user.id,
            content_id: contentId,
            content_type: contentType,
          });

        if (error && error.code !== '23505') { // 중복 삽입 무시
          console.error('Error adding vibe:', error);
          throw error;
        }

        // 콘텐츠의 좋아요 수 증가
        await updateContentVibeCount(contentId, contentType, 'increment');
      }

      return !isVibed;
    },
    onMutate: async ({ contentId, contentType, isVibed }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ 
        queryKey: ['vibe-status', contentType, contentId, user?.id] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['vibe-count', contentType, contentId] 
      });

      // 이전 값들 저장
      const previousStatus = queryClient.getQueryData(['vibe-status', contentType, contentId, user?.id]);
      const previousCount = queryClient.getQueryData(['vibe-count', contentType, contentId]);

      // 낙관적으로 상태 업데이트
      queryClient.setQueryData(['vibe-status', contentType, contentId, user?.id], !isVibed);
      
      if (typeof previousCount === 'number') {
        queryClient.setQueryData(
          ['vibe-count', contentType, contentId], 
          isVibed ? previousCount - 1 : previousCount + 1
        );
      }

      return { previousStatus, previousCount, contentId, contentType };
    },
    onError: (error, variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ['vibe-status', context.contentType, context.contentId, user?.id], 
          context.previousStatus
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          ['vibe-count', context.contentType, context.contentId], 
          context.previousCount
        );
      }

      console.error('Error toggling vibe:', error);
      
      if (isAuthError(error)) {
        handleAuthError(error);
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        toast.error('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
      }
    },
    onSuccess: (newVibeState, variables) => {
      // 관련 쿼리들 무효화하여 서버 상태와 동기화
      queryClient.invalidateQueries({ 
        queryKey: ['vibe-status', variables.contentType, variables.contentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['vibe-count', variables.contentType, variables.contentId] 
      });

      // 콘텐츠 목록도 갱신
      if (variables.contentType === 'project') {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', variables.contentId] });
      } else if (variables.contentType === 'tip') {
        queryClient.invalidateQueries({ queryKey: ['tips'] });
        queryClient.invalidateQueries({ queryKey: ['tip', variables.contentId] });
      } else if (variables.contentType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', variables.contentId] });
      } else if (variables.contentType === 'comment') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['comment', variables.contentId] });
      }

      const message = newVibeState ? '좋아요를 눌렀습니다! 💝' : '좋아요가 취소되었습니다.';
      toast.success(message);
    },
    onSettled: () => {
      // 완료 후 데이터 동기화
      queryClient.invalidateQueries({ queryKey: ['vibe-status'] });
      queryClient.invalidateQueries({ queryKey: ['vibe-count'] });
    },
  });
};

// 콘텐츠의 좋아요 수 업데이트 헬퍼 함수
const updateContentVibeCount = async (
  contentId: string, 
  contentType: VibeContentType, 
  operation: 'increment' | 'decrement'
) => {
  const tables = {
    project: 'projects',
    tip: 'tips',
    post: 'posts',
    comment: 'comments',
  } as const;

  const tableName = tables[contentType];
  if (!tableName) return;

  const { error } = await supabase
    .from(tableName)
    .update({ 
      vibe_count: operation === 'increment' 
        ? supabase.rpc('increment', { current_count: 'vibe_count' })
        : supabase.rpc('decrement', { current_count: 'vibe_count' })
    })
    .eq('id', contentId);

  if (error) {
    console.error(`Error updating ${contentType} vibe count:`, error);
    throw error;
  }
};

// 실시간 좋아요 수 업데이트 (최적화된 버전)
export const useRealtimeVibes = (contentId: string, contentType: VibeContentType) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!contentId || !contentType) return;

    let isSubscribed = true;
    const channelName = `vibes:${contentType}:${contentId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vibes',
        filter: `content_id=eq.${contentId}`,
      }, async (payload) => {
        if (!isSubscribed) return;

        // 더 효율적인 업데이트: 페이로드 이벤트 타입에 따라 처리
        try {
          if (payload.eventType === 'INSERT') {
            // 좋아요 추가 시 카운트 증가
            queryClient.setQueryData(
              ['vibe-count', contentType, contentId], 
              (old: number = 0) => old + 1
            );
          } else if (payload.eventType === 'DELETE') {
            // 좋아요 제거 시 카운트 감소
            queryClient.setQueryData(
              ['vibe-count', contentType, contentId], 
              (old: number = 0) => Math.max(0, old - 1)
            );
          } else {
            // UPDATE 또는 기타 경우에만 서버에서 다시 조회
            const { count } = await supabase
              .from('vibes')
              .select('*', { count: 'exact', head: true })
              .eq('content_id', contentId)
              .eq('content_type', contentType);

            if (isSubscribed) {
              queryClient.setQueryData(['vibe-count', contentType, contentId], count || 0);
            }
          }

          // 사용자의 좋아요 상태 갱신 (throttled)
          if (isSubscribed) {
            queryClient.invalidateQueries({ 
              queryKey: ['vibe-status', contentType, contentId] 
            });
          }
        } catch (error) {
          console.error('Error handling realtime vibe update:', error);
          
          // 에러 발생 시 전체 데이터 다시 조회
          if (isSubscribed) {
            queryClient.invalidateQueries({ 
              queryKey: ['vibe-count', contentType, contentId] 
            });
            queryClient.invalidateQueries({ 
              queryKey: ['vibe-status', contentType, contentId] 
            });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to vibes for ${contentType}:${contentId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to vibes for ${contentType}:${contentId}`);
        }
      });

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, queryClient]);
};

// Debounced 좋아요 토글 (중복 클릭 방지)
export const useDebouncedToggleVibe = (delay: number = 300) => {
  const toggleVibe = useToggleVibe();
  
  const debouncedToggle = useCallback(
    debounce((params: VibeToggleParams) => {
      toggleVibe.mutate(params);
    }, delay),
    [toggleVibe, delay]
  );

  return {
    ...toggleVibe,
    mutate: debouncedToggle,
  };
};

// Debounce 헬퍼 함수
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 사용자의 전체 좋아요 받은 수 조회
export const useUserTotalVibes = (userId: string) => {
  return useQuery({
    queryKey: ['user-total-vibes', userId],
    queryFn: async () => {
      if (!userId) return 0;

      // 사용자가 작성한 모든 콘텐츠의 좋아요 수 합계
      const [projectVibes, tipVibes, postVibes, commentVibes] = await Promise.all([
        // 프로젝트 좋아요
        supabase
          .from('projects')
          .select('vibe_count')
          .eq('user_id', userId),
        // 팁 좋아요
        supabase
          .from('tips')
          .select('vibe_count')
          .eq('user_id', userId),
        // 포스트 좋아요
        supabase
          .from('posts')
          .select('vibe_count')
          .eq('user_id', userId),
        // 댓글 좋아요
        supabase
          .from('comments')
          .select('vibe_count')
          .eq('user_id', userId),
      ]);

      let totalVibes = 0;

      if (projectVibes.data) {
        totalVibes += projectVibes.data.reduce((sum, item) => sum + (item.vibe_count || 0), 0);
      }
      if (tipVibes.data) {
        totalVibes += tipVibes.data.reduce((sum, item) => sum + (item.vibe_count || 0), 0);
      }
      if (postVibes.data) {
        totalVibes += postVibes.data.reduce((sum, item) => sum + (item.vibe_count || 0), 0);
      }
      if (commentVibes.data) {
        totalVibes += commentVibes.data.reduce((sum, item) => sum + (item.vibe_count || 0), 0);
      }

      return totalVibes;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};