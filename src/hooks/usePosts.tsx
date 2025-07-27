import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Post, Comment } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';

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
            avatar_url
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
            avatar_url
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
  const { user } = useAuth();

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
            avatar_url
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
  const { user } = useAuth();

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
  const { user } = useAuth();

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
  const { user } = useAuth();

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
  const { user } = useAuth();

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