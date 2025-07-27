import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * 인증 관련 에러인지 확인하는 함수
 */
export const isAuthError = (error: any): boolean => {
  if (!error) return false;
  
  return (
    error.code === 'PGRST301' || // JWT expired
    error.code === 'PGRST302' || // JWT invalid
    error.message?.includes('JWT') ||
    error.message?.includes('expired') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('invalid') ||
    error.status === 401
  );
};

/**
 * 인증 에러 처리 함수
 * 세션 만료 시 자동 로그아웃 및 사용자 알림
 */
export const handleAuthError = async (error: any, showToast = true): Promise<void> => {
  if (!isAuthError(error)) {
    return;
  }

  console.log('Auth error detected, signing out user:', error);

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
export const authAwareRetry = (failureCount: number, error: any): boolean => {
  // 인증 에러는 재시도하지 않음
  if (isAuthError(error) || error?.message?.includes('세션이 만료')) {
    return false;
  }
  
  // 일반 에러는 최대 3회 재시도
  return failureCount < 3;
};

/**
 * Mutation에서 사용할 에러 핸들러
 */
export const createAuthAwareMutationErrorHandler = (customMessage?: string) => {
  return async (error: any) => {
    console.error('Mutation error:', error);
    
    if (isAuthError(error)) {
      await handleAuthError(error);
    } else {
      toast.error(customMessage || '요청 처리 중 오류가 발생했습니다.');
    }
  };
};