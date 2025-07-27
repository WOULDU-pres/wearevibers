import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { handleSupabaseError, AuthError } from '@/lib/sentry';

/**
 * 인증 관련 에러인지 확인하는 함수
 */
export const isAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as { 
    code?: string; 
    message?: string; 
    status?: number;
    statusCode?: number;
    name?: string;
    details?: string;
    hint?: string;
  };
  
  // 디버깅을 위한 로그 추가
  console.log('🔍 Auth error check:', {
    error: err,
    code: err.code,
    message: err.message,
    status: err.status || err.statusCode,
    name: err.name
  });
  
  const isAuth = (
    // PostgreSQL/Supabase 에러 코드
    err.code === 'PGRST301' || // JWT expired
    err.code === 'PGRST302' || // JWT invalid
    err.code === 'PGRST116' || // JWT required but missing
    
    // HTTP 상태 코드
    err.status === 401 ||
    err.statusCode === 401 ||
    
    // 에러 메시지 패턴 매칭
    err.message?.toLowerCase().includes('jwt') ||
    err.message?.toLowerCase().includes('expired') ||
    err.message?.toLowerCase().includes('unauthorized') ||
    err.message?.toLowerCase().includes('invalid') ||
    err.message?.toLowerCase().includes('authentication') ||
    err.message?.toLowerCase().includes('permission') ||
    
    // 에러 이름 확인
    err.name === 'AuthError' ||
    
    // Supabase 특화 패턴
    err.details?.toLowerCase().includes('jwt') ||
    err.hint?.toLowerCase().includes('login')
  );
  
  if (isAuth) {
    console.log('🚨 Auth error detected!', err);
  }
  
  return isAuth;
};

/**
 * 인증 에러 처리 함수
 * 세션 만료 시 자동 로그아웃 및 사용자 알림
 */
export const handleAuthError = async (error: unknown, showToast = true): Promise<void> => {
  if (!isAuthError(error)) {
    return;
  }

  console.log('Auth error detected, signing out user:', error);

  // Sentry로 인증 에러 리포팅 (Rule 1, 2, 3 적용)
  handleSupabaseError(error, {
    method: 'auth',
    endpoint: 'session_validation',
    context: 'handleAuthError',
  });

  try {
    // Supabase 세션 정리
    await supabase.auth.signOut();
    
    if (showToast) {
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 현재 페이지가 보호된 페이지인 경우 홈으로 리다이렉트
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/login', '/signup'];
    
    if (!publicPaths.includes(currentPath)) {
      // 약간의 지연을 두고 리다이렉트 (Toast 메시지를 볼 수 있도록)
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  } catch (signOutError) {
    console.error('Error during auth error handling:', signOutError);
  }
};

/**
 * React Query에서 사용할 수 있는 retry 함수
 */
export const authAwareRetry = (failureCount: number, error: unknown): boolean => {
  // 인증 에러는 재시도하지 않음
  if (isAuthError(error)) {
    return false;
  }
  
  // 세션 만료 메시지가 포함된 에러도 재시도하지 않음
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message?: string };
    if (err.message?.includes('세션이 만료')) {
      return false;
    }
  }
  
  // 일반 에러는 최대 3회 재시도
  return failureCount < 3;
};

/**
 * Mutation에서 사용할 에러 핸들러
 */
export const createAuthAwareMutationErrorHandler = (customMessage?: string) => {
  return async (error: unknown) => {
    console.error('Mutation error:', error);
    
    if (isAuthError(error)) {
      await handleAuthError(error);
    } else {
      toast.error(customMessage || '요청 처리 중 오류가 발생했습니다.');
    }
  };
};