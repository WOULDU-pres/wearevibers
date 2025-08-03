/**
 * Vitest 전역 정리
 * 모든 테스트 실행 후에 한 번 실행되는 정리 작업
 */

export default async function globalTeardown() {
  // 테스트 서버 종료 (필요시)
  // await stopTestServer();
  
  // 테스트 데이터베이스 정리 (필요시)
  // await cleanupTestDatabase();
  
  // 임시 파일 정리 (필요시)
  // await cleanupTempFiles();
  
  console.log('🧹 Global test teardown completed');
}

// 테스트 서버 종료 (예시)
async function stopTestServer() {
  console.log('🛑 Test server stopped');
}

// 테스트 데이터베이스 정리 (예시)
async function cleanupTestDatabase() {
  console.log('🗄️ Test database cleaned up');
}

// 임시 파일 정리 (예시)
async function cleanupTempFiles() {
  console.log('📁 Temporary files cleaned up');
}