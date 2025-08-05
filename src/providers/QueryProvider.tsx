import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { isAuthError, handleAuthError } from '@/lib/authErrorHandler';
import { handleSupabaseError } from '@/lib/sentry';
import { toast } from 'sonner';
import { _createQueryClient } from '@/lib/query-config';

// React Query 에러 핸들러 생성
const createQueryErrorHandler = () => {
  return async (error: unknown) => {
    console.error('Query error:', error);
    
    // 인증 에러인 경우 세션 만료 처리
    if (isAuthError(error)) {
      await handleAuthError(error, false); // Toast는 여기서 비활성화
      return;
    }
    
    // Sentry로 에러 리포팅
    handleSupabaseError(error, {
      context: 'React Query',
      errorType: 'Query Error',
    });
  };
};

const createMutationErrorHandler = () => {
  return async (error: unknown) => {
    console.error('Mutation error:', error);
    
    // 인증 에러인 경우 세션 만료 처리
    if (isAuthError(error)) {
      await handleAuthError(error);
      return;
    }
    
    // Sentry로 에러 리포팅
    handleSupabaseError(error, {
      context: 'React Query',
      errorType: 'Mutation Error',
    });
    
    // 일반 에러는 사용자에게 알림
    const _errorMessage = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
    toast.error(errorMessage);
  };
};

// 최적화된 QueryClient 생성 (에러 핸들러 포함)
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: createQueryErrorHandler(),
  }),
  mutationCache: new MutationCache({
    onError: createMutationErrorHandler(),
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error: unknown) => {
        if (error?.code === 'PGRST301' || error?.status === 401) {
          return false;
        }
        if (error?.status >= 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
      meta: {
        errorMessage: '데이터를 불러오는 중 오류가 발생했습니다.'
      }
    },
    mutations: {
      retry: false,
      networkMode: 'online',
      meta: {
        errorMessage: '요청 처리 중 오류가 발생했습니다.'
      }
    }
  },
  logger: {
    log: console.warn,
    warn: console.warn,
    error: process.env.NODE_ENV === 'development' ? console.error : () => {},
  }
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};