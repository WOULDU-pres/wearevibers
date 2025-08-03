import { useState, useCallback, useMemo } from 'react';

interface VirtualizedListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  items: unknown[];
}

interface VirtualizedListReturn {
  visibleItems: Array<{
    index: number;
    item: unknown;
    style: React.CSSProperties;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * 가상화된 리스트 훅
 * 대용량 데이터를 효율적으로 렌더링
 */
export const useVirtualizedList = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  items,
}: VirtualizedListOptions): VirtualizedListReturn => {
  const [scrollTop, setScrollTop] = useState(0);

  // 보이는 아이템의 시작과 끝 인덱스 계산
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 렌더링할 아이템들 계산
  const visibleItems = useMemo(() => {
    const _result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    return result;
  }, [visibleRange, items, itemHeight]);

  // 전체 높이 계산
  const totalHeight = items.length * itemHeight;

  // 스크롤 핸들러
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // 특정 인덱스로 스크롤
  const scrollToIndex = useCallback((index: number) => {
    const element = document.querySelector(`[data-virtual-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    handleScroll,
  };
};

/**
 * 적응형 가상화 리스트 훅
 * 아이템 높이가 다른 경우에 사용
 */
export const useAdaptiveVirtualizedList = (
  items: unknown[],
  estimatedItemHeight: number = 50,
  containerHeight: number,
  overscan: number = 5
) => {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);

  // 아이템 높이 측정
  const measureItem = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  // 누적 높이 계산
  const itemOffsets = useMemo(() => {
    let offset = 0;
    const offsets = new Map<number, number>();
    
    for (let i = 0; i < items.length; i++) {
      offsets.set(i, offset);
      const height = itemHeights.get(i) || estimatedItemHeight;
      offset += height;
    }
    
    return offsets;
  }, [items.length, itemHeights, estimatedItemHeight]);

  // 보이는 범위 계산
  const visibleRange = useMemo(() => {
    let start = 0;
    let end = items.length - 1;

    // 시작 인덱스 찾기
    for (let i = 0; i < items.length; i++) {
      const offset = itemOffsets.get(i) || 0;
      if (offset >= scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // 끝 인덱스 찾기
    for (let i = start; i < items.length; i++) {
      const offset = itemOffsets.get(i) || 0;
      if (offset >= scrollTop + containerHeight) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemOffsets, items.length, overscan]);

  // 전체 높이 계산
  const totalHeight = useMemo(() => {
    const lastIndex = items.length - 1;
    const lastOffset = itemOffsets.get(lastIndex) || 0;
    const lastHeight = itemHeights.get(lastIndex) || estimatedItemHeight;
    return lastOffset + lastHeight;
  }, [items.length, itemOffsets, itemHeights, estimatedItemHeight]);

  // 보이는 아이템들
  const visibleItems = useMemo(() => {
    const _result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const offset = itemOffsets.get(i) || 0;
      const height = itemHeights.get(i) || estimatedItemHeight;
      
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: offset,
          left: 0,
          right: 0,
          height,
        },
      });
    }
    return result;
  }, [visibleRange, items, itemOffsets, itemHeights, estimatedItemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    measureItem,
    handleScroll,
  };
};