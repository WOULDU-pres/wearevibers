import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// 팔로우 상태 확인
export const useIsFollowing = (userId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-following', userId, user?.id],
    queryFn: async () => {
      if (!user || !userId || user.id === userId) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!userId && user.id !== userId,
    retry: authAwareRetry,
  });
};

// 팔로워 수 조회
export const useFollowerCount = (userId: string) => {
  return useQuery({
    queryKey: ['follower-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching follower count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

// 팔로잉 수 조회
export const useFollowingCount = (userId: string) => {
  return useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

// 팔로워 목록 조회
export const useFollowers = (userId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['followers', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          profiles!follows_follower_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            bio,
            is_online,
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching followers:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

// 팔로잉 목록 조회
export const useFollowing = (userId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['following', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          profiles!follows_following_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            bio,
            is_online,
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching following:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

// 팔로우 토글 (낙관적 업데이트 포함)
export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      if (user.id === userId) throw new Error('Cannot follow yourself');

      if (isFollowing) {
        // 언팔로우
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) {
          console.error('Error unfollowing user:', error);
          throw error;
        }

        // 사용자 프로필의 팔로워 수 감소
        await updateUserFollowerCount(userId, 'decrement');
        // 현재 사용자의 팔로잉 수 감소  
        await updateUserFollowingCount(user.id, 'decrement');
      } else {
        // 팔로우
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error && error.code !== '23505') { // 중복 팔로우 무시
          console.error('Error following user:', error);
          throw error;
        }

        // 사용자 프로필의 팔로워 수 증가
        await updateUserFollowerCount(userId, 'increment');
        // 현재 사용자의 팔로잉 수 증가
        await updateUserFollowingCount(user.id, 'increment');
      }

      return !isFollowing;
    },
    onMutate: async ({ userId, isFollowing }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: ['is-following', userId, user?.id] });
      await queryClient.cancelQueries({ queryKey: ['follower-count', userId] });
      await queryClient.cancelQueries({ queryKey: ['following-count', user?.id] });

      // 이전 값들 저장
      const previousFollowStatus = queryClient.getQueryData(['is-following', userId, user?.id]);
      const previousFollowerCount = queryClient.getQueryData(['follower-count', userId]);
      const previousFollowingCount = queryClient.getQueryData(['following-count', user?.id]);

      // 낙관적으로 상태 업데이트
      queryClient.setQueryData(['is-following', userId, user?.id], !isFollowing);
      
      if (typeof previousFollowerCount === 'number') {
        queryClient.setQueryData(
          ['follower-count', userId], 
          isFollowing ? previousFollowerCount - 1 : previousFollowerCount + 1
        );
      }
      
      if (typeof previousFollowingCount === 'number') {
        queryClient.setQueryData(
          ['following-count', user?.id], 
          isFollowing ? previousFollowingCount - 1 : previousFollowingCount + 1
        );
      }

      return { 
        previousFollowStatus, 
        previousFollowerCount, 
        previousFollowingCount, 
        userId,
      };
    },
    onError: (error, variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousFollowStatus !== undefined) {
        queryClient.setQueryData(
          ['is-following', context.userId, user?.id], 
          context.previousFollowStatus
        );
      }
      if (context?.previousFollowerCount !== undefined) {
        queryClient.setQueryData(
          ['follower-count', context.userId], 
          context.previousFollowerCount
        );
      }
      if (context?.previousFollowingCount !== undefined) {
        queryClient.setQueryData(
          ['following-count', user?.id], 
          context.previousFollowingCount
        );
      }

      console.error('Error toggling follow:', error);
      
      if (isAuthError(error)) {
        handleAuthError(error);
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        toast.error('팔로우 처리에 실패했습니다. 다시 시도해주세요.');
      }
    },
    onSuccess: (newFollowState, variables) => {
      // 관련 쿼리들 무효화하여 서버 상태와 동기화
      queryClient.invalidateQueries({ queryKey: ['is-following', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['following-count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });

      // 사용자 프로필도 갱신
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });

      const message = newFollowState ? '팔로우했습니다! 👥' : '언팔로우했습니다.';
      toast.success(message);
    },
    onSettled: () => {
      // 완료 후 데이터 동기화
      queryClient.invalidateQueries({ queryKey: ['is-following'] });
      queryClient.invalidateQueries({ queryKey: ['follower-count'] });
      queryClient.invalidateQueries({ queryKey: ['following-count'] });
    },
  });
};

// 사용자 팔로워 수 업데이트 헬퍼 함수
const updateUserFollowerCount = async (userId: string, operation: 'increment' | 'decrement') => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      follower_count: operation === 'increment' 
        ? supabase.rpc('increment', { current_count: 'follower_count' })
        : supabase.rpc('decrement', { current_count: 'follower_count' })
    })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating user follower count:`, error);
    throw error;
  }
};

// 사용자 팔로잉 수 업데이트 헬퍼 함수
const updateUserFollowingCount = async (userId: string, operation: 'increment' | 'decrement') => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      following_count: operation === 'increment' 
        ? supabase.rpc('increment', { current_count: 'following_count' })
        : supabase.rpc('decrement', { current_count: 'following_count' })
    })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating user following count:`, error);
    throw error;
  }
};

// 실시간 팔로우 업데이트
export const useRealtimeFollows = (userId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`follows:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      }, async () => {
        // 팔로워 수 실시간 업데이트
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);

        queryClient.setQueryData(['follower-count', userId], count || 0);
        
        // 팔로워 목록도 갱신
        queryClient.invalidateQueries({ queryKey: ['followers', userId] });
        queryClient.invalidateQueries({ queryKey: ['is-following'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};

// 온라인 사용자 수 조회
export const useOnlineUsersCount = () => {
  return useQuery({
    queryKey: ['online-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      if (error) {
        console.error('Error fetching online users count:', error);
        return 0;
      }

      return count || 0;
    },
    retry: authAwareRetry,
    refetchInterval: 30000, // 30초마다 갱신
  });
};

// 상호 팔로우 관계 확인
export const useMutualFollows = (userId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['mutual-follows', userId, user?.id],
    queryFn: async () => {
      if (!user || !userId || user.id === userId) return [];

      // 내가 팔로우하는 사람들 중에서 해당 사용자도 팔로우하는 사람들 찾기
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('follower_id', user.id)
        .in('following_id', 
          // 해당 사용자가 팔로우하는 사람들의 ID 목록
          supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId)
        );

      if (error) {
        console.error('Error fetching mutual follows:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user && !!userId && user.id !== userId,
    retry: authAwareRetry,
  });
};

// 팔로우 추천 (팔로우하지 않는 활성 사용자들)
export const useFollowSuggestions = (limit: number = 10) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['follow-suggestions', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      // 현재 팔로우하지 않는 활성 사용자들 조회
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          follower_count,
          project_count,
          is_online,
        `)
        .neq('id', user.id)
        .not('id', 'in', 
          // 이미 팔로우한 사용자들 제외
          supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)
        )
        .order('follower_count', { ascending: false })
        .order('project_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching follow suggestions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
    retry: authAwareRetry,
  });
};