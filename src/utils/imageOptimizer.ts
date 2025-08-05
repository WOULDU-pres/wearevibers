/**
 * 이미지 최적화 유틸리티
 * Supabase Storage Transform API를 활용한 이미지 최적화
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

interface ResponsiveImageOptions {
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg';
}

/**
 * Supabase Storage Transform API를 사용한 이미지 최적화
 */
export const optimizeImage = (url: string, options: ImageOptimizationOptions = {}): string => {
  if (!url || !url.includes('supabase')) {
    return url; // Supabase 이미지가 아닌 경우 원본 반환
  }

  try {
    const supabaseUrl = new URL(url);
    const params = new URLSearchParams();

    // 이미지 변환 파라미터 설정
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', Math.min(100, Math.max(1, options.quality)).toString());
    if (options.format) params.set('format', options.format);
    if (options.resize) params.set('resize', options.resize);

    // 기본 최적화 설정
    if (!options.quality) params.set('quality', '85');
    if (!options.format) params.set('format', 'webp');

    return `${supabaseUrl.origin}${supabaseUrl.pathname}/transform?${params.toString()}`;
  } catch (error) {
    console.warn('이미지 최적화 실패:', error);
    return url; // 오류 발생 시 원본 반환
  }
};

/**
 * 반응형 이미지 srcSet 생성
 */
export const generateResponsiveSrcSet = (
  url: string, 
  options: ResponsiveImageOptions = {}
): string => {
  const breakpoints = options.breakpoints || {
    mobile: 480,
    tablet: 768,
    desktop: 1200
  };

  const quality = options.quality || 85;
  const format = options.format || 'webp';

  const srcSet = [
    `${optimizeImage(url, { width: breakpoints.mobile, quality, format })} ${breakpoints.mobile}w`,
    `${optimizeImage(url, { width: breakpoints.tablet, quality, format })} ${breakpoints.tablet}w`,
    `${optimizeImage(url, { width: breakpoints.desktop, quality, format })} ${breakpoints.desktop}w`
  ];

  return srcSet.join(', ');
};

/**
 * 지연 로딩을 위한 placeholder 이미지 생성
 */
export const generatePlaceholder = (url: string, _blur: number = 10): string => {
  return optimizeImage(url, {
    width: 20,
    height: 20,
    quality: 10,
    format: 'jpeg'
  });
};

/**
 * 이미지 프리로딩 함수
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.on_error = reject;
    img.src = src;
  });
};

/**
 * 중요 이미지들 일괄 프리로딩
 */
export const preloadCriticalImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(optimizeImage(url, { 
    quality: 90, 
    format: 'webp' 
  })));
  
  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('일부 이미지 프리로딩 실패:', error);
  }
};

/**
 * 이미지 지연 로딩을 위한 Intersection Observer 훅
 */
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};