import { useRef, useState, useCallback, useEffect } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
  ref: React.RefObject<HTMLElement>;
}

/**
 * 성능 최적화된 Intersection Observer 훅
 * 무한 스크롤, 지연 로딩 등에 사용
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const ref = useRef<HTMLElement>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = useCallback(
    ([entry]: IntersectionObserverEntry[]): void => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      if (frozen) {
        // 한 번 visible 상태가 되면 observer 해제
        
      }
    },
    [frozen]
  );

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, frozen, updateEntry]);

  return { isIntersecting, entry, ref };
};

/**
 * 무한 스크롤용 특화 훅
 */
export const useInfiniteScroll = (
  callback: () => void,
  options: {
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    rootMargin?: string;
    threshold?: number;
  } = {}
) => {
  const {
    hasNextPage = true,
    isFetchingNextPage = false,
    rootMargin = '100px',
    threshold = 0.1,
  } = options;

  const { isIntersecting, ref } = useIntersectionObserver({
    rootMargin,
    threshold,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      callback();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, callback]);

  return { ref, isIntersecting };
};

/**
 * 이미지 지연 로딩용 훅
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [_imageRef, _setImageRef] = useState<HTMLImageElement | null>(null);
  
  const { isIntersecting } = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (isIntersecting && src !== imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc]);

  return {
    imageSrc,
    setImageRef: _setImageRef,
    isLoaded: imageSrc === src,
  };
};