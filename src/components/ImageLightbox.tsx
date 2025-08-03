import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  X,
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minZoom = 0.5;
  const maxZoom = 3;
  const zoomStep = 0.25;

  // Reset states when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setIsLoading(true);
    setImageError(false);
  }, [currentIndex]);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, handlePrevious, handleNext, handleZoomIn, handleZoomOut, handleRotate, toggleFullscreen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + zoomStep, maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - zoomStep, minZoom));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('전체화면 모드를 사용할 수 없습니다.');
    }
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const currentImage = images[currentIndex];
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('이미지가 다운로드되었습니다.');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('다운로드에 실패했습니다.');
    }
  }, [images, currentIndex]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '이미지 공유',
          url: images[currentIndex],
        });
      } else {
        await navigator.clipboard.writeText(images[currentIndex]);
        toast.success('이미지 URL이 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('공유에 실패했습니다.');
    }
  }, [images, currentIndex]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const _isUpSwipe = distanceY > 50;
    const _isDownSwipe = distanceY < -50;

    // Only handle horizontal swipes for navigation
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && images.length > 1) {
        handleNext();
      } else if (isRightSwipe && images.length > 1) {
        handlePrevious();
      }
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/95 flex items-center justify-center",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-white bg-black/50 border-white/20">
            {currentIndex + 1} / {images.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/20"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Image Container */}
      <div 
        className="relative flex-1 flex items-center justify-center p-16"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="text-center text-white">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>이미지를 불러올 수 없습니다.</p>
          </div>
        ) : (
          <img
            src={currentImage}
            alt={`이미지 ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImageError(true);
            }}
            onDoubleClick={resetTransform}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-lg p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="text-white hover:bg-white/20"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Badge variant="secondary" className="text-white bg-transparent border-white/20 min-w-16 text-center">
          {Math.round(zoom * 100)}%
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="text-white hover:bg-white/20"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          className="text-white hover:bg-white/20"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/50 rounded p-2 max-w-48">
        <div className="text-white/90 font-medium mb-1">키보드 단축키:</div>
        <div>←/→: 이전/다음</div>
        <div>+/-: 확대/축소</div>
        <div>R: 회전</div>
        <div>F: 전체화면</div>
        <div>ESC: 닫기</div>
      </div>
    </div>
  );
};

export default ImageLightbox;