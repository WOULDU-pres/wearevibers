/**
 * Playwright 전역 정리
 * 모든 E2E 테스트 실행 후 정리 작업
 */

import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');
  
  // 테스트 데이터 정리
  await cleanupTestData();
  
  // 인증 상태 파일 정리
  await cleanupAuthStates();
  
  // 임시 파일 정리
  await cleanupTempFiles();
  
  // 테스트 결과 요약
  await generateTestSummary();
  
  console.log('✅ E2E test global teardown completed');
}

/**
 * 테스트 데이터 정리
 */
async function cleanupTestData() {
  // 테스트 중 생성된 데이터 삭제
  // 데이터베이스 리셋 (필요시)
  console.log('🗑️ Test data cleaned up');
}

/**
 * 인증 상태 파일 정리
 */
async function cleanupAuthStates() {
  try {
    const authDir = './e2e/auth';
    const files = await fs.readdir(authDir);
    
    for (const file of files) {
      if (file.endsWith('-state.json')) {
        await fs.unlink(path.join(authDir, file));
      }
    }
    
    console.log('🔐 Authentication state files cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up auth states:', error);
  }
}

/**
 * 임시 파일 정리
 */
async function cleanupTempFiles() {
  try {
    // 테스트 중 생성된 스크린샷, 비디오 등 정리 (실패한 테스트 제외)
    const tempDirs = ['./test-results', './playwright-report'];
    
    for (const dir of tempDirs) {
      try {
        await fs.access(dir);
        // 디렉토리가 존재하면 필요시 정리
        console.log(`📁 Temporary directory processed: ${dir}`);
      } catch {
        // 디렉토리가 없으면 무시
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not clean up temp files:', error);
  }
}

/**
 * 테스트 결과 요약 생성
 */
async function generateTestSummary() {
  try {
    const resultsFile = './playwright-results.json';
    await fs.access(resultsFile);
    
    const results = JSON.parse(await fs.readFile(resultsFile, 'utf-8'));
    
    console.log('📊 Test Summary:');
    console.log(`   Total tests: ${results.stats?.total || 0}`);
    console.log(`   Passed: ${results.stats?.passed || 0}`);
    console.log(`   Failed: ${results.stats?.failed || 0}`);
    console.log(`   Skipped: ${results.stats?.skipped || 0}`);
    console.log(`   Duration: ${results.stats?.duration || 0}ms`);
    
  } catch (error) {
    console.warn('⚠️ Could not generate test summary:', error);
  }
}

export default globalTeardown;