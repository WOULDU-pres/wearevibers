/**
 * 종합 모니터링 시스템
 * 성능, 에러, 사용자 경험 메트릭 수집 및 분석
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, type Metric } from 'web-vitals';

// 모니터링 설정
interface MonitoringConfig {
  enableWebVitals: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableUserTracking: boolean;
  sampleRate: number;
  apiEndpoint?: string;
}

const defaultConfig: MonitoringConfig = {
  enableWebVitals: import.meta.env.VITE_WEB_VITALS_ENABLED === 'true',
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableUserTracking: true,
  sampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  apiEndpoint: import.meta.env.VITE_PERFORMANCE_API_URL
};

// 메트릭 데이터 타입
interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
}

interface ErrorMetric {
  message: string;
  stack?: string;
  filename: string;
  lineno: number;
  colno: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

interface UserMetric {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
}

class MonitoringService {
  private config: MonitoringConfig;
  private sessionId: string;
  private userId?: string;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private init(): void {
    if (this.config.enableWebVitals) {
      this.initWebVitals();
    }

    if (this.config.enableErrorTracking) {
      this.initErrorTracking();
    }

    if (this.config.enablePerformanceTracking) {
      this.initPerformanceTracking();
    }

    if (this.config.enableUserTracking) {
      this.initUserTracking();
    }
  }

  private initWebVitals(): void {
    const reportMetric = (metric: Metric) => {
      if (Math.random() > this.config.sampleRate) return;

      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection?.effectiveType
      };

      this.sendMetric('performance', performanceMetric);
    };

    // Core Web Vitals 수집
    getCLS(reportMetric);
    getFCP(reportMetric);
    getFID(reportMetric);
    getLCP(reportMetric);
    getTTFB(reportMetric);
  }

  private initErrorTracking(): void {
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      const errorMetric: ErrorMetric = {
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId
      };

      this.sendMetric('error', errorMetric);
    });

    // Promise rejection 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      const errorMetric: ErrorMetric = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        filename: 'unknown',
        lineno: 0,
        colno: 0,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.userId
      };

      this.sendMetric('error', errorMetric);
    });
  }

  private initPerformanceTracking(): void {
    // 페이지 로드 성능
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = [
            { name: 'dns_lookup', value: navigation.domainLookupEnd - navigation.domainLookupStart },
            { name: 'tcp_connect', value: navigation.connectEnd - navigation.connectStart },
            { name: 'request_time', value: navigation.responseStart - navigation.requestStart },
            { name: 'response_time', value: navigation.responseEnd - navigation.responseStart },
            { name: 'dom_processing', value: navigation.domContentLoadedEventStart - navigation.responseEnd },
            { name: 'load_complete', value: navigation.loadEventEnd - navigation.loadEventStart }
          ];

          metrics.forEach(metric => {
            if (metric.value > 0) {
              this.sendMetric('performance', {
                name: metric.name,
                value: metric.value,
                id: this.generateSessionId(),
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
              });
            }
          });
        }
      }, 0);
    });

    // 리소스 로딩 성능
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          this.sendMetric('performance', {
            name: 'resource_load',
            value: resource.duration,
            id: resource.name,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private initUserTracking(): void {
    // 페이지 방문 추적
    this.trackEvent('page_view', 'navigation', 'view', window.location.pathname);

    // 페이지 이탈 추적
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', 'navigation', 'unload', window.location.pathname);
    });

    // 클릭 이벤트 추적 (샘플링)
    document.addEventListener('click', (event) => {
      if (Math.random() > 0.1) return; // 10% 샘플링

      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const {className} = target;
      const {id} = target;

      this.trackEvent('user_interaction', 'click', tagName, `${id}-${className}`);
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number
  ): void {
    if (!this.config.enableUserTracking) return;

    const userMetric: UserMetric = {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.sendMetric('user', userMetric);
  }

  public trackCustomMetric(name: string, value: number, attributes?: Record<string, any>): void {
    const customMetric: PerformanceMetric = {
      name: `custom_${name}`,
      value,
      id: this.generateSessionId(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...attributes
    };

    this.sendMetric('custom', customMetric);
  }

  private async sendMetric(type: string, data: any): Promise<void> {
    try {
      // Console logging for development
      if (import.meta.env.NODE_ENV === 'development') {
        console.group(`📊 ${type.toUpperCase()} Metric`);
        console.warn(data);
        console.groupEnd();
      }

      // Send to external monitoring service
      if (this.config.apiEndpoint) {
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            data,
            timestamp: Date.now()
          }),
          keepalive: true
        }).catch(err => {
          console.warn('Failed to send metric:', err);
        });
      }

      // Send to Sentry if available
      if (window.Sentry && type === 'error') {
        window.Sentry.captureException(new Error(data.message), {
          extra: data
        });
      }

    } catch (error) {
      console.warn('Failed to send metric:', error);
    }
  }

  // 성능 버지 계산
  public getPerformanceBudget(): {
    fcp: { tar_get: number; current?: number; status: 'good' | 'needs-improvement' | 'poor' };
    lcp: { tar_get: number; current?: number; status: 'good' | 'needs-improvement' | 'poor' };
    fid: { tar_get: number; current?: number; status: 'good' | 'needs-improvement' | 'poor' };
    cls: { tar_get: number; current?: number; status: 'good' | 'needs-improvement' | 'poor' };
    ttfb: { tar_get: number; current?: number; status: 'good' | 'needs-improvement' | 'poor' };
  } {
    return {
      fcp: { tar_get: 1800, status: 'good' }, // 1.8s
      lcp: { tar_get: 2500, status: 'good' }, // 2.5s
      fid: { tar_get: 100, status: 'good' },  // 100ms
      cls: { tar_get: 0.1, status: 'good' },  // 0.1
      ttfb: { tar_get: 800, status: 'good' }  // 800ms
    };
  }
}

// 글로벌 인스턴스 생성
export const monitoring = new MonitoringService();

// React Hook for component-level monitoring
export const useMonitoring = () => {
  return {
    trackEvent: monitoring.trackEvent.bind(monitoring),
    trackCustomMetric: monitoring.trackCustomMetric.bind(monitoring),
    setUserId: monitoring.setUserId.bind(monitoring)
  };
};

// 타입 선언 확장
declare global {
  interface Window {
    Sentry?: any;
  }
}

export default MonitoringService;