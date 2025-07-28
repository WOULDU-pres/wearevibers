import React, { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { optimizeImage, generateResponsiveSrcSet, generatePlaceholder, createLazyLoadObserver } from '@/utils/imageOptimizer';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  responsive?: boolean;
  placeholder?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'webp',
  lazy = true,
  responsive = true,
  placeholder = true,
  fallbackSrc,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 지연 로딩 설정
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const observer = createLazyLoadObserver((entry) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    });

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, shouldLoad]);

  // 이미지 로드 핸들러
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  // 이미지 에러 핸들러
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // 최적화된 이미지 URL 생성
  const optimizedSrc = shouldLoad ? optimizeImage(src, {
    width,
    height,
    quality,
    format,
    resize: 'cover'
  }) : '';

  // 반응형 srcSet 생성
  const srcSet = shouldLoad && responsive ? generateResponsiveSrcSet(src, {
    quality,
    format
  }) : '';

  // placeholder 이미지 URL
  const placeholderSrc = placeholder ? generatePlaceholder(src) : '';

  // 에러 시 fallback 이미지
  const currentSrc = isError && fallbackSrc ? fallbackSrc : optimizedSrc;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder 배경 */}
      {placeholder && !isLoaded && shouldLoad && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${placeholderSrc})`,
            opacity: isLoaded ? 0 : 1
          }}
        />
      )}

      {/* 로딩 스피너 */}
      {!isLoaded && shouldLoad && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 메인 이미지 */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={responsive ? srcSet : undefined}
        sizes={responsive ? "(max-width: 480px) 480px, (max-width: 768px) 768px, 1200px" : undefined}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          isError && 'opacity-50'
        )}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />

      {/* 에러 상태 */}
      {isError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">이미지 로드 실패</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;