## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Auth)
- React Query (State Management)
- Sentry (Error Logging & Performance Monitoring)

## Sentry 설정 방법

프로덕션 환경에서 에러 로깅을 위해 Sentry를 설정하세요:

1. **Sentry 프로젝트 생성**
   - [Sentry.io](https://sentry.io)에서 계정 생성
   - 새 React 프로젝트 생성

2. **환경 변수 설정**
   ```bash
   # .env.local 파일에 추가
   VITE_SENTRY_DSN=your-sentry-dsn-here
   VITE_SENTRY_ORG=your-sentry-org
   VITE_SENTRY_PROJECT=your-sentry-project
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   ```

3. **기능**
   - 자동 에러 포착 및 리포팅
   - React Error Boundary 통합
   - 인증 에러 추적
   - Supabase 에러 모니터링
   - 성능 모니터링
   - 사용자 컨텍스트 추적
   - 브레드크럼 자동 생성

4. **개발 환경**
   - DSN이 설정되지 않으면 콘솔에만 로그 출력
   - 프로덕션에서만 Sentry로 에러 전송
