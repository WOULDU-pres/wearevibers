-- RLS 디버깅을 위한 SQL 함수들
-- Supabase SQL 편집기에서 실행해야 함

-- 현재 사용자 ID를 반환하는 함수
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.uid()::text;
$$;

-- 현재 사용자의 RLS 권한을 테스트하는 함수
CREATE OR REPLACE FUNCTION test_rls_access()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id TEXT;
  profile_access BOOLEAN := FALSE;
  projects_access BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- 현재 사용자 ID 확인
  SELECT auth.uid()::text INTO current_user_id;
  
  -- 프로필 접근 테스트
  BEGIN
    PERFORM 1 FROM profiles WHERE id = current_user_id LIMIT 1;
    profile_access := TRUE;
  EXCEPTION WHEN OTHERS THEN
    profile_access := FALSE;
  END;
  
  -- 프로젝트 접근 테스트
  BEGIN
    PERFORM 1 FROM projects WHERE user_id = current_user_id LIMIT 1;
    projects_access := TRUE;
  EXCEPTION WHEN OTHERS THEN
    projects_access := FALSE;
  END;
  
  -- 결과 JSON 생성
  result := json_build_object(
    'user_id', current_user_id,
    'profile_access', profile_access,
    'projects_access', projects_access,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- RLS 정책 활성화 상태 확인 함수 (관리자용)
CREATE OR REPLACE FUNCTION check_rls_policies()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'table_name', tablename,
      'rls_enabled', rowsecurity
    )
  ) INTO result
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'projects', 'tips', 'posts');
  
  RETURN result;
END;
$$;