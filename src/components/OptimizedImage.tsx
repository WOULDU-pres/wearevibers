/**
 * 성능 최적화된 이미지 컴포넌트
 * - 지연 로딩 (Lazy Loading)
 * - WebP/AVIF 형식 지원
 * - 반응형 이미지 
 * - 로딩 상태 및 에러 처리
 * - 접근성 최적화
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  // 반응형 이미지를 위한 breakpoints
  responsive?: {
    [breakpoint: string]: {
      width: number;
      height?: number;
    };
  };
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  inView: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority = false,
  _quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  fallbackSrc,
  responsive,
  ...props
}) => {
  const [state, setState] = useState<ImageState>({
    loaded: false,
    error: false,
    inView: false
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 현대적 이미지 형식 지원 검사
  const modernFormats = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return { webp: false, avif: false };
    
    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
    };
  }, []);

  // 최적화된 이미지 소스 생성
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // 외부 URL인 경우 그대로 반환
    if (src.startsWith('http')) {
      return src;
    }
    
    // 내부 이미지 최적화
    const baseSrc = src.replace(/\.[^/.]+$/, ''); // 확장자 제거
    const originalExt = src.split('.').pop()?.toLowerCase();
    
    // 현대적 형식 우선 적용
    if (modernFormats.avif && originalExt !== 'svg') {
      return `${baseSrc}.avif`;
    } else if (modernFormats.webp && originalExt !== 'svg') {
      return `${baseSrc}.webp`;
    }
    
    return src;
  }, [src, modernFormats]);

  // srcset 생성 (반응형 이미지)
  const srcSet = useMemo(() => {
    if (!responsive || src.startsWith('http')) return undefined;
    
    const baseSrc = src.replace(/\.[^/.]+$/, '');
    const ext = optimizedSrc.split('.').pop();
    
    return Object.entries(responsive)
      .map(([, { width: w }]) => `${baseSrc}-${w}w.${ext} ${w}w`)
      .join(', ');
  }, [src, optimizedSrc, responsive]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || state.inView) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(prev => ({ ...prev, inView: true }));
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로딩
        threshold: 0.1
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority, state.inView]);

  // 이미지 로딩 핸들러
  const handleLoad = () => {
    setState(prev => ({ ...prev, loaded: true, error: false }));
    onLoad?.();
  };

  const handleError = () => {
    setState(prev => ({ ...prev, error: true, loaded: false }));
    
    // fallback 이미지로 교체
    if (fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
      return;
    }
    
    onError?.();
  };

  // 로딩 상태 컴포넌트
  const LoadingPlaceholder: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    
    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full transition-opacity duration-300',
            'filter blur-sm scale-105',
            state.loaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit }}
          aria-hidden="true"
        />
      );
    }
    
    return (
      <div
        className={cn(
          'absolute inset-0 bg-muted animate-pulse',
          'flex items-center justify-center',
          state.loaded ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        aria-hidden="true"
      >
        <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
      </div>
    );
  };

  // 에러 상태 컴포넌트
  const ErrorPlaceholder: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    
    return (
      <div
        className={cn(
          'absolute inset-0 bg-muted',
          'flex flex-col items-center justify-center',
          'text-muted-foreground text-sm'
        )}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <svg
          className="w-8 h-8 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Image failed to load</span>
      </div>
    );
  };

  // 렌더링할 이미지 소스 결정
  const shouldLoad = priority || state.inView;
  const imageSource = shouldLoad ? optimizedSrc : '';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        className,
      )}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: width && height ? `${width} / ${height}` : undefined
      }}
      {...props}
    >
      {/* 로딩 플레이스홀더 */}
      <LoadingPlaceholder show={shouldLoad && !state.loaded && !state.error} />
      
      {/* 에러 플레이스홀더 */}
      <ErrorPlaceholder show={state.error} />
      
      {/* 실제 이미지 */}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={imageSource}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            state.loaded ? 'opacity-100' : 'opacity-0',
            state.error && 'hidden'
          )}
          style={{ objectFit }}
          // 접근성 향상
          role="img"
          aria-hidden={alt === '' ? 'true' : undefined}
        />
      )}
    </div>
  );
};

// 배경 이미지 최적화 컴포넌트
export const OptimizedBackgroundImage: React.FC<{
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}> = ({
  src,
  alt,
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5
}) => {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="absolute inset-0 -z-10"
        objectFit="cover"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black -z-10"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
};

// 아바터 최적화 컴포넌트
export const OptimizedAvatar: React.FC<{
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizePx = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        'rounded-full border-2 border-border',
        sizeClasses[size],
        className,
      )}
      objectFit="cover"
      fallbackSrc={fallback}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMxNy43OTA5IDIwIDE2IDIxLjc5MDkgMTYgMjRDMTYgMjYuMjA5MSAxNy43OTA5IDI4IDIwIDI4QzIyLjIwOTEgMjggMjQgMjYuMjA5MSAyNCAyNEMyNCAyMS43OTA5IDIyLjIwOTEgMjAgMjAgMjBaIiBmaWxsPSIjOUI5Q0EwIi8+CjxwYXRoIGQ9Ik0yMCAxMkMxMy4zNzI2IDEyIDggMTcuMzcyNiA4IDI0QzggMzAuNjI3NCAxMy4zNzI2IDM2IDIwIDM2QzI2LjYyNzQgMzYgMzIgMzAuNjI3NCAzMiAyNEMzMiAxNy4zNzI2IDI2LjYyNzQgMTIgMjAgMTJaTTIwIDM0QzE0LjQ3NzIgMzQgMTAgMjkuNTIyOCAxMCAyNEMxMCAxOC40NzcyIDE0LjQ3NzIgMTQgMjAgMTRDMjUuNTIyOCAxNCAzMCAxOC40NzcyIDMwIDI0QzMwIDI5LjUyMjggMjUuNTIyOCAzNCAyMCAzNFoiIGZpbGw9IiM5QjlDQTAiLz4KPC9zdmc+"
    />
  );
};

// 이미지 갤러리 최적화 컴포넌트
export const OptimizedImageGallery: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  columns?: number;
}> = ({
  images,
  className,
  columns = 3
}) => {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
          'grid-cols-4': columns === 4
        },
        className,
      )}
    >
      {images.map((image, index) => (
        <div key={index} className="group">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            className="aspect-square rounded-lg group-hover:scale-105 transition-transform duration-200"
            objectFit="cover"
            priority={index < 4} // 처음 4개 이미지만 우선 로딩
          />
          {image.caption && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptimizedImage;