import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Tip, Comment } from '@/lib/supabase-types';
import { toast } from 'sonner';

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
  });
};

export const useCreateTipComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    onError: (error) => {
      console.error('Create tip comment error:', error);
      toast.error('댓글 작성에 실패했습니다.');
    },
  });
};

export const useIsTipVibed = (tipId: string) => {
  const { user } = useAuth();

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
  const { user } = useAuth();

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
    onError: (error) => {
      console.error('Vibe tip error:', error);
      toast.error('Vibe 상태 변경에 실패했습니다.');
    },
  });
};

export const useIsTipBookmarked = (tipId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-tip-bookmarked', user?.id, tipId],
    queryFn: async () => {
      if (!user) return false;

      // Note: You'll need to create a bookmarks table if it doesn't exist
      // For now, we'll just return false
      return false;
    },
    enabled: !!user && !!tipId,
  });
};

export const useBookmarkTip = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tipId, isBookmarked }: { tipId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      // Note: You'll need to implement bookmark functionality
      // For now, we'll just simulate it
      return !isBookmarked;
    },
    onSuccess: (newBookmarkedStatus, { tipId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-tip-bookmarked', user?.id, tipId] });
      toast.success(newBookmarkedStatus ? '북마크에 추가됨!' : '북마크에서 제거됨');
    },
    onError: (error) => {
      console.error('Bookmark tip error:', error);
      toast.error('북마크 상태 변경에 실패했습니다.');
    },
  });
};