import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-2 text-destructive mb-4">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
        </div>
        
        <p className="text-muted-foreground mb-4">
          예상치 못한 오류가 발생했습니다. 문제가 지속되면 새로고침하거나 홈페이지로 돌아가세요.
        </p>
        
        <details className="mb-4 p-3 bg-muted rounded text-sm">
          <summary className="cursor-pointer font-medium mb-2">오류 상세 정보</summary>
          <pre className="whitespace-pre-wrap break-all text-xs">
            {error.message}
          </pre>
        </details>
        
        <div className="flex gap-2">
          <Button 
            onClick={resetErrorBoundary}
            variant="default"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught an error:', error, errorInfo);
        
        // 프로덕션 환경에서는 에러 로깅 서비스로 전송
        if (process.env.NODE_ENV === 'production') {
          // TODO: 에러 로깅 서비스 연동 (예: Sentry, LogRocket 등)
          console.log('Error would be sent to logging service in production');
        }
      }}
      onReset={() => {
        // 에러 상태 초기화 시 추가 정리 작업이 필요한 경우 여기에 구현
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}