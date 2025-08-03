/**
 * Vitest 전역 셋업
 * 모든 테스트 실행 전에 한 번 실행되는 설정
 */

export default async function globalSetup() {
  // 전역 환경 변수 설정
  process.env.NODE_ENV = 'test';
  process.env.TZ = 'UTC'; // 타임존 고정
  
  // 테스트 데이터베이스 초기화 (필요시)
  // await initTestDatabase();
  
  // 테스트용 서버 시작 (필요시)
  // await startTestServer();
  
  console.warn('🧪 Global test setup completed');
}

// 테스트용 서버 시작 (예시)
async function startTestServer() {
  // Express 서버나 MSW 서버 시작
  console.warn('🚀 Test server started');
}

// 테스트 데이터베이스 초기화 (예시)
async function initTestDatabase() {
  // 테스트용 데이터베이스 연결 및 초기화
  console.warn('🗄️ Test database initialized');
}