import { useRef, useCallback } from 'react';

/**
 * 메모리 누수 방지를 위한 cleanup 훅들
 */

/**
 * useEffect cleanup 패턴을 강제하는 훅
 */
export const useCleanupEffect = (
  effect: () => (() => void) | void,
  deps?: React.DependencyList
) => {
  useEffect(() => {
    const cleanup = effect();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // deps는 호출자가 제공하는 dependency array
};

/**
 * Supabase 채널 자동 cleanup 훅
 */
export const useSupabaseChannel = (
  channelName: string,
  subscriptionCallback: (channel: import('@supabase/supabase-js').RealtimeChannel) => void
) => {
  const channelRef = useRef<import('@supabase/supabase-js').RealtimeChannel | null>(null);

  useEffect(() => {
    // 동적 import로 supabase 로드 (번들 크기 최적화)
    const setupChannel = async () => {
      const { supabase } = await import('@/lib/supabase');
      
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      subscriptionCallback(channel);
    };

    setupChannel();

    // Cleanup: 채널 해제
    return () => {
      if (channelRef.current) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.removeChannel(channelRef.current!);
          channelRef.current = null;
        });
      }
    };
  }, [channelName, subscriptionCallback]);

  return channelRef.current;
};

/**
 * Interval 자동 cleanup 훅
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // callback을 ref에 저장하여 최신 버전 유지
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);
};

/**
 * Timeout 자동 cleanup 훅
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (delay === null) return;

    timeoutRef.current = setTimeout(() => {
      savedCallback.current();
      timeoutRef.current = null;
    }, delay);

    return clear;
  }, [delay, clear]);

  return clear;
};

/**
 * EventListener 자동 cleanup 훅
 */
export const useEventListener = <T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element?: Element | Window | null,
  options?: AddEventListenerOptions
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element ?? window;
    if (!targetElement?.addEventListener) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[T]);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
};

/**
 * ResizeObserver 자동 cleanup 훅
 */
export const useResizeObserver = <T extends Element>(
  callback: (entries: ResizeObserverEntry[]) => void
) => {
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const setElement = useCallback((element: T | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!window.ResizeObserver) {
      console.warn('ResizeObserver is not supported');
      return;
    }

    observerRef.current = new ResizeObserver(callback);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [callback]);

  return setElement;
};

/**
 * AbortController 자동 cleanup 훅
 */
export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAbortController = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return abort; // cleanup에서 abort 호출
  }, [abort]);

  return { getAbortController, abort };
};

/**
 * 메모리 누수 디버깅 훅 (개발환경에서만 사용)
 */
export const useMemoryLeakDetector = (componentName: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const mountTime = Date.now();
    console.warn(`🔧 [${componentName}] Component mounted at ${mountTime}`);

    // 컴포넌트가 장시간 마운트되어 있는지 확인
    const checkLongMount = setTimeout(() => {
      console.warn(`⚠️ [${componentName}] Component has been mounted for over 5 minutes. Check for memory leaks.`);
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(checkLongMount);
      const unmountTime = Date.now();
      const duration = unmountTime - mountTime;
      console.warn(`🔧 [${componentName}] Component unmounted after ${duration}ms`);
    };
  }, [componentName]);
};

/**
 * 복합 cleanup 훅 - 여러 cleanup을 한번에 관리
 */
export const useMultipleCleanup = () => {
  const cleanupFunctions = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return runCleanup;
  }, [runCleanup]);

  return { addCleanup, runCleanup };
};