import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Project } from '@/lib/supabase-types';
import { toast } from 'sonner';
import { isAuthError, handleAuthError, authAwareRetry, createAuthAwareMutationErrorHandler as _createAuthAwareMutationErrorHandler } from '@/lib/authErrorHandler';
import { safeGetUserProjects, executeWithRLSTimeout } from '@/lib/rlsHelper';

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
      console.warn('🔍 Starting projects query with filters:', filters);
      
      // 단순화된 쿼리 - JOIN 없이 프로젝트만 먼저 조회
      let query = supabase
        .from('projects')
        .select('*')
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

      // RLS 타임아웃 방지 래퍼 사용
      const { data, _error, isTimeout, wasFixed } = await executeWithRLSTimeout(
        query,
        3000, // 3초 타임아웃
        []
      );
      
      if (isTimeout) {
        console.warn('⏰ Projects query timed out - returning empty array');
        return [];
      }
      
      if (error) {
        console.error('❌ Error fetching projects:', error);
        
        // 인증 에러인 경우 처리
        if (isAuthError(error)) {
          await handleAuthError(error);
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        throw error;
      }
      
      if (wasFixed) {
        console.warn('✅ Projects query succeeded after RLS fix');
      }
      
      const projects = data as Project[];
      console.warn(`📊 Projects query successful: ${projects.length} projects found`);
      
      // 프로필 정보를 별도로 조회하여 병합 (선택사항)
      if (projects.length > 0) {
        try {
          const userIds = [...new Set(projects.map(p => p.user_id))];
          const { _data: profiles } = await executeWithRLSTimeout(
            supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .in('id', userIds),
            2000,
            []
          );
          
          // 프로필 정보를 프로젝트에 병합
          const profilesMap = new Map((profiles as Profile[])?.map(p => [p.id, p]) || []);
          
          return projects.map(project => ({
            ...project,
            profiles: profilesMap.get(project.user_id) || {
              id: project.user_id,
              username: 'Unknown User',
              full_name: null,
              avatar_url: null
            }
          }));
        } catch (profileError) {
          console.warn('⚠️ Profile fetch failed, returning projects without profile info:', profileError);
          // 프로필 조회 실패해도 프로젝트는 반환
          return projects.map(project => ({
            ...project,
            profiles: {
              id: project.user_id,
              username: 'Unknown User',
              full_name: null,
              avatar_url: null
            }
          }));
        }
      }
      
      return projects;
    },
    retry: authAwareRetry,
    // 캐싱 설정 개선
    staleTime: 1000 * 60 * 2, // 2분
    cacheTime: 1000 * 60 * 5, // 5분
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
            avatar_url,
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

      const { data: _data, error } = await query;
      
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
        projects: _data as Project[],
        nextCursor: _data.length === PROJECTS_PER_PAGE ? pageParam + 1 : undefined,
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
      const { data, _error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            bio,
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

      console.warn('🔍 Starting MyProjects query for user:', user.id);

      try {
        // Use safe projects fetcher with built-in RLS handling
        console.warn('🔍 Using safeGetUserProjects with built-in RLS protection...');
        
        const { data, _error, isTimeout } = await safeGetUserProjects(user.id);
        console.warn('📊 SafeGetUserProjects _result:', { _data: _data?.length || 0, error, isTimeout });
        
        if (isTimeout) {
          console.warn('⏰ Projects query timed out - returning empty array for better UX');
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

        console.warn('✅ MyProjects query successful:', data?.length || 0, 'projects found');
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

      const { data, _error } = await supabase
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

      const { data, _error } = await supabase
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
      const { _error: updateError } = await supabase.rpc('increment_vibe_count', {
        project_id: projectId
      });

      if (updateError) {
        console.error('Error updating vibe count:', updateError);
        throw updateError;
      }

      // Then record the vibe in the vibes table
      const { _error: insertError } = await supabase
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