import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
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
  build: {
    // 소스맵 생성 (프로덕션에서도)
    sourcemap: true,
    // 번들 최적화 설정
    rollupOptions: {
      output: {
        // 수동 청크 분할
        manualChunks: {
          // 벤더 라이브러리 분리
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI 컴포넌트 라이브러리
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          // Supabase 관련
          supabase: ['@supabase/supabase-js'],
          // 데이터 관리
          query: ['@tanstack/react-query'],
          // 폼 관리
          form: ['react-hook-form', 'zod', '@hookform/resolvers'],
          // 유틸리티
          utils: ['date-fns', 'lucide-react', 'clsx', 'tailwind-merge'],
          // 에러 모니터링
          monitoring: ['@sentry/react', '@sentry/tracing']
        },
        // 청크 파일명 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.\w+$/, '') 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        // 에셋 파일명 최적화
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `img/[name]-[hash].${extType}`;
          }
          if (/css/i.test(extType)) {
            return `css/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        }
      }
    },
    // 타겟 브라우저 설정
    target: 'es2020',
    // 압축 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // 프로덕션에서 console 제거
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log'] : []
      },
      mangle: {
        safari10: true
      }
    },
    // 청크 크기 설정
    chunkSizeWarningLimit: 1000, // 1MB
    // CSS 코드 분할
    cssCodeSplit: true
  },
}));
