/**
 * Playwright E2E 테스트 설정
 * 크로스 브라우저 테스트 및 성능 측정
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './e2e',
  
  // 테스트 파일 패턴
  testMatch: '**/*.{test,spec}.{js,ts}',
  
  // 전역 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ...(process.env.CI ? [['github'] as const] : [['list'] as const]),
  ],
  
  // 전역 설정
  use: {
    // 베이스 URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    
    // 액션 간 대기 시간
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // 스크린샷 설정
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // 뷰포트 설정 (기본값, 각 프로젝트에서 오버라이드 가능)
    viewport: { width: 1280, height: 720 },
    
    // 사용자 에이전트
    userAgent: 'WeAreVibers-E2E-Tests',
    
    // 로케일 설정
    locale: 'ko-KR',
    
    // 타임존 설정
    timezoneId: 'Asia/Seoul',
    
    // 권한 설정
    permissions: ['notifications'],
    
    // 추가 HTTP 헤더
    extraHTTPHeaders: {
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    },
    
    // 오프라인 모드 (필요시)
    offline: false,
    
    // 느린 모션 (디버깅용)
    launchOptions: {
      slowMo: process.env.PLAYWRIGHT_SLOW_MO ? 1000 : 0,
    },
  },
  
  // 테스트 환경별 설정
  projects: [
    // 데스크톱 브라우저
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // 모바일 브라우저
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // 모바일에서 더 긴 타임아웃
        actionTimeout: 45000,
        navigationTimeout: 45000,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        actionTimeout: 45000,
        navigationTimeout: 45000,
      },
    },
    
    // 태블릿
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 }
      },
    },
    
    // 접근성 테스트용 설정
    {
      name: 'Accessibility Tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // 접근성 테스트를 위한 추가 설정
        reducedMotion: 'reduce',
        forcedColors: 'none',
      },
      testMatch: '**/accessibility/*.{test,spec}.{js,ts}',
    },
    
    // 성능 테스트용 설정
    {
      name: 'Performance Tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // 성능 측정을 위한 설정
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-automation',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
      testMatch: '**/performance/*.{test,spec}.{js,ts}',
    },
    
    // 시각적 회귀 테스트
    {
      name: 'Visual Tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // 일관된 스크린샷을 위한 설정
        launchOptions: {
          args: [
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-system-font-check',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text'
          ]
        }
      },
      testMatch: '**/visual/*.{test,spec}.{js,ts}',
    },
  ],
  
  // 웹 서버 설정 (로컬 개발용)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'test-key',
    }
  },
  
  // 글로벌 설정
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  
  // 테스트 실행 전 설정
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],
  
  // 기대값 설정
  expect: {
    // 스크린샷 비교 임계값
    threshold: 0.2,
    
    // 스크린샷 비교 모드
    mode: 'default',
    
    // 애니메이션 대기 설정
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'default',
      animations: 'disabled',
    },
    
    // 텍스트 비교 타임아웃
    toMatchText: {
      timeout: 30000
    }
  },
  
  // 출력 디렉토리
  outputDir: './test-results',
  
  // 최대 실패 허용 수
  maxFailures: process.env.CI ? 5 : undefined,
  
  // 메타데이터
  metadata: {
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    buildId: process.env.BUILD_ID || 'local',
  },
});