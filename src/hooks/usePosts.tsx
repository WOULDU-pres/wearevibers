import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Post, Comment } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';

interface PostFilters {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'comments';
}

export const usePosts = (filters: PostFilters = {}) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: async () => {
      console.warn('🔍 Starting Posts query with filters:', filters);
      
      // Create a Promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RLS_TIMEOUT: Posts query timed out - likely RLS permission issue'));
        }, 5000);
      });

      try {
        // First, try a very simple query to test RLS with timeout
        console.warn('🧪 Testing basic posts table access...');
        
        const testQueryPromise = supabase
          .from('posts')
          .select('id, title')
          .limit(1);
        
        // Race between the query and timeout
        const testQuery = await Promise.race([testQueryPromise, timeoutPromise]);
        
        console.warn('🧪 Basic posts query _result:', testQuery);
        
        if (testQuery.error) {
          console.error('❌ Basic posts query failed:', testQuery.error);
          throw testQuery.error;
        }
        
        // If basic query works, proceed with full query
        console.warn('✅ Basic query successful, proceeding with full query...');
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles(
              id,
              username,
              full_name,
              avatar_url,
            )
          `);

        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'popular':
            query = query.order('vibe_count', { ascending: false });
            break;
          case 'comments':
            query = query.order('comment_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        console.warn('🔍 Executing full posts query...');
        const fullQueryPromise = query;
        const { data, error } = await Promise.race([fullQueryPromise, timeoutPromise]);
        
        console.warn('📊 Full posts query _result:', { data, error, count: data?.length });

        if (error) {
          console.error('❌ Error fetching posts:', error);
          
          if (isAuthError(error)) {
            await handleAuthError(error);
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          
          throw error;
        }

        console.warn('✅ Posts query successful, returning data');
        return data as (Post & {
          profiles: {
            id: string;
            username: string;
            full_name: string | null;
            avatar_url: string | null;
          };
        })[];
      } catch (error) {
        console.error('💥 Posts query failed:', error);
        
        // If it's a timeout error, return empty array to show EmptyState
        if (error.message?.includes('RLS_TIMEOUT')) {
          console.warn('🚨 RLS timeout detected - showing empty state instead of hanging forever');
          return [];
        }
        
        throw error;
      }
    },
    retry: (failureCount, error) => {
      console.warn('🔄 Posts retry attempt:', failureCount, 'Error:', error);
      
      // Don't retry RLS timeout errors
      if (error?.message?.includes('RLS_TIMEOUT')) {
        return false;
      }
      
      return authAwareRetry(failureCount, error);
    },
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data as Post & {
        profiles: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
        };
      };
    },
    enabled: !!postId,
    retry: authAwareRetry,
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', 'post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('content_id', postId)
        .eq('content_type', 'post')
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        
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
    enabled: !!postId,
    retry: authAwareRetry,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          content_id: postId,
          content_type: 'post',
          user_id: user.id,
        })
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }

      // Update comment count
      await supabase.rpc('increment_comment_count', {
        content_id: postId,
        content_type: 'post'
      });

      return data;
    },
    onSuccess: (data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('댓글이 작성되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('댓글 작성에 실패했습니다.'),
  });
};

export const useIsPostVibed = (postId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-post-vibed', user?.id, postId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('vibes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', postId)
        .eq('content_type', 'post')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking vibe status:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!postId,
    retry: authAwareRetry,
  });
};

export const useVibePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ postId, isVibed }: { postId: string; isVibed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isVibed) {
        // Remove vibe
        const { error } = await supabase
          .from('vibes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', postId)
          .eq('content_type', 'post');

        if (error) {
          console.error('Error removing vibe:', error);
          throw error;
        }

        // Update vibe count
        await supabase.rpc('decrement_vibe_count', {
          content_id: postId,
          content_type: 'post'
        });

        return false;
      } else {
        // Add vibe
        const { error } = await supabase
          .from('vibes')
          .insert({
            user_id: user.id,
            content_id: postId,
            content_type: 'post',
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violation
          console.error('Error adding vibe:', error);
          throw error;
        }

        // Update vibe count
        await supabase.rpc('increment_vibe_count', {
          content_id: postId,
          content_type: 'post'
        });

        return true;
      }
    },
    onSuccess: (newVibedStatus, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-post-vibed', user?.id, postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success(newVibedStatus ? 'Vibe 추가됨! 🎉' : 'Vibe 제거됨');
    },
    onError: createAuthAwareMutationErrorHandler('Vibe 상태 변경에 실패했습니다.'),
  });
};

export const useIsCommentVibed = (commentId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-comment-vibed', user?.id, commentId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('vibes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', commentId)
        .eq('content_type', 'comment')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking comment vibe status:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!commentId,
    retry: authAwareRetry,
  });
};

export const useVibeComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ commentId, postId, isVibed }: { commentId: string; postId: string; isVibed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isVibed) {
        // Remove vibe
        const { error } = await supabase
          .from('vibes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', commentId)
          .eq('content_type', 'comment');

        if (error) {
          console.error('Error removing comment vibe:', error);
          throw error;
        }

        // Update comment vibe count
        await supabase.rpc('decrement_comment_vibe_count', {
          comment_id: commentId
        });

        return false;
      } else {
        // Add vibe
        const { error } = await supabase
          .from('vibes')
          .insert({
            user_id: user.id,
            content_id: commentId,
            content_type: 'comment',
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violation
          console.error('Error adding comment vibe:', error);
          throw error;
        }

        // Update comment vibe count
        await supabase.rpc('increment_comment_vibe_count', {
          comment_id: commentId
        });

        return true;
      }
    },
    onSuccess: (newVibedStatus, { commentId, postId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-comment-vibed', user?.id, commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] });
    },
    onError: createAuthAwareMutationErrorHandler('댓글 Vibe 상태 변경에 실패했습니다.'),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      category: string;
      image_urls?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
        })
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('게시글이 성공적으로 작성되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('게시글 작성에 실패했습니다.'),
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ postId, postData }: {
      postId: string;
      postData: {
        title?: string;
        content?: string;
        category?: string;
        image_urls?: string[];
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', data.id] });
      toast.success('게시글이 성공적으로 수정되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('게시글 수정에 실패했습니다.'),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('게시글이 성공적으로 삭제되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('게시글 삭제에 실패했습니다.'),
  });
};