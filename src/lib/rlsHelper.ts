/**
 * RLS (Row Level Security) 타임아웃 방지 유틸리티
 * Supabase RLS 권한 문제로 인한 무한 대기를 방지하기 위한 헬퍼 함수들
 */

import { supabase } from '@/lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * RLS 타임아웃을 방지하는 쿼리 실행기
 * @param queryBuilder - Supabase 쿼리 빌더
 * @param timeoutMs - 타임아웃 시간 (기본값: 3초)
 * @param fallbackValue - 타임아웃 시 반환할 값
 * @returns 쿼리 결과 또는 fallback 값
 */
export async function executeWithRLSTimeout<T>(
  queryBuilder: Promise<{ data: T | null; error: unknown }>,
  timeoutMs: number = 3000,
  fallbackValue: T | null = null
): Promise<{ data: T | null; error: unknown; isTimeout: boolean }> {
  try {
    // 타임아웃 프로미스 생성
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`RLS_TIMEOUT: Query timed out after ${timeoutMs}ms - likely RLS permission issue`));
      }, timeoutMs);
    });

    // 쿼리와 타임아웃을 race
    const result = await Promise.race([queryBuilder, timeoutPromise]);
    
    const { data, error } = result as { data: T | null; error: unknown };
    return {
      data,
      error,
      isTimeout: false
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('RLS_TIMEOUT')) {
      console.warn(`🚨 RLS timeout detected - returning fallback value`);
      return {
        data: fallbackValue,
        error: null,
        isTimeout: true
      };
    }
    
    return {
      data: null,
      error,
      isTimeout: false
    };
  }
}

/**
 * 사용자 세션 유효성 검사
 * @returns 유효한 세션 여부와 사용자 정보
 */
export async function validateUserSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session validation error:', error);
      return { isValid: false, user: null, session: null };
    }

    if (!session || !session.user) {
      console.warn('⚠️ No valid session found');
      return { isValid: false, user: null, session: null };
    }

    return { isValid: true, user: session.user, session };
  } catch (error) {
    console.error('💥 Session validation failed:', error);
    return { isValid: false, user: null, session: null };
  }
}

/**
 * RLS 권한 문제를 감지하고 적절한 fallback 처리를 수행
 * @param error - 발생한 에러
 * @returns 에러 처리 결과
 */
export function handleRLSError(error: unknown): {
  isRLSIssue: boolean;
  shouldFallback: boolean;
  userMessage: string;
} {
  if (!error) {
    return {
      isRLSIssue: false,
      shouldFallback: false,
      userMessage: ''
    };
  }

  const errorMessage = error instanceof Error ? error.message : '';
  
  // RLS 타임아웃 감지
  if (errorMessage.includes('RLS_TIMEOUT') || errorMessage.includes('timeout')) {
    return {
      isRLSIssue: true,
      shouldFallback: true,
      userMessage: '데이터를 불러오는 중 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    };
  }

  // 권한 관련 에러 감지
  if ((error as { code?: string })?.code === 'PGRST301' || errorMessage.includes('permission') || errorMessage.includes('JWT')) {
    return {
      isRLSIssue: true,
      shouldFallback: false,
      userMessage: '권한 문제가 발생했습니다. 다시 로그인해주세요.'
    };
  }

  // 데이터 없음 (정상)
  if ((error as { code?: string })?.code === 'PGRST116') {
    return {
      isRLSIssue: false,
      shouldFallback: true,
      userMessage: ''
    };
  }

  return {
    isRLSIssue: false,
    shouldFallback: false,
    userMessage: '알 수 없는 오류가 발생했습니다.'
  };
}

/**
 * 안전한 프로필 조회
 * @param userId - 사용자 ID
 * @returns 프로필 데이터 또는 fallback
 */
export async function safeGetProfile(userId: string) {
  console.log('🔍 SafeGetProfile for user:', userId);
  
  // 세션 검증
  const { isValid, user } = await validateUserSession();
  if (!isValid || !user) {
    return { data: null, error: new Error('세션이 유효하지 않습니다.'), isTimeout: false };
  }

  // RLS 타임아웃 방지 쿼리 실행
  const result = await executeWithRLSTimeout(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    3000,
    null
  );

  if (result.isTimeout) {
    console.warn('🚨 Profile query timed out - creating fallback profile');
    
    // Fallback 프로필 생성
    const fallbackProfile = {
      id: userId,
      username: user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: null,
      github_url: null,
      twitter_url: null,
      linkedin_url: null,
      website_url: null,
      tech_stack: null,
      project_count: 0,
      follower_count: 0,
      following_count: 0,
      is_online: false,
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    };
    
    return { data: fallbackProfile, error: null, isTimeout: true };
  }

  return result;
}

/**
 * 안전한 사용자 프로젝트 조회
 * @param userId - 사용자 ID
 * @returns 프로젝트 목록 또는 빈 배열
 */
export async function safeGetUserProjects(userId: string) {
  console.log('🔍 SafeGetUserProjects for user:', userId);
  
  // 세션 검증
  const { isValid } = await validateUserSession();
  if (!isValid) {
    return { data: [], error: new Error('세션이 유효하지 않습니다.'), isTimeout: false };
  }

  // RLS 타임아웃 방지 쿼리 실행
  const result = await executeWithRLSTimeout(
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    3000,
    []
  );

  if (result.isTimeout) {
    console.warn('🚨 Projects query timed out - returning empty array');
    return { data: [], error: null, isTimeout: true };
  }

  return result;
}