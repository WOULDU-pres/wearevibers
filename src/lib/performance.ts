/**
 * 성능 모니터링 및 측정 유틸리티
 * Core Web Vitals, 사용자 경험 지표 추적
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  additional?: Record<string, any>;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = import.meta.env.MODE === 'production' || 
                    import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (this.isEnabled) {
      this.initializeObserver();
      this.setupWebVitals();
    }
  }

  private initializeObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.name,
          value: entry.startTime + entry.duration,
          unit: 'ms',
          timestamp: Date.now(),
          additional: {
            entryType: entry.entryType,
            duration: entry.duration,
          }
        });
      }
    });

    // 다양한 성능 지표 관찰
    try {
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'layout-shift'] });
    } catch (error) {
      console.warn('Some performance entry types not supported:', error);
      // 기본적인 지표만 관찰
      this.observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  private async setupWebVitals() {
    try {
      // 동적 import로 web-vitals 라이브러리 로드
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

      const sendToAnalytics = (metric: WebVitalsMetric) => {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          unit: metric.name === 'CLS' ? 'score' : 'ms',
          timestamp: Date.now(),
          additional: {
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
          }
        });

        // Sentry로 성능 지표 전송
        if (window.__SENTRY_ENABLED__) {
          this.sendToSentry(metric);
        }
      };

      // Core Web Vitals 측정
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    } catch (error) {
      console.warn('Failed to load web-vitals:', error);
    }
  }

  private sendToSentry(metric: WebVitalsMetric) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        message: `Web Vital: ${metric.name}`,
        level: 'info',
        data: {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
        },
      });

      // 성능 트랜잭션 생성
      (window as any).Sentry.startTransaction({
        name: `Web Vital: ${metric.name}`,
        op: 'web-vital',
        data: metric,
      }).finish();
    }
  }

  recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // 메트릭이 너무 많이 쌓이지 않도록 관리
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // 콘솔에 중요한 메트릭 로그
    if (['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(metric.name)) {
      console.log(`🚀 ${metric.name}: ${metric.value}${metric.unit}`);
    }
  }

  // 페이지 로드 시간 측정
  measurePageLoad() {
    if (!this.isEnabled) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.recordMetric({
        name: 'Page Load Time',
        value: navigation.loadEventEnd - navigation.fetchStart,
        unit: 'ms',
        timestamp: Date.now(),
        additional: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          timeToFirstByte: navigation.responseStart - navigation.fetchStart,
        }
      });
    }
  }

  // API 응답 시간 측정
  measureApiCall(apiName: string, startTime: number, endTime: number, status?: number) {
    if (!this.isEnabled) return;

    this.recordMetric({
      name: `API: ${apiName}`,
      value: endTime - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      additional: {
        status: status || 200,
        apiName,
      }
    });
  }

  // 컴포넌트 렌더링 시간 측정
  measureComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;

    this.recordMetric({
      name: `Component: ${componentName}`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      additional: {
        componentName,
      }
    });
  }

  // 메모리 사용량 측정
  measureMemoryUsage() {
    if (!this.isEnabled || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    this.recordMetric({
      name: 'Memory Usage',
      value: memory.usedJSHeapSize / 1024 / 1024, // MB 단위
      unit: 'MB',
      timestamp: Date.now(),
      additional: {
        totalJSHeapSize: memory.totalJSHeapSize / 1024 / 1024,
        jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024 / 1024,
      }
    });
  }

  // 번들 크기 분석
  analyzeBundleSize() {
    if (!this.isEnabled) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalJSSize = 0;
    let totalCSSSize = 0;
    let totalImageSize = 0;

    resources.forEach(resource => {
      const transferSize = resource.transferSize || 0;
      
      if (resource.name.includes('.js')) {
        totalJSSize += transferSize;
      } else if (resource.name.includes('.css')) {
        totalCSSSize += transferSize;
      } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
        totalImageSize += transferSize;
      }
    });

    this.recordMetric({
      name: 'Bundle Analysis',
      value: totalJSSize + totalCSSSize + totalImageSize,
      unit: 'bytes',
      timestamp: Date.now(),
      additional: {
        jsSize: totalJSSize,
        cssSize: totalCSSSize,
        imageSize: totalImageSize,
      }
    });
  }

  // 성능 보고서 생성
  generateReport(): {
    webVitals: PerformanceMetric[];
    loadTimes: PerformanceMetric[];
    apiCalls: PerformanceMetric[];
    components: PerformanceMetric[];
    summary: Record<string, number>;
  } {
    const webVitals = this.metrics.filter(m => ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(m.name));
    const loadTimes = this.metrics.filter(m => m.name.includes('Load Time'));
    const apiCalls = this.metrics.filter(m => m.name.startsWith('API:'));
    const components = this.metrics.filter(m => m.name.startsWith('Component:'));

    const summary = {
      totalMetrics: this.metrics.length,
      avgApiResponseTime: apiCalls.length > 0 
        ? apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length 
        : 0,
      avgComponentRenderTime: components.length > 0
        ? components.reduce((sum, m) => sum + m.value, 0) / components.length
        : 0,
    };

    return {
      webVitals,
      loadTimes,
      apiCalls,
      components,
      summary,
    };
  }

  // 성능 지표 내보내기 (분석용)
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  // 정리
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics = [];
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// React 컴포넌트용 훅
import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current;
        performanceMonitor.measureComponentRender(componentName, renderTime);
      }
    };
  }, [componentName]);

  const measureApiCall = (apiName: string, promise: Promise<any>) => {
    const startTime = performance.now();
    
    return promise
      .then(result => {
        performanceMonitor.measureApiCall(apiName, startTime, performance.now(), 200);
        return result;
      })
      .catch(error => {
        performanceMonitor.measureApiCall(apiName, startTime, performance.now(), error.status || 500);
        throw error;
      });
  };

  return { measureApiCall };
};

// 페이지 로드 완료 시 자동 측정
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.measurePageLoad();
      performanceMonitor.measureMemoryUsage();
      performanceMonitor.analyzeBundleSize();
    }, 1000);
  });

  // 메모리 사용량 주기적 측정
  setInterval(() => {
    performanceMonitor.measureMemoryUsage();
  }, 60000); // 1분마다
}