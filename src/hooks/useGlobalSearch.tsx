import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isAuthError, handleAuthError, authAwareRetry } from '@/lib/authErrorHandler';
import type { Tables } from '@/lib/supabase-types';

type Project = Tables<'projects'>;
type Tip = Tables<'tips'>;
type Profile = Tables<'profiles'>;

interface SearchResults {
  projects: (Project & {
    profiles: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  })[];
  tips: (Tip & {
    profiles: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  })[];
  users: Profile[];
}

interface GlobalSearchOptions {
  query: string;
  limit?: number;
  filters?: {
    contentTypes?: ('projects' | 'tips' | 'users')[];
    techStack?: string[];
    category?: string[];
    dateRange?: [Date, Date];
  };
  sortBy?: 'newest' | 'popular' | 'trending' | 'relevance';
}

const searchProjects = async (searchQuery: string, limit: number = 10) => {
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
    .eq('status', 'published');

  // Full text search on title and description
  query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching projects:', error);
    if (isAuthError(error)) {
      await handleAuthError(error);
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw error;
  }

  return data || [];
};

const searchTips = async (searchQuery: string, limit: number = 10) => {
  let query = supabase
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
    .eq('status', 'published');

  // Full text search on title and content
  query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching tips:', error);
    if (isAuthError(error)) {
      await handleAuthError(error);
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw error;
  }

  return data || [];
};

const searchUsers = async (searchQuery: string, limit: number = 10) => {
  let query = supabase
    .from('profiles')
    .select('*');

  // Search in username, full_name, and bio
  query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching users:', error);
    if (isAuthError(error)) {
      await handleAuthError(error);
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw error;
  }

  return data || [];
};

export const useGlobalSearch = (options: GlobalSearchOptions) => {
  const { query: searchQuery, limit = 10, filters, sortBy = 'newest' } = options;

  return useQuery({
    queryKey: ['globalSearch', searchQuery, limit, filters, sortBy],
    queryFn: async (): Promise<SearchResults> => {
      const searchTerm = searchQuery.trim();
      
      if (searchTerm.length < 2) {
        return { projects: [], tips: [], users: [] };
      }

      const contentTypes = filters?.contentTypes || ['projects', 'tips', 'users'];
      
      const results = await Promise.allSettled([
        contentTypes.includes('projects') ? searchProjects(searchTerm, limit) : Promise.resolve([]),
        contentTypes.includes('tips') ? searchTips(searchTerm, limit) : Promise.resolve([]),
        contentTypes.includes('users') ? searchUsers(searchTerm, limit) : Promise.resolve([]),
      ]);

      const [projectsResult, tipsResult, usersResult] = results;

      return {
        projects: projectsResult.status === 'fulfilled' ? projectsResult.value : [],
        tips: tipsResult.status === 'fulfilled' ? tipsResult.value : [],
        users: usersResult.status === 'fulfilled' ? usersResult.value : [],
      };
    },
    enabled: searchQuery.length >= 2,
    retry: authAwareRetry,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useQuickSearch = (query: string) => {
  return useGlobalSearch({
    query,
    limit: 5,
    sortBy: 'relevance'
  });
};

// Search suggestions based on popular queries
export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      if (query.length < 2) return [];

      // Get popular search terms from content
      const { data: projects } = await supabase
        .from('projects')
        .select('title')
        .ilike('title', `%${query}%`)
        .limit(5);

      const { data: tips } = await supabase
        .from('tips')
        .select('title')
        .ilike('title', `%${query}%`)
        .limit(5);

      const suggestions = [
        ...(projects?.map(p => p.title) || []),
        ...(tips?.map(t => t.title) || []),
      ];

      return [...new Set(suggestions)].slice(0, 8);
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Search history management
export const getSearchHistory = (): string[] => {
  const history = localStorage.getItem('searchHistory');
  return history ? JSON.parse(history) : [];
};

export const addToSearchHistory = (query: string) => {
  const history = getSearchHistory();
  const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(newHistory));
};

export const clearSearchHistory = () => {
  localStorage.removeItem('searchHistory');
};