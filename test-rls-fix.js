/**
 * RLS 타임아웃 해결 QA 테스트 스크립트
 * Profile 페이지와 useMyProjects hook의 RLS 타임아웃 대응을 테스트합니다.
 */

import { chromium } from 'playwright';

async function testRLSTimeoutFix() {
  console.log('🧪 Starting RLS Timeout Fix QA Test...\n');
  
  // 브라우저 시작
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 천천히 실행하여 관찰 가능
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('🚨') || text.includes('✅') || text.includes('⏰') || text.includes('RLS')) {
      console.log(`  📋 Console: ${text}`);
    }
  });
  
  try {
    console.log('1. 🌐 홈페이지 접속 중...');
    await page.goto('http://localhost:8082/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('2. 🔍 네비게이션 확인...');
    const isLoggedIn = await page.isVisible('text=Profile');
    
    if (isLoggedIn) {
      console.log('3. ✅ 이미 로그인된 상태 - Profile 페이지로 이동');
      await page.click('text=Profile');
    } else {
      console.log('3. 🔐 로그인 필요 - Profile 페이지로 직접 이동');
      await page.goto('http://localhost:8082/profile', { waitUntil: 'networkidle' });
    }

    console.log('4. ⏱️ Profile 페이지 로딩 대기 (RLS 타임아웃 테스트)...');

    // Profile 페이지 로딩 상태 확인
    await page.waitForTimeout(5000); // 5초 대기하여 타임아웃 동작 관찰

    // 현재 페이지 상태 확인
    const currentUrl = page.url();
    console.log(`  📍 Current URL: ${currentUrl}`);

    // 로딩 상태나 에러 메시지 확인
    const hasLoadingSpinner = await page.isVisible('.animate-spin');
    const hasErrorMessage = await page.isVisible('text=프로필을 찾을 수 없습니다');
    const hasRetryButton = await page.isVisible('text=다시 시도');
    const hasProfileContent = await page.isVisible('text=Projects');

    console.log('5. 📊 페이지 상태 분석:');
    console.log(`  🔄 Loading Spinner: ${hasLoadingSpinner}`);
    console.log(`  ❌ Error Message: ${hasErrorMessage}`);
    console.log(`  🔁 Retry Button: ${hasRetryButton}`);
    console.log(`  ✅ Profile Content: ${hasProfileContent}`);

    // 프로젝트 탭 확인 (useMyProjects hook 테스트)
    if (hasProfileContent) {
      console.log('6. 🎯 Projects 탭 클릭하여 useMyProjects hook 테스트...');
      await page.click('text=Projects');
      await page.waitForTimeout(4000); // 4초 대기하여 프로젝트 로딩 관찰

      const hasProjectsLoading = await page.isVisible('.animate-pulse');
      const hasEmptyState = await page.isVisible('text=첫 프로젝트 만들기');
      const hasProjects = await page.isVisible('[data-testid="project-card"]');

      console.log('7. 📊 Projects 탭 상태:');
      console.log(`  🔄 Projects Loading: ${hasProjectsLoading}`);
      console.log(`  📝 Empty State: ${hasEmptyState}`);
      console.log(`  🚀 Has Projects: ${hasProjects}`);
    }

    // 다시 시도 버튼 테스트
    if (hasRetryButton) {
      console.log('8. 🔁 "다시 시도" 버튼 테스트...');
      await page.click('text=다시 시도');
      await page.waitForTimeout(4000);

      const afterRetry = await page.isVisible('text=프로필을 찾을 수 없습니다');
      console.log(`  🔄 After Retry - Still Error: ${afterRetry}`);
    }

    // 콘솔 로그 분석
    console.log('\n9. 📋 중요한 콘솔 로그 분석:');
    const rlsLogs = logs.filter(log => 
      log.includes('RLS') || 
      log.includes('timeout') ||
      log.includes('🚨') ||
      log.includes('✅') ||
      log.includes('SafeGetProfile') ||
      log.includes('SafeGetUserProjects')
    );

    if (rlsLogs.length > 0) {
      rlsLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    } else {
      console.log('  ℹ️ RLS 관련 로그가 발견되지 않았습니다.');
    }
    
  } catch (error) {
    console.error('💥 테스트 중 오류 발생:', error.message);
  } finally {
    console.log('\n🏁 테스트 완료 - 브라우저를 10초 후 종료합니다...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

// 테스트 실행
testRLSTimeoutFix().catch(console.error);