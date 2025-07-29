import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WebVital {
  name: string;
  value: number;
  timestamp: number;
  unit?: string;
}

interface LoadTime {
  page: string;
  duration: number;
  timestamp: number;
}

interface ApiCall {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  name?: string;
  value?: number;
  unit?: string;
  additional?: {
    apiName?: string;
  };
}

interface ComponentMetric {
  name: string;
  renderTime: number;
  timestamp: number;
  value?: number;
  unit?: string;
  additional?: {
    componentName?: string;
  };
}

interface PerformanceData {
  webVitals: WebVital[];
  loadTimes: LoadTime[];
  apiCalls: ApiCall[];
  components: ComponentMetric[];
  summary: Record<string, number>;
}

/**
 * 개발환경에서 성능 지표를 실시간으로 보여주는 컴포넌트
 */
export const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: [],
    loadTimes: [],
    apiCalls: [],
    components: [],
    summary: {}
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 개발환경에서만 표시
    if (process.env.NODE_ENV !== 'development') return;

    const updateData = () => {
      const report = performanceMonitor.generateReport();
      setPerformanceData(report);
    };

    // 초기 데이터 로드
    updateData();

    // 5초마다 업데이트
    const interval = setInterval(updateData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        📊 성능
      </Button>
    );
  }

  const getWebVitalStatus = (name: string, value: number) => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'secondary';

    if (value <= threshold.good) return 'default'; // green
    if (value <= threshold.poor) return 'secondary'; // yellow
    return 'destructive'; // red
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') {
      return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === 'score') {
      return value.toFixed(3);
    }
    if (unit === 'MB') {
      return `${value.toFixed(1)}MB`;
    }
    return `${Math.round(value)}${unit}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-background/95 backdrop-blur border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">성능 모니터</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Core Web Vitals */}
          {performanceData.webVitals.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Core Web Vitals</h4>
              <div className="flex flex-wrap gap-1">
                {performanceData.webVitals.slice(-5).map((metric, index) => (
                  <Badge
                    key={index}
                    variant={getWebVitalStatus(metric.name, metric.value)}
                    className="text-xs"
                  >
                    {metric.name}: {formatValue(metric.value, metric.unit)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* API 호출 */}
          {performanceData.apiCalls.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">
                API 호출 (평균: {formatValue(performanceData.summary.avgApiResponseTime, 'ms')})
              </h4>
              <div className="space-y-1">
                {performanceData.apiCalls.slice(-3).map((metric, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="truncate flex-1">
                      {metric.additional?.apiName || metric.name}
                    </span>
                    <Badge variant={metric.value > 1000 ? 'destructive' : 'secondary'}>
                      {formatValue(metric.value, metric.unit)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 컴포넌트 렌더링 */}
          {performanceData.components.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">
                컴포넌트 렌더링 (평균: {formatValue(performanceData.summary.avgComponentRenderTime, 'ms')})
              </h4>
              <div className="space-y-1">
                {performanceData.components.slice(-3).map((metric, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="truncate flex-1">
                      {metric.additional?.componentName || metric.name}
                    </span>
                    <Badge variant={metric.value > 100 ? 'destructive' : 'secondary'}>
                      {formatValue(metric.value, metric.unit)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 요약 정보 */}
          <div>
            <h4 className="font-medium mb-2">요약</h4>
            <div className="text-xs text-muted-foreground">
              총 메트릭: {performanceData.summary.totalMetrics}개
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const report = performanceMonitor.generateReport();
                console.log('Performance Report:', report);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              콘솔 출력
            </Button>
            <Button
              onClick={() => {
                const data = performanceMonitor.exportMetrics();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-metrics-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              다운로드
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;