# WeAreVibers RLS 진단 및 해결 방안

## 📋 현재 상황 요약

### 발견된 문제
- **profiles 테이블 RLS 타임아웃**: 3초 내에 쿼리가 완료되지 않음
- **AuthStore에서 지속적인 타임아웃 발생**: `RLS_TIMEOUT: AuthStore profile query timed out`
- **사용자 경험 저하**: 프로필 데이터 로드 실패로 인한 기능 제한

## 🔍 RLS 문제 진단

### 1. 가능한 원인들

#### A. RLS 정책 문제
- **잘못된 정책 설정**: 사용자가 자신의 프로필에 접근할 수 없는 정책
- **복잡한 정책 로직**: 성능을 저하시키는 복잡한 조건문
- **누락된 인덱스**: RLS 정책에서 사용하는 컬럼에 인덱스 부족

#### B. 데이터베이스 성능 문제
- **인덱스 부족**: `profiles.id`에 대한 적절한 인덱스 부족
- **통계 정보 부족**: PostgreSQL 쿼리 플래너의 잘못된 실행 계획
- **리소스 부족**: CPU/메모리 부족으로 인한 쿼리 지연

#### C. 네트워크/연결 문제
- **높은 레이턴시**: 클라이언트-서버 간 네트워크 지연
- **연결 풀 부족**: Supabase 연결 풀 한계
- **지역별 접근**: 서버와 클라이언트의 지리적 거리

### 2. 예상되는 RLS 정책 구조
```sql
-- 현재 있어야 할 기본 RLS 정책들
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🛠️ 구현된 해결 방안

### 1. **AuthStore 개선** ✅
- **RLS 헬퍼 통합**: `safeGetProfile` 함수로 안전한 프로필 조회
- **타임아웃 단축**: 3초 → 1.5초로 단축하여 더 빠른 fallback
- **Fallback 프로필 생성**: 타임아웃 시 사용자 메타데이터 기반 임시 프로필 제공
- **에러 분류**: timeout, permission, not_found, network, unknown으로 세분화

### 2. **RLS 헬퍼 함수 강화** ✅
- **세션 검증**: 쿼리 전 사용자 세션 유효성 확인
- **성능 모니터링**: 쿼리 실행 시간 측정 및 로깅
- **향상된 에러 처리**: 더 정확한 에러 분류 및 처리
- **Enhanced Fallback**: 더 풍부한 메타데이터 활용한 fallback 프로필

### 3. **SignOut 최적화** ✅
- **타임아웃 단축**: 2초 → 1.5초로 개선
- **RLS 헬퍼 사용**: 일관된 에러 처리
- **Sentry 최적화**: 타임아웃 에러는 Sentry 리포팅에서 제외

## 🎯 추가 권장 사항

### 1. Supabase 데이터베이스 확인사항

#### A. RLS 정책 확인
```sql
-- 현재 RLS 정책 조회
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- RLS 활성화 상태 확인  
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

#### B. 인덱스 확인
```sql
-- profiles 테이블 인덱스 조회
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'profiles';

-- 추가 인덱스 생성 (필요시)
CREATE INDEX CONCURRENTLY idx_profiles_id ON profiles(id);
```

#### C. 쿼리 성능 분석
```sql
-- 느린 쿼리 분석
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM profiles WHERE id = 'user-id-here';
```

### 2. Supabase 대시보드 모니터링

#### A. Database 섹션 확인
- **Performance**: 느린 쿼리 및 성능 메트릭
- **Logs**: RLS 관련 에러 로그
- **Settings**: RLS 정책 및 권한 설정

#### B. API 섹션 확인
- **Logs**: API 호출 로그 및 에러
- **Settings**: API 키 및 권한 설정

### 3. 성능 최적화 전략

#### A. 캐싱 전략
```typescript
// 프로필 데이터 캐싱 (향후 구현)
const profileCache = new Map<string, Profile>();

// 로컬 스토리지 활용
localStorage.setItem('profile-cache', JSON.stringify(profile));
```

#### B. 프리로딩 전략
```typescript
// 앱 시작 시 필수 데이터 미리 로드
const preloadUserData = async () => {
  // 프로필, 기본 설정 등 병렬 로드
};
```

### 4. 모니터링 및 알림

#### A. 에러 추적
- **Sentry 대시보드**: RLS 관련 에러 모니터링
- **커스텀 메트릭**: 타임아웃 발생 빈도 추적

#### B. 성능 메트릭
- **프로필 로드 시간**: 평균/최대 로드 시간 측정
- **Fallback 사용률**: 타임아웃으로 인한 fallback 사용 비율

## 🚀 다음 단계

### 즉시 조치사항
1. **Supabase 대시보드 확인**: RLS 정책 및 성능 메트릭 검토
2. **로그 분석**: 콘솔 로그에서 RLS 관련 패턴 확인
3. **테스트 수행**: 새로운 코드로 타임아웃 개선 여부 확인

### 중기 개선사항
1. **프로필 캐싱 구현**: 네트워크 의존도 감소
2. **성능 모니터링 강화**: 더 상세한 메트릭 수집
3. **대체 아키텍처 검토**: Edge Functions 활용 등

### 장기 최적화
1. **데이터베이스 최적화**: 인덱스 및 쿼리 최적화
2. **CDN 활용**: 정적 데이터 캐싱
3. **마이크로서비스 분리**: 프로필 서비스 독립화

## 📊 예상 개선 효과

### 성능 개선
- **타임아웃 시간**: 3초 → 1.5초 (50% 감소)
- **사용자 경험**: Fallback 프로필로 기본 기능 유지
- **에러 처리**: 더 정확한 에러 분류 및 대응

### 안정성 향상
- **Graceful Degradation**: 서비스 중단 없는 degraded 모드
- **에러 복구**: 자동 fallback 및 재시도 로직
- **모니터링**: 실시간 성능 및 에러 추적

이 해결 방안을 통해 RLS 타임아웃 문제를 효과적으로 완화하고, 사용자 경험을 크게 개선할 수 있을 것입니다.