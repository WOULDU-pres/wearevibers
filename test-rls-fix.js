/**
 * RLS 타임아웃 해결 QA 테스트 스크립트 (업데이트됨)
 * 개선된 AuthStore와 RLS 헬퍼를 활용한 타임아웃 대응을 테스트합니다.
 * 
 * 테스트 목표:
 * 1. AuthStore의 safeGetProfile 함수 동작 확인
 * 2. 1.5초 타임아웃 및 fallback 프로필 생성 테스트
 * 3. 향상된 에러 처리 및 로깅 확인
 */

import { chromium } from 'playwright';

async function testRLSTimeoutFix() {
  console.log('🧪 Starting Enhanced RLS Timeout Fix QA Test...\n');
  console.log('📋 Test Scope:');
  console.log('  - AuthStore safeGetProfile integration');
  console.log('  - 1.5s timeout with enhanced fallback');
  console.log('  - Improved error classification');
  console.log('  - Performance monitoring\n');
  
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
    if (text.includes('🚨') || text.includes('✅') || text.includes('⏰') || 
        text.includes('RLS') || text.includes('SafeGetProfile') || 
        text.includes('fallback') || text.includes('timeout')) {
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

    console.log('4. ⏱️ Enhanced Profile 로딩 테스트 (1.5s timeout + fallback)...');

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
    console.log('\n9. 📋 Enhanced 콘솔 로그 분석:');
    const rlsLogs = logs.filter(log => 
      log.includes('RLS') || 
      log.includes('timeout') ||
      log.includes('🚨') ||
      log.includes('✅') ||
      log.includes('⏰') ||
      log.includes('AuthStore') ||
      log.includes('SafeGetProfile') ||
      log.includes('fallback') ||
      log.includes('Enhanced') ||
      log.includes('safeGetProfile')
    );

    if (rlsLogs.length > 0) {
      rlsLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log}`);
      });
    } else {
      console.log('  ℹ️ Enhanced RLS 관련 로그가 발견되지 않았습니다.');
    }
    
    console.log('\n🔍 Expected New Behaviors:');
    console.log('  ✅ Should see "SafeGetProfile for user" logs');
    console.log('  ⏱️ Should complete within 1.5 seconds or show timeout');
    console.log('  📝 Should generate fallback profile if timeout occurs');
    console.log('  🏷️ Should show enhanced error classification');
    console.log('  📊 Should display query duration metrics');
    
    const hasNewLogs = rlsLogs.some(log => 
      log.includes('SafeGetProfile') || 
      log.includes('fallback profile') ||
      log.includes('Query completed in')
    );
    
    if (hasNewLogs) {
      console.log('\n🎉 SUCCESS: Enhanced RLS handling is working!');
    } else {
      console.log('\n⚠️ WARNING: Enhanced features may not be fully active');
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

// Additional helper to test specific scenarios
export { testRLSTimeoutFix };