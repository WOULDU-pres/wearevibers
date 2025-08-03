import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Profile } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';
import { handleSupabaseError } from '@/lib/sentry';

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Sentry로 에러 리포팅
        handleSupabaseError(error, {
          method: 'GET',
          endpoint: 'profiles',
          context: 'useProfile',
          userId,
        });
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data as Profile;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

export const useProfileStats = (userId: string) => {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      try {
        // Get projects count
        const { count: projectsCount, error: projectsError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'published');

        if (projectsError) {
          handleSupabaseError(projectsError, {
            method: 'GET',
            endpoint: 'projects',
            context: 'useProfileStats',
            userId,
          });
          
          if (isAuthError(projectsError)) {
            await handleAuthError(projectsError);
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw projectsError;
        }

        // Get total vibes count across all user content
        const { data: vibesData, error: vibesError } = await supabase
          .from('vibes')
          .select('content_id, content_type')
          .or(`and(content_type.eq.project,content_id.in.(${
            await supabase
              .from('projects')
              .select('id')
              .eq('user_id', userId)
              .then(({ data }) => data?.map(p => p.id).join(',') || '')
          })),and(content_type.eq.post,content_id.in.(${
            await supabase
              .from('posts')
              .select('id')
              .eq('user_id', userId)
              .then(({ data }) => data?.map(p => p.id).join(',') || '')
          })),and(content_type.eq.tip,content_id.in.(${
            await supabase
              .from('tips')
              .select('id')
              .eq('user_id', userId)
              .then(({ data }) => data?.map(t => t.id).join(',') || '')
          }))`);

        if (vibesError) {
          if (isAuthError(vibesError)) {
            await handleAuthError(vibesError);
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw vibesError;
        }

        return {
          projects: projectsCount || 0,
          vibes: vibesData?.length || 0,
        };
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        throw error;
      }
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

export const useIsFollowing = (targetUserId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['is-following', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || user.id === targetUserId) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
    retry: authAwareRetry,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          console.error('Error unfollowing user:', error);
          throw error;
        }

        // Update follower count
        await supabase.rpc('decrement_follower_count', {
          user_id: targetUserId
        });

        // Update following count
        await supabase.rpc('decrement_following_count', {
          user_id: user.id
        });

        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) {
          console.error('Error following user:', error);
          throw error;
        }

        // Update follower count
        await supabase.rpc('increment_follower_count', {
          user_id: targetUserId
        });

        // Update following count
        await supabase.rpc('increment_following_count', {
          user_id: user.id
        });

        return true;
      }
    },
    onSuccess: (newFollowingStatus, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
      toast.success(newFollowingStatus ? '팔로우했습니다!' : '언팔로우했습니다.');
    },
    onError: createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler('팔로우 상태 변경에 실패했습니다.'),
  });
};

export const useUserProjects = (userId: string) => {
  return useQuery({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user projects:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};

export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ['user-posts', userId],
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching user posts:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    retry: authAwareRetry,
  });
};