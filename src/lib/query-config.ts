/**
 * Tanstack Query 최적화 설정
 * 성능, 캐싱, 에러 처리 최적화
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// 쿼리 기본 설정
export const queryConfig: DefaultOptions = {
  queries: {
    // 캐싱 설정
    staleTime: 5 * 60 * 1000,      // 5분간 데이터를 fresh로 간주
    gcTime: 10 * 60 * 1000,        // 10분 후 가비지 컬렉션
    
    // 백그라운드 동작 설정
    refetchOnWindowFocus: false,    // 윈도우 포커스 시 재요청 비활성화
    refetchOnReconnect: true,       // 네트워크 재연결 시 재요청
    refetchOnMount: true,           // 컴포넌트 마운트 시 재요청
    
    // 재시도 설정
    retry: (failureCount, error: unknown) => {
      // Auth 에러는 재시도하지 않음
      if (error?.code === 'PGRST301' || error?.status === 401) {
        return false;
      }
      // 서버 에러는 재시도하지 않음
      if (error?.status >= 500) {
        return false;
      }
      // 최대 3회까지 재시도
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // 네트워크 상태에 따른 설정
    networkMode: 'online',
    
    // 메타데이터
    meta: {
      errorMessage: '데이터를 불러오는 중 오류가 발생했습니다.'
    }
  },
  mutations: {
    // 뮤테이션은 기본적으로 재시도하지 않음
    retry: false,
    
    // 네트워크 모드
    networkMode: 'online',
    
    // 메타데이터
    meta: {
      errorMessage: '요청 처리 중 오류가 발생했습니다.'
    }
  }
};

// QueryClient 인스턴스 생성
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: queryConfig,
    logger: {
      log: console.log,
      warn: console.warn,
      error: process.env.NODE_ENV === 'development' ? console.error : () => {},
    }
  });
};

// 쿼리 키 생성 팩토리
export const queryKeys = {
  // 프로젝트 관련
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    userProjects: (userId: string) => [...queryKeys.projects.all, 'user', userId] as const,
  },

  // 팁 관련
  tips: {
    all: ['tips'] as const,
    lists: () => [...queryKeys.tips.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.tips.lists(), filters] as const,
    details: () => [...queryKeys.tips.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tips.details(), id] as const,
    userTips: (userId: string) => [...queryKeys.tips.all, 'user', userId] as const,
  },

  // 게시글 관련
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    userPosts: (userId: string) => [...queryKeys.posts.all, 'user', userId] as const,
  },

  // 댓글 관련
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    list: (contentId: string, contentType: string) => 
      [...queryKeys.comments.lists(), contentId, contentType] as const,
    details: () => [...queryKeys.comments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.comments.details(), id] as const,
  },

  // 사용자 관련
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },

  // 검색 관련
  search: {
    all: ['search'] as const,
    global: (query: string, filters: Record<string, unknown>) => 
      [...queryKeys.search.all, 'global', query, filters] as const,
    suggestions: (query: string) => [...queryKeys.search.all, 'suggestions', query] as const,
    history: () => [...queryKeys.search.all, 'history'] as const,
  },

  // 좋아요 관련
  vibes: {
    all: ['vibes'] as const,
    status: (contentId: string, contentType: string) => 
      [...queryKeys.vibes.all, 'status', contentType, contentId] as const,
    count: (contentId: string, contentType: string) => 
      [...queryKeys.vibes.all, 'count', contentType, contentId] as const,
  },

  // 팔로우 관련
  follows: {
    all: ['follows'] as const,
    status: (userId: string) => [...queryKeys.follows.all, 'status', userId] as const,
    followers: (userId: string) => [...queryKeys.follows.all, 'followers', userId] as const,
    following: (userId: string) => [...queryKeys.follows.all, 'following', userId] as const,
  }
};

// 캐시 무효화 헬퍼
export const invalidateQueries = {
  // 전체 프로젝트 목록 무효화
  allProjects: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  },
  
  // 특정 프로젝트 무효화
  project: (queryClient: QueryClient, projectId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
  },

  // 전체 팁 목록 무효화
  allTips: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tips.all });
  },

  // 특정 팁 무효화
  tip: (queryClient: QueryClient, tipId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tips.detail(tipId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tips.lists() });
  },

  // 댓글 무효화
  comments: (queryClient: QueryClient, contentId: string, contentType: string) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.comments.list(contentId, contentType) 
    });
  },

  // 검색 결과 무효화
  search: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
  },

  // 사용자 정보 무효화
  user: (queryClient: QueryClient, userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
  }
};

// 프리페치 헬퍼
export const prefetchQueries = {
  // 중요한 데이터 프리페치
  essential: async (queryClient: QueryClient) => {
    // 현재 사용자 정보 프리페치
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.current(),
      staleTime: 10 * 60 * 1000, // 10분
    });

    // 인기 프로젝트 프리페치
    await queryClient.prefetchQuery({
      queryKey: queryKeys.projects.list({ sortBy: 'popular', limit: 10 }),
      staleTime: 5 * 60 * 1000, // 5분
    });
  }
};