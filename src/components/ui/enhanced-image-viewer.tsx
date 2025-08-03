"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle,
  Maximize2,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Lens } from "@/components/ui/lens";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";

interface EnhancedImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  showThumbnails?: boolean;
  allowDownload?: boolean;
  className?: string;
}

interface ImageState {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

export function EnhancedImageViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  showThumbnails = true,
  allowDownload = true,
  className,
}: EnhancedImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageState, setImageState] = useState<ImageState>({
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [enableLens, setEnableLens] = useState(false);
  const [showThumbnailsPanel, setShowThumbnailsPanel] = useState(showThumbnails);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset image state when index changes
  useEffect(() => {
    setImageState({
      scale: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
    });
    setIsLoading(true);
    setHasError(false);
    setEnableLens(false);
  }, [currentIndex]);

  // Reset index when viewer opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "=":
        case "+":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "r":
        case "R":
          e.preventDefault();
          rotate();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        case "l":
        case "L":
          e.preventDefault();
          toggleLens();
          break;
        case "t":
        case "T":
          e.preventDefault();
          setShowThumbnailsPanel(prev => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, goToPrevious, goToNext, zoomIn, zoomOut, rotate, resetZoom, toggleLens]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setImageState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.3, 5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setImageState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.3, 0.2),
    }));
  }, []);

  const rotate = useCallback(() => {
    setImageState((prev) => ({
      ...prev,
      rotation: prev.rotation + 90,
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setImageState({
      scale: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const toggleLens = useCallback(() => {
    setEnableLens((prev) => !prev);
  }, []);

  const downloadImage = useCallback(async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  }, [images, currentIndex, isDownloading]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (imageState.scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imageState.translatey: e.clientY - imageState.translateY });
  }, [imageState.scale, imageState.translateimageState.translateY]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || imageState.scale <= 1) return;
      setImageState((prev) => ({
        ...prev,
        translateX: e.clientX - dragStart.x,
        translateY: e.clientY - dragStart.y,
      }));
    },
    [isDragging, imageState.scale, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clienty: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const diffX = touchStart.x - touch.clientX;
    const diffY = touchStart.y - touch.clientY;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    setTouchStart(null);
  }, [touchStart, goToNext, goToPrevious]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-md",
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Header Controls */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                <Maximize2 className="w-3 h-3 mr-1" />
                {currentIndex + 1} / {images.length}
              </Badge>
              {isLoading && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-300/30 backdrop-blur-sm">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              )}
              {enableLens && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-300/30 backdrop-blur-sm">
                  <ZoomIn className="w-3 h-3 mr-1" />
                  Lens Active
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                onClick={() => setShowThumbnailsPanel(prev => !prev)}
                title="Toggle Thumbnails (T)"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200",
                  enableLens && "bg-green-500/30 border-green-400/50"
                )}
                onClick={toggleLens}
                title="Toggle Lens (L)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                onClick={zoomIn}
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                onClick={zoomOut}
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                onClick={rotate}
                title="Rotate (R)"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              {allowDownload && (
                <ShimmerButton
                  onClick={downloadImage}
                  disabled={isDownloading}
                  shimmerColor="#ffffff"
                  background="rgba(255, 255, 255, 0.1)"
                  borderRadius="8px"
                  className="px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  {isDownloading ? "Downloading..." : "Download"}
                </ShimmerButton>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-300/30 backdrop-blur-sm transition-all duration-200"
                onClick={onClose}
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
            >
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm w-12 h-12 transition-all duration-200"
                onClick={goToPrevious}
                title="Previous (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
            >
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm w-12 h-12 transition-all duration-200"
                onClick={goToNext}
                title="Next (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Main Image Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center p-16 pt-20 pb-20"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? "grabbing" : imageState.scale > 1 ? "grab" : "default" }}
        >
          <div className="relative max-w-full max-h-full">
            {isLoading && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-lg backdrop-blur-sm border border-white/10"
              >
                <BorderBeam 
                  size={60} 
                  duration={2} 
                  colorFrom="#8b5cf6" 
                  colorTo="#06b6d4"
                  borderWidth={2}
                />
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm opacity-80">Loading image...</p>
                </div>
              </motion.div>
            )}
            
            {hasError ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center p-8 text-white bg-red-500/10 rounded-lg border border-red-500/30 backdrop-blur-sm"
              >
                <AlertCircle className="w-16 h-16 mb-4 text-red-400" />
                <p className="text-lg mb-2">Failed to load image</p>
                <p className="text-sm text-gray-400">Please try again later</p>
              </motion.div>
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: imageState.scale,
                  rotate: imageState.rotation,
                  x: imageState.translateX,
                  y: imageState.translateY,
                  opacity: 1,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.3 }
                }}
                className="relative"
              >
                {enableLens ? (
                  <Lens 
                    zoomFactor={2.5} 
                    lensSize={200} 
                    isStatic={false}
                    ariaLabel="Image zoom lens"
                    className="rounded-lg overflow-hidden shadow-2xl"
                  >
                    <img
                      ref={imageRef}
                      src={currentImage}
                      alt={`Image ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      draggable={false}
                    />
                  </Lens>
                ) : (
                  <img
                    ref={imageRef}
                    src={currentImage}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    draggable={false}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Thumbnails Panel */}
        <AnimatePresence>
          {showThumbnailsPanel && images.length > 1 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 overflow-x-auto">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                        index === currentIndex
                          ? "border-white shadow-lg scale-110"
                          : "border-white/30 hover:border-white/70"
                      )}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === currentIndex && (
                        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Help */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 right-4 z-10"
        >
          <div className="text-xs text-white/70 bg-black/30 p-3 rounded-lg backdrop-blur-sm border border-white/10 space-y-1">
            <div className="font-medium mb-1">Keyboard Shortcuts:</div>
            <div>← → Navigate | + - Zoom | R Rotate</div>
            <div>L Lens | T Thumbnails | 0 Reset | Esc Close</div>
          </div>
        </motion.div>

        {/* Scale Indicator */}
        {imageState.scale !== 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-10"
          >
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-300/30 backdrop-blur-sm">
              {Math.round(imageState.scale * 100)}%
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}