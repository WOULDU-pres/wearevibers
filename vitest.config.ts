/**
 * Vitest 설정 파일
 * 유닛 테스트 및 컴포넌트 테스트 환경 구성
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  test: {
    // 테스트 환경 설정
    environment: 'jsdom',
    
    // 전역 설정
    globals: true,
    
    // 셋업 파일
    setupFiles: ['./src/test/setup.ts'],
    
    // 포함할 테스트 파일 패턴
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    // 제외할 파일/폴더
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'public',
      'e2e'
    ],
    
    // 커버리지 설정
    coverage: {
      // 커버리지 제공자
      provider: 'v8',
      
      // 리포터 설정
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // 커버리지 출력 디렉토리
      reportsDirectory: './coverage',
      
      // 커버리지 포함할 파일
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
        '!src/**/*.d.ts',
        '!src/test/**',
        '!src/types/**',
        '!src/main.tsx',
        '!src/App.tsx'
      ],
      
      // 커버리지 제외할 파일
      exclude: [
        'node_modules',
        'dist',
        'public',
        '**/*.config.{js,ts}',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.stories.{js,ts,jsx,tsx}',
        '**/vite.config.ts',
        '**/vitest.config.ts'
      ],
      
      // 커버리지 임계값
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // 특정 파일/폴더별 임계값
        'src/lib/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/components/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      
      // 모든 파일 포함 (테스트되지 않은 파일도 0%로 표시)
      all: true,
      
      // 커버리지 결과에서 빈 줄 건너뛰기
      skipFull: false
    },
    
    // 테스트 실행 옵션
    testTimeout: 10000, // 10초
    hookTimeout: 10000, // 10초
    
    // 병렬 실행 설정
    poolOptions: {
      threads: {
        // 최대 워커 수
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 재시도 설정
    retry: 2,
    
    // 워치 모드 옵션
    watch: false,
    
    // 리포터 설정
    reporter: [
      'default',
      'verbose',
      'json',
      'html'
    ],
    
    // 출력 파일 설정
    outputFile: {
      json: './test-results.json',
      html: './test-results.html'
    },
    
    // 환경 변수
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3000',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key'
    },
    
    // UI 모드 설정 (선택사항)
    ui: true,
    open: false, // 자동으로 브라우저 열지 않기
    
    // 스냅샷 테스트 설정
    resolveSnapshotPath: (testPath, snapExtension) => {
      return path.join(
        path.dirname(testPath),
        '__snapshots__',
        `${path.basename(testPath)}${snapExtension}`
      );
    },
    
    // 테스트 파일 변환 설정
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.[jt]sx?$/]
    },
    
    // 테스트 실행 전/후 훅
    globalSetup: './src/test/global-setup.ts',
    globalTeardown: './src/test/global-teardown.ts',
    
    // 개별 테스트별 설정
    testNamePattern: undefined, // 특정 패턴의 테스트만 실행
    
    // 파일 감시 무시 패턴
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/build/**'
    ],
    
    // 베일 모드 (첫 번째 실패 시 중단)
    bail: 0, // 0은 비활성화, 1은 첫 실패 시 중단
    
    // 테스트 분리 모드
    isolate: true,
    
    // Pool 설정
    pool: 'threads',
    
    // 실험적 기능
    experimental: {
      // 타입스크립트 타입 체킹
      typecheck: {
        enabled: true,
        only: false,
        checker: 'tsc',
        include: ['src/**/*.{test,spec}-d.ts'],
        exclude: ['node_modules']
      }
    }
  },
  
  // 빌드 옵션 (테스트용)
  build: {
    // 의존성 인라인화
    rollupOptions: {
      external: ['@testing-library/jest-dom']
    }
  },
  
  // 개발 서버 옵션
  server: {
    // 테스트 환경에서는 HMR 비활성화
    hmr: false
  },
  
  // 최적화 설정
  optimizeDeps: {
    include: [
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event'
    ]
  }
});