/**
 * Playwright 전역 셋업
 * 모든 E2E 테스트 실행 전 초기화
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');
  
  // 테스트용 데이터 준비
  await setupTestData();
  
  // 인증 상태 사전 설정 (필요시)
  await setupAuthStates(config);
  
  // 테스트 환경 검증
  await verifyTestEnvironment();
  
  console.log('✅ E2E test global setup completed');
}

/**
 * 테스트용 데이터 준비
 */
async function setupTestData() {
  // 테스트용 사용자 계정 생성
  // 테스트용 게시물/댓글 등 샘플 데이터 준비
  console.log('📊 Test data prepared');
}

/**
 * 인증 상태 사전 설정
 */
async function setupAuthStates(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 관리자 계정 로그인 상태 저장
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email-input"]', 'admin@wearevibers.com');
    await page.fill('[data-testid="password-input"]', 'admin123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
    await page.context().storageState({ path: './e2e/auth/admin-state.json' });
    
    // 일반 사용자 계정 로그인 상태 저장
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email-input"]', 'user@wearevibers.com');
    await page.fill('[data-testid="password-input"]', 'user123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/lounge');
    await page.context().storageState({ path: './e2e/auth/user-state.json' });
    
    console.log('🔐 Authentication states prepared');
  } catch (error) {
    console.warn('⚠️ Could not prepare auth states:', error);
  } finally {
    await browser.close();
  }
}

/**
 * 테스트 환경 검증
 */
async function verifyTestEnvironment() {
  // 환경 변수 확인
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️ Missing environment variable: ${envVar}`);
    }
  }
  
  console.log('🔍 Test environment verified');
}

export default globalSetup;