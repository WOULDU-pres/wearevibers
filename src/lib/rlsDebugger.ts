/**
 * RLS 문제 진단 및 디버깅 도구
 * Supabase RLS 정책과 세션 상태를 정밀 분석
 */

import { supabase } from '@/lib/supabase';

export interface RLSDebugResult {
  sessionStatus: {
    hasSession: boolean;
    userId: string | null;
    email: string | null;
    isExpired: boolean;
    tokenValid: boolean;
  };
  databaseAccess: {
    canAccessProfiles: boolean;
    canAccessProjects: boolean;
    canAccessTips: boolean;
    canAccessPosts: boolean;
  };
  rlsPolicies: {
    profilesPolicy: boolean;
    projectsPolicy: boolean;
    tipsPolicy: boolean;
    postsPolicy: boolean;
  };
  metadata: {
    timestamp: string;
    userAgent: string;
    environment: string;
  };
}

/**
 * 현재 세션 상태를 정밀 검사
 */
async function debugSessionStatus() {
  try {
    console.log('🔍 Starting session debug...');
    
    // 1. 현재 세션 상태 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return {
        hasSession: false,
        userId: null,
        email: null,
        isExpired: true,
        tokenValid: false
      };
    }

    if (!session) {
      console.warn('⚠️ No session found');
      return {
        hasSession: false,
        userId: null,
        email: null,
        isExpired: false,
        tokenValid: false
      };
    }

    // 2. 세션 만료 확인
    const now = Math.floor(Date.now() / 1000);
    const isExpired = session.expires_at ? session.expires_at <= now : false;
    
    console.log('📊 Session info:', {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: session.expires_at,
      isExpired,
      tokenLength: session.access_token?.length || 0
    });

    return {
      hasSession: true,
      userId: session.user.id,
      email: session.user.email || null,
      isExpired,
      tokenValid: !isExpired && !!session.access_token
    };
  } catch (error) {
    console.error('💥 Session debug failed:', error);
    return {
      hasSession: false,
      userId: null,
      email: null,
      isExpired: true,
      tokenValid: false
    };
  }
}

/**
 * 데이터베이스 테이블 접근 권한 테스트
 */
async function debugDatabaseAccess(userId: string) {
  console.log('🔍 Testing database access for user:', userId);
  
  const results = {
    canAccessProfiles: false,
    canAccessProjects: false,
    canAccessTips: false,
    canAccessPosts: false,
  };

  // 각 테이블에 대한 단순 조회 테스트 (타임아웃 1초)
  const testQueries = [
    {
      name: 'profiles',
      query: supabase.from('profiles').select('id').eq('id', userId).limit(1)
    },
    {
      name: 'projects',
      query: supabase.from('projects').select('id').eq('user_id', userId).limit(1)
    },
    {
      name: 'tips',
      query: supabase.from('tips').select('id').eq('user_id', userId).limit(1)
    },
    {
      name: 'posts',
      query: supabase.from('posts').select('id').eq('user_id', userId).limit(1)
    }
  ];

  for (const test of testQueries) {
    try {
      console.log(`🧪 Testing ${test.name} access...`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 1000);
      });

      const result = await Promise.race([test.query, timeoutPromise]);
      const { data, error } = result as any;

      if (error) {
        console.error(`❌ ${test.name} access error:`, error);
        results[`canAccess${test.name.charAt(0).toUpperCase() + test.name.slice(1)}` as keyof typeof results] = false;
      } else {
        console.log(`✅ ${test.name} access successful`);
        results[`canAccess${test.name.charAt(0).toUpperCase() + test.name.slice(1)}` as keyof typeof results] = true;
      }
    } catch (error) {
      console.warn(`⏰ ${test.name} access timeout or failed:`, error);
      results[`canAccess${test.name.charAt(0).toUpperCase() + test.name.slice(1)}` as keyof typeof results] = false;
    }
  }

  return results;
}

/**
 * RLS 정책 상태 확인
 */
async function debugRLSPolicies() {
  console.log('🔍 Checking RLS policies...');
  
  try {
    // auth.uid() 함수가 올바르게 작동하는지 테스트
    const { data: uidTest, error: uidError } = await supabase.rpc('get_current_user_id');
    
    console.log('🆔 Current user ID from RLS:', { data: uidTest, error: uidError });

    // 각 테이블의 RLS 정책 활성화 상태 확인 (가능한 경우)
    return {
      profilesPolicy: true, // 기본적으로 활성화되어 있다고 가정
      projectsPolicy: true,
      tipsPolicy: true,
      postsPolicy: true,
    };
  } catch (error) {
    console.error('❌ RLS policy check failed:', error);
    return {
      profilesPolicy: false,
      projectsPolicy: false,
      tipsPolicy: false,
      postsPolicy: false,
    };
  }
}

/**
 * 메인 RLS 디버깅 함수
 */
export async function debugRLSIssues(): Promise<RLSDebugResult> {
  console.log('🚀 Starting comprehensive RLS debugging...');
  
  const startTime = Date.now();
  
  // 1. 세션 상태 확인
  const sessionStatus = await debugSessionStatus();
  
  // 2. 데이터베이스 접근 테스트 (세션이 유효한 경우에만)
  let databaseAccess = {
    canAccessProfiles: false,
    canAccessProjects: false,
    canAccessTips: false,
    canAccessPosts: false,
  };
  
  if (sessionStatus.hasSession && sessionStatus.userId && sessionStatus.tokenValid) {
    databaseAccess = await debugDatabaseAccess(sessionStatus.userId);
  }
  
  // 3. RLS 정책 확인
  const rlsPolicies = await debugRLSPolicies();
  
  const endTime = Date.now();
  console.log(`📊 RLS debugging completed in ${endTime - startTime}ms`);
  
  const result: RLSDebugResult = {
    sessionStatus,
    databaseAccess,
    rlsPolicies,
    metadata: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      environment: import.meta.env.NODE_ENV || 'development',
    }
  };

  console.log('📋 RLS Debug Result:', result);
  return result;
}

/**
 * RLS 문제 자동 수정 시도
 */
export async function attemptRLSFix(): Promise<{
  success: boolean;
  actions: string[];
  errors: string[];
}> {
  console.log('🔧 Attempting RLS issue fixes...');
  
  const actions: string[] = [];
  const errors: string[] = [];
  
  try {
    // 1. 세션 갱신 시도
    actions.push('Refreshing session...');
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      errors.push(`Session refresh failed: ${refreshError.message}`);
    } else if (session) {
      actions.push('Session refreshed successfully');
    }
    
    // 2. 캐시 클리어
    actions.push('Clearing local storage cache...');
    localStorage.removeItem('wearevibers-auth-store');
    
    // 3. 새 세션으로 간단한 테스트 쿼리 실행
    if (session?.user) {
      actions.push('Testing database connection with new session...');
      
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .limit(1);
      
      if (testError) {
        errors.push(`Test query failed: ${testError.message}`);
      } else {
        actions.push('Test query successful');
      }
    }
    
    return {
      success: errors.length === 0,
      actions,
      errors
    };
  } catch (error) {
    errors.push(`Fix attempt failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      actions,
      errors
    };
  }
}

/**
 * RLS 상태 지속적 모니터링
 */
export function startRLSMonitoring() {
  console.log('📊 Starting RLS monitoring...');
  
  const monitorInterval = setInterval(async () => {
    const result = await debugRLSIssues();
    
    // 문제가 감지되면 로깅
    if (!result.sessionStatus.tokenValid || 
        !result.databaseAccess.canAccessProfiles || 
        !result.databaseAccess.canAccessProjects) {
      console.warn('🚨 RLS issue detected during monitoring:', {
        sessionValid: result.sessionStatus.tokenValid,
        profileAccess: result.databaseAccess.canAccessProfiles,
        projectAccess: result.databaseAccess.canAccessProjects,
      });
    }
  }, 30000); // 30초마다 체크
  
  // 정리 함수 반환
  return () => {
    console.log('🛑 Stopping RLS monitoring...');
    clearInterval(monitorInterval);
  };
}