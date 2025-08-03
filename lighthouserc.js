/**
 * Lighthouse CI 설정
 * 성능, 접근성, SEO, 모범 사례 자동 측정
 */

module.exports = {
  ci: {
    // 수집 설정
    collect: {
      // 측정할 URL들
      url: [
        'http://localhost:8080',
        'http://localhost:8080/login',
        'http://localhost:8080/signup',
        'http://localhost:8080/lounge',
        'http://localhost:8080/tips',
        'http://localhost:8080/members',
        'http://localhost:8080/profile'
      ],
      // 수집 옵션
      settings: {
        // Chrome 설정
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        // 디바이스 에뮬레이션
        preset: 'desktop', // 또는 'mobile'
        // 측정 반복 횟수
        numberOfRuns: 3,
        // 네트워크 조건 시뮬레이션
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1600,
          uploadThroughputKbps: 750
        }
      },
      // 서버 시작 명령
      startServerCommand: 'npm run preview',
      // 서버가 준비될 때까지 기다릴 URL
      startServerReadyPattern: 'Local:',
      // 서버 시작 대기 시간 (밀리초)
      startServerReadyTimeout: 30000
    },
    
    // 업로드 설정 (선택사항)
    upload: {
      // 결과를 저장할 위치
      target: 'temporary-public-storage',
      // 또는 자체 서버 사용시:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token'
    },
    
    // Assertion 설정 (성능 기준)
    assert: {
      // 전체 점수 기준
      assertions: {
        // 성능 점수 (0-100)
        'categories:performance': ['error', { minScore: 0.9 }],
        
        // 접근성 점수 (0-100)
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // 모범 사례 점수 (0-100)
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO 점수 (0-100)
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // PWA 점수 (선택사항)
        // 'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        
        // 다른 성능 지표
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // 번들 크기
        'total-byte-weight': ['warn', { maxNumericValue: 2000000 }], // 2MB
        
        // 접근성 관련
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'heading-order': 'warn',
        'landmark-one-main': 'warn',
        'list': 'warn',
        'meta-viewport': 'error',
        
        // SEO 관련
        'meta-description': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
        'hreflang': 'warn',
        
        // 보안 관련
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'warn',
        'no-vulnerable-libraries': 'error',
        
        // 성능 관련
        'uses-text-compression': 'warn',
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'efficient-animated-content': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'uses-responsive-images': 'warn',
        'uses-rel-preload': 'warn',
        'uses-rel-preconnect': 'warn',
        'font-display': 'warn',
        'prioritize-lcp-image': 'warn',
        
        // 모바일 최적화
        'viewport': 'error',
        'content-width': 'error',
        'tap-targets': 'error'
      },
      
      // 특정 URL별 설정
      assertMatrix: [
        {
          matchingUrlPattern: 'http://localhost:8080/$',
          assertions: {
            // 홈페이지는 더 엄격한 기준
            'categories:performance': ['error', { minScore: 0.95 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 2000 }]
          }
        },
        {
          matchingUrlPattern: '.*/(login|signup)$',
          assertions: {
            // 인증 페이지는 SEO 점수 완화
            'categories:seo': ['warn', { minScore: 0.8 }]
          }
        }
      ]
    }
  }
};

// 환경별 설정
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서는 더 엄격한 기준 적용
  module.exports.ci.assert.assertions['categories:performance'][1].minScore = 0.95;
  module.exports.ci.assert.assertions['largest-contentful-paint'][1].maxNumericValue = 2000;
  module.exports.ci.assert.assertions['first-input-delay'][1].maxNumericValue = 50;
  
  // 프로덕션 URL로 변경
  module.exports.ci.collect.url = module.exports.ci.collect.url.map(url => 
    url.replace('http://localhost:8080', 'https://wearevibers.vercel.app')
  );
}

// CI 환경별 설정
if (process.env.CI) {
  // CI 환경에서는 서버 시작 명령 제거 (이미 실행 중이라고 가정)
  delete module.exports.ci.collect.startServerCommand;
  
  // CI에서는 headless 모드로 실행
  module.exports.ci.collect.settings.chromeFlags.push('--headless');
}