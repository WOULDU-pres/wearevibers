import React from 'react';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { isAuthError, handleAuthError } from '@/lib/authErrorHandler';
import { handleSupabaseError } from '@/lib/sentry';
import { toast } from 'sonner';

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
    const errorMessage = error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
    toast.error(errorMessage);
  };
};

// QueryClient 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: Error) => {
        // 인증 에러는 재시도하지 않음
        if (isAuthError(error) || error?.message?.includes('세션이 만료')) {
          return false;
        }
        // 일반 에러는 최대 3회 재시도
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
    },
  },
  queryCache: new QueryCache({
    onError: createQueryErrorHandler(),
  }),
  mutationCache: new MutationCache({
    onError: createMutationErrorHandler(),
  }),
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