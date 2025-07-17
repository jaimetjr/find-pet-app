import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  apiCallTime?: number;
  memoryUsage?: number;
}

interface UsePerformanceOptions {
  trackRenders?: boolean;
  trackApiCalls?: boolean;
  trackMemory?: boolean;
  logToConsole?: boolean;
}

export const usePerformance = (
  componentName: string,
  options: UsePerformanceOptions = {}
) => {
  const {
    trackRenders = true,
    trackApiCalls = true,
    trackMemory = false,
    logToConsole = __DEV__,
  } = options;

  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics[]>([]);

  // Track render performance
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
      renderCount.current++;

      return () => {
        const renderTime = performance.now() - renderStartTime.current;
        const metric: PerformanceMetrics = { renderTime };

        if (trackMemory && 'memory' in performance) {
          const memory = (performance as any).memory;
          metric.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        metrics.current.push(metric);

        if (logToConsole) {
          console.log(`[Performance] ${componentName} render #${renderCount.current}:`, {
            renderTime: `${renderTime.toFixed(2)}ms`,
            memoryUsage: metric.memoryUsage ? `${metric.memoryUsage.toFixed(2)}MB` : 'N/A',
          });
        }
      };
    }
  });

  // Track API call performance
  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    callName: string = 'API Call'
  ): Promise<T> => {
    if (!trackApiCalls) {
      return apiCall();
    }

    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const apiCallTime = performance.now() - startTime;

      const metric: PerformanceMetrics = { renderTime: 0, apiCallTime };

      if (trackMemory && 'memory' in performance) {
        const memory = (performance as any).memory;
        metric.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      metrics.current.push(metric);

      if (logToConsole) {
        console.log(`[Performance] ${componentName} ${callName}:`, {
          apiCallTime: `${apiCallTime.toFixed(2)}ms`,
          memoryUsage: metric.memoryUsage ? `${metric.memoryUsage.toFixed(2)}MB` : 'N/A',
        });
      }

      return result;
    } catch (error) {
      const apiCallTime = performance.now() - startTime;

      if (logToConsole) {
        console.error(`[Performance] ${componentName} ${callName} failed:`, {
          apiCallTime: `${apiCallTime.toFixed(2)}ms`,
          error,
        });
      }

      throw error;
    }
  }, [componentName, trackApiCalls, trackMemory, logToConsole]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    if (metrics.current.length === 0) {
      return null;
    }

    const renderTimes = metrics.current
      .filter(m => m.renderTime > 0)
      .map(m => m.renderTime);

    const apiCallTimes = metrics.current
      .filter(m => m.apiCallTime && m.apiCallTime > 0)
      .map(m => m.apiCallTime!);

    const memoryUsages = metrics.current
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!);

    const summary = {
      componentName,
      totalRenders: renderCount.current,
      averageRenderTime: renderTimes.length > 0 
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
        : 0,
      maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
      totalApiCalls: apiCallTimes.length,
      averageApiCallTime: apiCallTimes.length > 0 
        ? apiCallTimes.reduce((a, b) => a + b, 0) / apiCallTimes.length 
        : 0,
      maxApiCallTime: apiCallTimes.length > 0 ? Math.max(...apiCallTimes) : 0,
      averageMemoryUsage: memoryUsages.length > 0 
        ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length 
        : 0,
      maxMemoryUsage: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
    };

    if (logToConsole) {
      console.log(`[Performance Summary] ${componentName}:`, summary);
    }

    return summary;
  }, [componentName, logToConsole]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    metrics.current = [];
    renderCount.current = 0;
  }, []);

  return {
    trackApiCall,
    getPerformanceSummary,
    clearMetrics,
    renderCount: renderCount.current,
    metrics: metrics.current,
  };
}; 