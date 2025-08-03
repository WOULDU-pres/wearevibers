import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // 개발 서버 최적화
    hmr: {
      overlay: false
    },
    // 개발 서버 gzip 압축
    compress: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // 벤더 청크 자동 분할
    splitVendorChunkPlugin(),
    // Sentry 플러그인은 프로덕션 빌드에서만 활성화
    mode === "production" && process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourceMaps: {
        assets: ["./dist/**"],
      },
      telemetry: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 개발 환경 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react'
    ],
    exclude: ['@sentry/vite-plugin']
  },
  // ESBuild 최적화
  esbuild: {
    // 프로덕션에서 console.log 제거
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // 최소화 옵션
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production',
  },
  build: {
    // 소스맵 설정 (개발: detailed, 프로덕션: hidden)
    sourcemap: mode === 'development' ? true : 'hidden',
    // 번들 최적화 설정
    rollupOptions: {
      // 외부 종속성 (CDN 사용 시)
      external: mode === 'production' ? [] : [],
      output: {
        // 수동 청크 분할 최적화
        manualChunks: (id) => {
          // 벤더 라이브러리 (React 생태계)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI 컴포넌트 라이브러리 (Radix UI)
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // 백엔드 서비스
            if (id.includes('supabase') || id.includes('@tanstack/react-query')) {
              return 'vendor-backend';
            }
            // 폼 및 validation
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // 애니메이션 및 UI 효과
            if (id.includes('framer-motion') || id.includes('canvas-confetti')) {
              return 'vendor-animation';
            }
            // 에디터 및 마크다운
            if (id.includes('@mdxeditor') || id.includes('react-markdown') || id.includes('react-syntax-highlighter')) {
              return 'vendor-editor';
            }
            // 모니터링 및 분석
            if (id.includes('@sentry') || id.includes('web-vitals')) {
              return 'vendor-monitoring';
            }
            // 기타 유틸리티
            if (id.includes('date-fns') || id.includes('dompurify') || id.includes('clsx')) {
              return 'vendor-utils';
            }
            // 기타 라이브러리
            return 'vendor-misc';
          }
          // 애플리케이션 코드 분할
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/lib/')) {
            return 'lib';
          }
        },
        // 청크 파일명 최적화 (캐싱 친화적)
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          // 벤더 청크는 길게 캐시
          if (name.startsWith('vendor-')) {
            return `js/vendor/[name].[hash].js`;
          }
          // 앱 청크는 짧게 캐시
          return `js/[name].[hash].js`;
        },
        // 진입점 파일명
        entryFileNames: 'js/[name].[hash].js',
        // 에셋 파일명 최적화
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const extType = info[info.length - 1];
          
          // 이미지 파일
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
            return `img/[name].[hash].${extType}`;
          }
          // CSS 파일
          if (/css/i.test(extType)) {
            return `css/[name].[hash].${extType}`;
          }
          // 폰트 파일
          if (/woff2?|ttf|eot/i.test(extType)) {
            return `fonts/[name].[hash].${extType}`;
          }
          // 기타 에셋
          return `assets/[name].[hash].${extType}`;
        }
      }
    },
    // 타겟 브라우저 설정 (최신 브라우저 지원)
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // 압축 설정
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        // 프로덕션에서 debug 코드 제거
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // 죽은 코드 제거
        dead_code: true,
        // 사용하지 않는 함수 제거
        unused: true,
        // 조건문 최적화
        conditionals: true,
        // 변수 인라인화
        inline: 2,
        // 압축 패스 수 증가
        passes: 2
      },
      mangle: {
        safari10: true,
        // 클래스명 압축
        properties: {
          regex: /^_/
        }
      },
      format: {
        // 주석 제거
        comments: false
      }
    },
    // 청크 크기 설정 (더 작은 단위로)
    chunkSizeWarningLimit: 500, // 500KB
    // CSS 코드 분할 활성화
    cssCodeSplit: true,
    // CSS 압축
    cssMinify: mode === 'production',
    // 번들 분석을 위한 설정
    reportCompressedSize: false, // 빌드 속도 향상
    // 에셋 인라인 임계값 (더 작은 파일은 인라인)
    assetsInlineLimit: 4096 // 4KB
  },
  
  // CSS 전처리기 설정
  css: {
    devSourcemap: mode === 'development',
    // PostCSS 플러그인 최적화
    postcss: {
      plugins: [
        // 추후 autoprefixer 등 추가 가능
      ]
    },
    // CSS 모듈 설정
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // 미리보기 서버 설정
  preview: {
    port: 4173,
    host: '::',
    // 정적 파일 압축
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  
  // 로거 설정
  logLevel: mode === 'production' ? 'warn' : 'info',
  
  // 빌드 성능 최적화
  define: {
    // 개발/프로덕션 환경 변수 최적화
    __DEV__: mode === 'development',
    __PROD__: mode === 'production'
  },
}));
