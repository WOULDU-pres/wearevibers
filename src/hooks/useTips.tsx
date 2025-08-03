import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Tip, Comment } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';

interface TipFilters {
  category?: string;
  difficulty?: number;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
}

export const useTips = (filters: TipFilters = {}) => {
  return useQuery({
    queryKey: ['tips', filters],
    queryFn: async () => {
      console.warn('🔍 Starting Tips query with filters:', filters);
      
      // Create a Promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RLS_TIMEOUT: Tips query timed out - likely RLS permission issue'));
        }, 5000);
      });

      try {
        // First, try a very simple query to test RLS with timeout
        console.warn('🧪 Testing basic tips table access...');
        
        const testQueryPromise = supabase
          .from('tips')
          .select('id, title')
          .limit(1);
        
        // Race between the query and timeout
        const testQuery = await Promise.race([testQueryPromise, timeoutPromise]);
        
        console.warn('🧪 Basic tips query _result:', testQuery);
        
        if (testQuery.error) {
          console.error('❌ Basic tips query failed:', testQuery.error);
          throw testQuery.error;
        }
        
        // If basic query works, proceed with full query
        console.warn('✅ Basic query successful, proceeding with full query...');
        
        let query = supabase
          .from('tips')
          .select(`
            *,
            profiles(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'published');

        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.difficulty) {
          query = query.eq('difficulty_level', filters.difficulty);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'popular':
            query = query.order('vibe_count', { ascending: false });
            break;
          case 'trending':
            query = query.order('view_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        console.warn('🔍 Executing full query...');
        const fullQueryPromise = query;
        const { data, error } = await Promise.race([fullQueryPromise, timeoutPromise]);
        
        console.warn('📊 Full query _result:', { data, error, count: data?.length });

        if (error) {
          console.error('❌ Error fetching tips:', error);
          
          if (isAuthError(error)) {
            await handleAuthError(error);
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          
          throw error;
        }

        console.warn('✅ Tips query successful, returning data');
        return data as (Tip & {
          profiles: {
            id: string;
            username: string;
            full_name: string | null;
            avatar_url: string | null;
          };
        })[];
      } catch (error) {
        console.error('💥 Tips query failed:', error);
        
        // If it's a timeout error, return empty array to show EmptyState
        if (error.message?.includes('RLS_TIMEOUT')) {
          console.warn('🚨 RLS timeout detected - showing empty state instead of hanging forever');
          return [];
        }
        
        throw error;
      }
    },
    retry: (failureCount, error) => {
      console.warn('🔄 Retry attempt:', failureCount, 'Error:', error);
      
      // Don't retry RLS timeout errors
      if (error?.message?.includes('RLS_TIMEOUT')) {
        return false;
      }
      
      // Don't retry timeout errors or auth errors
      if (error?.message?.includes('시간이 초과') || isAuthError(error)) {
        return false;
      }
      return authAwareRetry(failureCount, error);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTip = (tipId: string) => {
  return useQuery({
    queryKey: ['tip', tipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', tipId)
        .single();

      if (error) {
        console.error('Error fetching tip:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data as Tip & {
        profiles: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
        };
      };
    },
    enabled: !!tipId,
    retry: authAwareRetry,
  });
};

export const useTipComments = (tipId: string) => {
  return useQuery({
    queryKey: ['comments', 'tip', tipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('content_id', tipId)
        .eq('content_type', 'tip')
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tip comments:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data as (Comment & {
        profiles: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
        };
      })[];
    },
    enabled: !!tipId,
    retry: authAwareRetry,
  });
};

export const useCreateTipComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ tipId, content }: { tipId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          content_id: tipId,
          content_type: 'tip',
          user_id: user.id,
        })
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating tip comment:', error);
        throw error;
      }

      // Update comment count
      await supabase.rpc('increment_comment_count', {
        content_id: tipId,
        content_type: 'tip'
      });

      return data;
    },
    onSuccess: (data, { tipId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'tip', tipId] });
      queryClient.invalidateQueries({ queryKey: ['tip', tipId] });
      toast.success('댓글이 작성되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('댓글 작성에 실패했습니다.'),
  });
};

export const useIsTipVibed = (tipId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-tip-vibed', user?.id, tipId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('vibes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', tipId)
        .eq('content_type', 'tip')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tip vibe status:', error);
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!tipId,
  });
};

export const useVibeTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ tipId, isVibed }: { tipId: string; isVibed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isVibed) {
        // Remove vibe
        const { error } = await supabase
          .from('vibes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', tipId)
          .eq('content_type', 'tip');

        if (error) {
          console.error('Error removing tip vibe:', error);
          throw error;
        }

        // Update vibe count
        await supabase.rpc('decrement_vibe_count', {
          content_id: tipId,
          content_type: 'tip'
        });

        return false;
      } else {
        // Add vibe
        const { error } = await supabase
          .from('vibes')
          .insert({
            user_id: user.id,
            content_id: tipId,
            content_type: 'tip',
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violation
          console.error('Error adding tip vibe:', error);
          throw error;
        }

        // Update vibe count
        await supabase.rpc('increment_vibe_count', {
          content_id: tipId,
          content_type: 'tip'
        });

        return true;
      }
    },
    onSuccess: (newVibedStatus, { tipId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-tip-vibed', user?.id, tipId] });
      queryClient.invalidateQueries({ queryKey: ['tip', tipId] });
      toast.success(newVibedStatus ? 'Vibe 추가됨! 🎉' : 'Vibe 제거됨');
    },
    onError: createAuthAwareMutationErrorHandler('Vibe 상태 변경에 실패했습니다.'),
  });
};

export const useIsTipBookmarked = (tipId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-tip-bookmarked', user?.id, tipId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', tipId)
        .eq('content_type', 'tip')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking tip bookmark status:', error);
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!tipId,
    retry: authAwareRetry,
  });
};

export const useBookmarkTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ tipId, isBookmarked }: { tipId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', tipId)
          .eq('content_type', 'tip');

        if (error) {
          console.error('Error removing tip bookmark:', error);
          throw error;
        }

        // Update bookmark count
        await supabase.rpc('decrement_bookmark_count', {
          content_id: tipId,
          content_type: 'tip'
        });

        return false;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            content_id: tipId,
            content_type: 'tip',
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violation
          console.error('Error adding tip bookmark:', error);
          throw error;
        }

        // Update bookmark count
        await supabase.rpc('increment_bookmark_count', {
          content_id: tipId,
          content_type: 'tip'
        });

        return true;
      }
    },
    onSuccess: (newBookmarkedStatus, { tipId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-tip-bookmarked', user?.id, tipId] });
      queryClient.invalidateQueries({ queryKey: ['tip', tipId] });
      toast.success(newBookmarkedStatus ? '북마크에 추가됨!' : '북마크에서 제거됨');
    },
    onError: createAuthAwareMutationErrorHandler('북마크 상태 변경에 실패했습니다.'),
  });
};

export const useCreateTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (tipData: {
      title: string;
      content: string;
      category: string;
      difficulty_level: number;
      read_time?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tips')
        .insert({
          ...tipData,
          user_id: user.id,
          status: 'published',
        })
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating tip:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success('팁이 성공적으로 게시되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('팁 게시에 실패했습니다.'),
  });
};

export const useUpdateTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ tipId, tipData }: {
      tipId: string;
      tipData: {
        title?: string;
        content?: string;
        category?: string;
        difficulty_level?: number;
        read_time?: number;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tips')
        .update({
          ...tipData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tipId)
        .eq('user_id', user.id)
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating tip:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['tip', data.id] });
      toast.success('팁이 성공적으로 수정되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('팁 수정에 실패했습니다.'),
  });
};

export const useDeleteTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (tipId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tips')
        .delete()
        .eq('id', tipId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting tip:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      toast.success('팁이 성공적으로 삭제되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('팁 삭제에 실패했습니다.'),
  });
};