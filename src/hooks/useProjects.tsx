import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Project } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';
import { safeGetUserProjects } from '@/lib/rlsHelper';

export interface ProjectFilters {
  tech_stack?: string[];
  difficulty_level?: number;
  user_id?: string;
  search?: string;
}

const PROJECTS_PER_PAGE = 6;

export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.tech_stack && filters.tech_stack.length > 0) {
        query = query.overlaps('tech_stack', filters.tech_stack);
      }

      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching projects:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }
      
      return data as Project[];
    },
    retry: authAwareRetry,
  });
};

export const useInfiniteProjects = (filters?: ProjectFilters) => {
  return useInfiniteQuery({
    queryKey: ['projects', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(pageParam * PROJECTS_PER_PAGE, (pageParam + 1) * PROJECTS_PER_PAGE - 1);

      // Apply filters
      if (filters?.tech_stack && filters.tech_stack.length > 0) {
        query = query.overlaps('tech_stack', filters.tech_stack);
      }

      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching projects:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }
      
      return {
        projects: data as Project[],
        nextCursor: data.length === PROJECTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
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
            bio
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }

      return data as Project;
    },
    enabled: !!projectId,
    retry: authAwareRetry,
  });
};

export const useMyProjects = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['projects', 'my', user?.id],
    queryFn: async () => {
      if (!user) {
        console.warn('⚠️ useMyProjects: No user found');
        throw new Error('User not authenticated');
      }

      console.log('🔍 Starting MyProjects query for user:', user.id);

      try {
        // Use safe projects fetcher with built-in RLS handling
        console.log('🔍 Using safeGetUserProjects with built-in RLS protection...');
        
        const { data, error, isTimeout } = await safeGetUserProjects(user.id);
        console.log('📊 SafeGetUserProjects result:', { data: data?.length || 0, error, isTimeout });
        
        if (isTimeout) {
          console.log('⏰ Projects query timed out - returning empty array for better UX');
          return [];
        }
        
        if (error) {
          console.error('❌ Error fetching my projects:', error);
          
          // Handle authentication errors
          if (isAuthError(error)) {
            await handleAuthError(error);
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
          
          throw error;
        }

        console.log('✅ MyProjects query successful:', data?.length || 0, 'projects found');
        return (data || []) as Project[];
        
      } catch (error) {
        console.error('💥 MyProjects query failed:', error);
        
        // If it's our RLS timeout, return empty array for better UX
        if (error.message?.includes('RLS_TIMEOUT')) {
          console.warn('🚨 RLS timeout in catch block - returning empty array');
          return [];
        }
        
        // Re-throw other errors
        throw error;
      }
    },
    enabled: !!user,
    retry: authAwareRetry,
    // Add some additional options for better UX
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'vibe_count' | 'profiles'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 성공적으로 생성되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('프로젝트 생성에 실패했습니다.'),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ projectId, updates }: { 
      projectId: string; 
      updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'profiles'>>
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id) // Ensure user can only update their own projects
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast.success('프로젝트가 성공적으로 수정되었습니다!');
    },
    onError: createAuthAwareMutationErrorHandler('프로젝트 수정에 실패했습니다.'),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id); // Ensure user can only delete their own projects

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('프로젝트가 성공적으로 삭제되었습니다.');
    },
    onError: createAuthAwareMutationErrorHandler('프로젝트 삭제에 실패했습니다.'),
  });
};

export const useVibeProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, increment the vibe count
      const { error: updateError } = await supabase.rpc('increment_vibe_count', {
        project_id: projectId
      });

      if (updateError) {
        console.error('Error updating vibe count:', updateError);
        throw updateError;
      }

      // Then record the vibe in the vibes table
      const { error: insertError } = await supabase
        .from('vibes')
        .insert({
          user_id: user.id,
          project_id: projectId,
        });

      if (insertError && insertError.code !== '23505') { // Ignore unique constraint violation
        console.error('Error recording vibe:', insertError);
        throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Vibe 추가됨! 🎉');
    },
    onError: createAuthAwareMutationErrorHandler('Vibe 추가에 실패했습니다.'),
  });
};