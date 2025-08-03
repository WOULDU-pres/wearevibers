import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  captureError, 
  captureMessage, 
  addBreadcrumb, 
  trackUserInteraction,
  startSpan,
  logger 
} from '@/lib/sentry';

export const SentryTestButton = () => {
  const testErrorCapture = () => {
    trackUserInteraction("test", "error button", () => {
      try {
        // 의도적으로 에러 발생
        throw new Error('테스트 에러: Sentry 연동 확인');
      } catch (error) {
        captureError(error as Error, {
          testContext: 'manual error test',
          timestamp: new Date().toISOString(),
          userAction: 'button click',
        });
      }
    });
  };

  const testMessageCapture = () => {
    trackUserInteraction("test", "message button", () => {
      captureMessage('테스트 메시지: Sentry 로깅 시스템 작동 확인', 'info', {
        testContext: 'manual message test',
        timestamp: new Date().toISOString(),
      });
    });
  };

  const testBreadcrumb = () => {
    trackUserInteraction("test", "breadcrumb button", () => {
      addBreadcrumb(
        '사용자가 Sentry 테스트 버튼을 클릭했습니다',
        'user_interaction',
        'info'
      );
      console.warn("ALERT:",'브레드크럼이 추가되었습니다. 다른 액션을 수행한 후 에러를 발생시켜 보세요.');
    });
  };

  const testPerformanceSpan = () => {
    startSpan("ui.test", "Performance Test", async (span) => {
      // 성능 테스트를 위한 임의 작업
      const startTime = Date.now();
      
      span?.setAttribute("test_type", "performance");
      span?.setAttribute("config", "test_mode");
      
      // 시뮬레이션된 비동기 작업
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const duration = Date.now() - startTime;
      span?.setAttribute("duration_ms", duration);
      
      logger.info("Performance test completed", { duration });
    });
  };

  const testLoggerFeatures = () => {
    trackUserInteraction("test", "logger button", () => {
      logger.trace("Starting logger test", { component: "SentryTestButton" });
      logger.debug(logger.fmt`Testing logger with variable: ${"test_value"}`);
      logger.info("Logger info test", { level: "info" });
      logger.warn("Logger warning test", { level: "warn" });
      logger.error("Logger error test", { level: "error" });
      
      console.warn("ALERT:",'다양한 로그 레벨이 테스트되었습니다. 콘솔을 확인해보세요.');
    });
  };

  const testErrorBoundary = () => {
    // Error Boundary를 테스트하기 위해 컴포넌트 렌더링 에러 발생
    throw new Error('Error Boundary 테스트: 컴포넌트 렌더링 에러');
  };

  return (
    <div className="p-4 border rounded-lg bg-card space-y-2">
      <h3 className="text-lg font-semibold">🔧 Sentry 테스트 도구</h3>
      <p className="text-sm text-muted-foreground">
        개발 환경에서는 콘솔에만 로그가 출력됩니다. 프로덕션에서는 Sentry로 전송됩니다.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={testErrorCapture} 
          variant="destructive" 
          size="sm"
        >
          에러 캡처 테스트
        </Button>
        
        <Button 
          onClick={testMessageCapture} 
          variant="secondary" 
          size="sm"
        >
          메시지 로깅 테스트
        </Button>
        
        <Button 
          onClick={testBreadcrumb} 
          variant="outline" 
          size="sm"
        >
          브레드크럼 테스트
        </Button>
        
        <Button 
          onClick={testPerformanceSpan} 
          variant="default" 
          size="sm"
        >
          성능 추적 테스트
        </Button>
        
        <Button 
          onClick={testLoggerFeatures} 
          variant="secondary" 
          size="sm"
        >
          Logger 테스트
        </Button>
        
        <Button 
          onClick={testErrorBoundary} 
          variant="destructive" 
          size="sm"
        >
          Error Boundary 테스트
        </Button>
      </div>
    </div>
  );
};