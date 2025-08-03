# WeAreVibers 🚀

> **Create, Share, Vibe Together** - 창의적인 개발자들을 위한 커뮤니티 플랫폼

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🌟 프로젝트 소개

WeAreVibers는 바이브코딩 소모임을 위한 전용 커뮤니티 플랫폼입니다. 개발자들이 자신의 창의적인 프로젝트를 자랑하고, 개발 꿀팁을 공유하며, 함께 성장할 수 있는 공간을 제공합니다.

### ✨ 주요 특징

- 🎨 **프로젝트 쇼케이스**: 창의적인 프로젝트 전시 및 피드백
- 💡 **꿀팁 허브**: 카테고리별 개발 노하우 공유
- 💬 **커뮤니티 라운지**: 주제별 토론 및 네트워킹
- 👥 **멤버 디렉토리**: 기술 스택별 개발자 발견
- 🔍 **통합 검색**: 모든 컨텐츠를 아우르는 강력한 검색
- 📱 **완벽한 반응형**: 모든 디바이스에서 최적화된 경험

## 🛠 기술 스택

### Frontend
- **React 18.3.1** - 최신 React 훅과 함수형 컴포넌트
- **TypeScript 5.5.3** - 타입 안전성과 개발자 경험 향상  
- **Tailwind CSS 3.4.11** - 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui** - 접근성 높은 모던 UI 컴포넌트
- **Framer Motion** - 부드러운 애니메이션

### Backend & Infrastructure  
- **Supabase** - 완전 관리형 백엔드 서비스
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS)
  - 실시간 구독
  - 파일 스토리지
- **TanStack Query** - 서버 상태 관리 및 캐싱
- **Zustand** - 클라이언트 상태 관리

### 개발 도구
- **Vite** - 빠른 개발 서버와 빌드
- **ESLint + TypeScript ESLint** - 코드 품질 관리
- **Sentry** - 에러 추적 및 성능 모니터링
- **Playwright** - E2E 테스트 자동화

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Supabase 계정

### 설치

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/wearevibers.git
   cd wearevibers
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` 파일에 다음 변수들을 설정하세요:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_SENTRY_DSN=your-sentry-dsn (선택사항)
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

   브라우저에서 [http://localhost:8080](http://localhost:8080)을 열어 확인하세요.

### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 데이터베이스 테이블 및 RLS 정책 설정 (자세한 설정은 `docs/supabase-setup.md` 참조)
3. 환경 변수에 프로젝트 URL과 익명 키 추가

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── ui/             # shadcn/ui 기본 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── features/       # 기능별 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 React 훅
├── lib/                # 유틸리티 라이브러리
├── types/              # TypeScript 타입 정의
├── stores/             # Zustand 상태 스토어
├── providers/          # React 컨텍스트 프로바이더
└── utils/              # 헬퍼 함수들
```

## 🎯 주요 기능

### 🎨 프로젝트 쇼케이스
- 마사네리 레이아웃으로 시각적 임팩트 극대화
- 기술 스택 태그 시스템
- 이미지 갤러리 및 뷰어
- 좋아요(Vibe) 및 댓글 시스템

### 💡 꿀팁 허브  
- 카테고리별 분류 (Productivity, CSS Tricks, Git Flow, UI/UX)
- 마크다운 에디터 지원
- 코드 신택스 하이라이팅
- 읽기 시간 추정 및 난이도 표시

### 💬 커뮤니티 라운지
- 다양한 주제 게시판 (데스크테리어, 코딩플레이리스트, IDE테마)
- 실시간 게시글 피드
- 이미지 첨부 및 뷰어

### 👥 멤버 디렉토리
- 개발자 프로필 시스템
- 기술 스택별 필터링
- 온라인 상태 표시
- 프로젝트 및 활동 지표

## 🔧 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run build:dev    # 개발 모드 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 실행
```

## 📊 성능 지표

- **First Contentful Paint**: < 1.2초
- **Largest Contentful Paint**: < 2.5초  
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **번들 크기**: 초기 로드 < 500KB

## 🛡 보안 특징

- **Row Level Security (RLS)**: 데이터베이스 레벨 보안
- **PKCE 인증 플로우**: 안전한 OAuth 구현
- **입력 검증**: Zod 스키마 기반 타입 체킹
- **XSS 방지**: DOMPurify HTML 새니타이징
- **HTTPS 강제**: 모든 통신 암호화

## ♿ 접근성

- **WCAG 2.1 AA 준수**: 스크린 리더 호환성
- **키보드 네비게이션**: 완전한 키보드 접근
- **색상 대비**: 충분한 명도 대비율
- **포커스 관리**: 명확한 포커스 표시

## 🔍 모니터링 및 분석

### Sentry 설정 (선택사항)
프로덕션 환경에서 에러 추적을 위해 Sentry를 설정할 수 있습니다:

1. [Sentry.io](https://sentry.io)에서 계정 생성 및 프로젝트 생성
2. 환경 변수에 Sentry DSN 추가
3. 자동 에러 포착 및 성능 모니터링 활성화

### 기능
- 자동 에러 포착 및 리포팅
- React Error Boundary 통합
- 사용자 컨텍스트 추적
- 성능 모니터링

## 🚀 배포

### Vercel (권장)
```bash
# Vercel CLI를 사용한 배포
npm i -g vercel
vercel --prod
```

### 수동 배포
```bash
# 프로덕션 빌드
npm run build

# dist 폴더를 웹 서버에 업로드
```

### 환경 변수 설정
배포 환경에서 다음 환경 변수들을 설정해야 합니다:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN` (선택사항)

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정, 패키지 매니저 설정 등
```

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발자**: [Your Name](https://github.com/your-username)
- **디자인**: WeAreVibers Community
- **기획**: 바이브코딩 소모임

## 🙏 감사 인사

- [shadcn/ui](https://ui.shadcn.com/) - 아름다운 UI 컴포넌트
- [Supabase](https://supabase.com/) - 강력한 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 퍼스트 CSS
- 바이브코딩 커뮤니티의 모든 멤버들

## 📞 연락처

문의사항이 있으시면 언제든 연락주세요:

- 이메일: your-email@example.com
- GitHub Issues: [이슈 생성](https://github.com/your-username/wearevibers/issues)
- 커뮤니티: [WeAreVibers 플랫폼](https://wearevibers.com)

---

**WeAreVibers와 함께 창의적인 개발자 커뮤니티를 만들어가요! 🚀**