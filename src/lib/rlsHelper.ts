/**
 * RLS (Row Level Security) 타임아웃 방지 유틸리티
 * Supabase RLS 권한 문제로 인한 무한 대기를 방지하기 위한 헬퍼 함수들
 */

import { supabase } from '@/lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { debugRLSIssues, attemptRLSFix } from './rlsDebugger';

/**
 * RLS 타임아웃을 방지하는 쿼리 실행기 (개선된 버전)
 * @param queryBuilder - Supabase 쿼리 빌더
 * @param timeoutMs - 타임아웃 시간 (기본값: 2초)
 * @param fallbackValue - 타임아웃 시 반환할 값
 * @param enableAutoFix - 자동 수정 시도 여부
 * @returns 쿼리 결과 또는 fallback 값
 */
export async function executeWithRLSTimeout<T>(
  queryBuilder: Promise<{ data: T | null; error: unknown }>,
  timeoutMs: number = 2000,
  fallbackValue: T | null = null,
  enableAutoFix: boolean = true
): Promise<{ data: T | null; error: unknown; isTimeout: boolean; wasFixed: boolean }> {
  const startTime = Date.now();
  let wasFixed = false;
  
  try {
    // 타임아웃 프로미스 생성
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`RLS_TIMEOUT: Query timed out after ${timeoutMs}ms - likely RLS permission issue`));
      }, timeoutMs);
    });

    // 쿼리와 타임아웃을 race
    const result = await Promise.race([queryBuilder, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`⚡ Query completed in ${duration}ms`);
    
    const { data, error } = result as { data: T | null; error: unknown };
    
    if (error) {
      console.warn('⚠️ Query completed with error:', error);
      
      // 권한 에러인 경우 자동 수정 시도
      if (enableAutoFix && isPermissionError(error)) {
        console.log('🔧 Attempting automatic RLS fix...');
        const fixResult = await attemptRLSFix();
        wasFixed = fixResult.success;
        
        if (wasFixed) {
          console.log('✅ RLS issue fixed, retrying query...');
          // 수정 후 쿼리 재시도 (한 번만)
          return executeWithRLSTimeout(queryBuilder, timeoutMs, fallbackValue, false);
        }
      }
    }
    
    return {
      data,
      error,
      isTimeout: false,
      wasFixed
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && error.message?.includes('RLS_TIMEOUT')) {
      console.warn(`🚨 RLS timeout detected after ${duration}ms`);
      
      // 타임아웃 시 진단 실행
      if (enableAutoFix) {
        console.log('🔍 Running RLS diagnostics...');
        const debugResult = await debugRLSIssues();
        
        // 세션 문제가 감지되면 수정 시도
        if (!debugResult.sessionStatus.tokenValid) {
          console.log('🔧 Session issue detected, attempting fix...');
          const fixResult = await attemptRLSFix();
          wasFixed = fixResult.success;
        }
      }
      
      return {
        data: fallbackValue,
        error: null,
        isTimeout: true,
        wasFixed
      };
    }
    
    console.error(`💥 Query failed after ${duration}ms:`, error);
    return {
      data: null,
      error,
      isTimeout: false,
      wasFixed
    };
  }
}

/**
 * 권한 관련 에러인지 확인
 */
function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as { code?: string })?.code;
  
  return (
    errorCode === 'PGRST301' || 
    errorCode === '42501' ||
    errorMessage.includes('permission') || 
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('unauthorized')
  );
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
  errorType: 'timeout' | 'permission' | 'not_found' | 'network' | 'unknown';
} {
  if (!error) {
    return {
      isRLSIssue: false,
      shouldFallback: false,
      userMessage: '',
      errorType: 'unknown'
    };
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as { code?: string })?.code;
  
  console.log('🔍 Analyzing error:', { errorMessage, errorCode });
  
  // RLS 타임아웃 감지
  if (errorMessage.includes('RLS_TIMEOUT') || errorMessage.includes('timeout')) {
    return {
      isRLSIssue: true,
      shouldFallback: true,
      userMessage: '데이터를 불러오는 중 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      errorType: 'timeout'
    };
  }

  // 권한 관련 에러 감지 (더 구체적)
  if (
    errorCode === 'PGRST301' || 
    errorCode === '42501' ||  // PostgreSQL permission denied
    errorMessage.includes('permission') || 
    errorMessage.includes('JWT') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('access denied')
  ) {
    return {
      isRLSIssue: true,
      shouldFallback: false,
      userMessage: '권한 문제가 발생했습니다. 다시 로그인해주세요.',
      errorType: 'permission'
    };
  }

  // 데이터 없음 (정상)
  if (errorCode === 'PGRST116') {
    return {
      isRLSIssue: false,
      shouldFallback: true,
      userMessage: '',
      errorType: 'not_found'
    };
  }

  // 네트워크 에러
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return {
      isRLSIssue: false,
      shouldFallback: true,
      userMessage: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      errorType: 'network'
    };
  }

  return {
    isRLSIssue: false,
    shouldFallback: false,
    userMessage: '알 수 없는 오류가 발생했습니다.',
    errorType: 'unknown'
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
  const { isValid, user, session } = await validateUserSession();
  if (!isValid || !user || !session) {
    return { data: null, error: new Error('세션이 유효하지 않습니다.'), isTimeout: false };
  }

  // AuthStore에서는 더 짧은 타임아웃 사용 (1.5초)
  const timeoutMs = 1500;
  
  console.log(`⏱️ Starting profile query with ${timeoutMs}ms timeout`);
  
  // RLS 타임아웃 방지 쿼리 실행
  const result = await executeWithRLSTimeout(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    timeoutMs,
    null
  );

  if (result.isTimeout) {
    console.warn('🚨 Profile query timed out - creating fallback profile');
    
    // Enhanced fallback 프로필 생성 with better metadata handling
    const fallbackProfile = {
      id: userId,
      username: user.user_metadata?.username || 
                user.user_metadata?.preferred_username || 
                user.email?.split('@')[0] || 
                `user_${userId.slice(-6)}`,
      full_name: user.user_metadata?.full_name || 
                 user.user_metadata?.name || 
                 user.user_metadata?.display_name || 
                 null,
      avatar_url: user.user_metadata?.avatar_url || 
                  user.user_metadata?.picture || 
                  null,
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
    
    console.log('📝 Generated fallback profile:', {
      id: fallbackProfile.id,
      username: fallbackProfile.username,
      full_name: fallbackProfile.full_name,
      hasAvatar: !!fallbackProfile.avatar_url
    });
    
    return { data: fallbackProfile, error: null, isTimeout: true };
  }

  if (result.error) {
    console.error('❌ Profile query error:', result.error);
  } else if (result.data) {
    console.log('✅ Profile query successful:', {
      id: result.data.id,
      username: result.data.username,
      full_name: result.data.full_name
    });
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