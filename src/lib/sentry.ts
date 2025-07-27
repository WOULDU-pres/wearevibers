import React from "react";
import * as Sentry from "@sentry/react";
import { 
  createRoutesFromChildren, 
  matchRoutes, 
  useLocation,
  useNavigationType
} from "react-router-dom";

// Sentry 초기화 함수
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // DSN이 없으면 Sentry 초기화하지 않음 (개발 환경)
  if (!dsn) {
    console.log('Sentry DSN not found. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // 로그 활성화 (문서 권장사항)
    enableLogs: true,
    
    // React Router v6 통합
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      // 성능 모니터링
      Sentry.replayIntegration({
        // Session Replay 설정 (프로덕션에서만)
        maskAllText: false,
        blockAllMedia: false,
      }),
      // 콘솔 로깅 통합 (문서 권장사항)
      Sentry.consoleLoggingIntegration({
        levels: ["log", "error", "warn"]
      }),
    ],

    // 성능 모니터링 설정
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session Replay 설정
    replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 환경에서는 콘솔에만 출력
      if (import.meta.env.MODE === 'development') {
        console.error('Sentry Event:', event, hint);
        return null; // 개발 환경에서는 Sentry로 전송하지 않음
      }

      // 무시할 에러들
      const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'Script error',
        'Non-Error promise rejection captured',
      ];

      if (event.exception?.values?.[0]?.value) {
        const errorMessage = event.exception.values[0].value;
        if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
          return null;
        }
      }

      return event;
    },

    // 릴리즈 정보
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
  });
}

// Logger export (문서 권장사항)
export const logger = Sentry.logger;

// 사용자 정보 설정
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// 사용자 정보 제거
export function clearSentryUser() {
  Sentry.setUser(null);
}

// 커스텀 태그 설정
export function setSentryTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// 커스텀 컨텍스트 설정
export function setSentryContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context);
}

// 수동 에러 보고
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

// 수동 메시지 보고
export function captureMessage(
  message: string, 
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

// 브레드크럼 추가
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

// React용 HOC
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

// React Router 통합을 위한 wrapped components
export const SentryRoutes = Sentry.withSentryRouting;

// React Query 에러 처리를 위한 유틸리티
export function createQueryErrorHandler() {
  return (error: Error) => {
    captureError(error, {
      errorBoundary: 'React Query',
      errorType: 'Query Error',
    });
  };
}

// 성능 추적 유틸리티 (문서 권장사항)
export function startSpan(operation: string, name: string, callback: (span?: any) => void | Promise<void>) {
  return Sentry.startSpan(
    {
      op: operation,
      name: name,
    },
    callback
  );
}

// UI 상호작용 추적
export function trackUserInteraction(action: string, target: string, callback: () => void | Promise<void>) {
  return startSpan("ui.click", `${action} ${target}`, callback);
}

// API 호출 추적
export function trackApiCall(method: string, endpoint: string, callback: () => void | Promise<void>) {
  return startSpan("http.client", `${method} ${endpoint}`, callback);
}

// Supabase 에러 처리를 위한 유틸리티
export function handleSupabaseError(error: any, context: Record<string, any> = {}) {
  // Supabase 에러 정보 추출
  const supabaseContext = {
    ...context,
    supabase: {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    },
  };

  if (error instanceof Error) {
    captureError(error, supabaseContext);
  } else {
    captureMessage(
      `Supabase Error: ${error?.message || 'Unknown error'}`,
      'error',
      supabaseContext
    );
  }
}