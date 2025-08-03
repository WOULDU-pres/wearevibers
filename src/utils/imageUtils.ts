/**
 * Image compression and optimization utilities
 * Provides client-side image processing for better upload performance
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'webp' | 'jpeg' | 'png';
  maintainAspectRatio?: boolean;
}

export interface ImageMetadata {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
  format: string;
}

/**
 * Default compression settings optimized for web upload
 */
export const DEFAULT_COMPRESSION: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'webp',
  maintainAspectRatio: true,
};

/**
 * Compression presets for different use cases
 */
export const COMPRESSION_PRESETS = {
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
    format: 'webp' as const,
  },
  preview: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.75,
    format: 'webp' as const,
  },
  standard: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'webp' as const,
  },
  high: {
    maxWidth: 2560,
    maxHeight: 1440,
    quality: 0.85,
    format: 'webp' as const,
  },
} as const;

/**
 * Check if the browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
export const calculateNewDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  // Scale down if larger than max dimensions
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }
  
  return { 
    width: Math.round(newWidth), 
    height: Math.round(newHeight) 
  };
};

/**
 * Compress image file with specified options
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION
): Promise<{ file: File; metadata: ImageMetadata }> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Get original image dimensions
  const originalDimensions = await getImageDimensions(file);
  
  // Calculate new dimensions
  const { width, height } = options.maintainAspectRatio 
    ? calculateNewDimensions(
        originalDimensions.width,
        originalDimensions.height,
        options.maxWidth || originalDimensions.width,
        options.maxHeight || originalDimensions.height
      )
    : {
        width: options.maxWidth || originalDimensions.width,
        height: options.maxHeight || originalDimensions.height,
      };

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Load and draw image
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Configure canvas for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image on canvas with new dimensions
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determine output format
      let outputFormat = 'image/jpeg';
      let outputQuality = options.quality || 0.8;
      
      if (options.format === 'webp') {
        outputFormat = 'image/webp';
      } else if (options.format === 'png') {
        outputFormat = 'image/png';
        outputQuality = 1; // PNG doesn't use quality
      }
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          // Create new file
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `.${options.format || 'jpg'}`),
            { type: outputFormat }
          );
          
          // Calculate metadata
          const metadata: ImageMetadata = {
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100),
            originalDimensions,
            compressedDimensions: { width, height },
            format: outputFormat,
          };
          
          resolve({ file: compressedFile, metadata });
          URL.revokeObjectURL(img.src);
        },
        outputFormat,
        outputQuality,
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Smart compression that automatically selects the best settings
 * based on file size and dimensions
 */
export const smartCompress = async (file: File): Promise<{ file: File; metadata: ImageMetadata }> => {
  const dimensions = await getImageDimensions(file);
  const fileSizeMB = file.size / (1024 * 1024);
  
  let preset: CompressionOptions;
  
  // Select compression preset based on file characteristics
  if (fileSizeMB > 10 || Math.max(dimensions.width, dimensions.height) > 3000) {
    preset = COMPRESSION_PRESETS.standard;
  } else if (fileSizeMB > 5 || Math.max(dimensions.width, dimensions.height) > 2000) {
    preset = { ...COMPRESSION_PRESETS.standard, quality: 0.85 };
  } else if (fileSizeMB > 2) {
    preset = { ...COMPRESSION_PRESETS.preview, maxWidth: 1920, maxHeight: 1080 };
  } else {
    // Small files - minimal compression
    preset = { 
      ...COMPRESSION_PRESETS.high,
      maxWidth: Math.min(dimensions.width, 2560),
      maxHeight: Math.min(dimensions.height, 1440),
    };
  }
  
  // Check WebP support and fallback to JPEG if needed
  const webpSupported = await supportsWebP();
  if (!webpSupported && preset.format === 'webp') {
    preset.format = 'jpeg';
  }
  
  return compressImage(file, preset);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Validate image file type
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Estimate compression savings
 */
export const estimateCompressionSavings = async (
  file: File,
  options: CompressionOptions = DEFAULT_COMPRESSION
): Promise<{ estimatedSize: number; estimatedSavings: number }> => {
  const dimensions = await getImageDimensions(file);
  const { width, height } = calculateNewDimensions(
    dimensions.width,
    dimensions.height,
    options.maxWidth || dimensions.width,
    options.maxHeight || dimensions.height
  );
  
  // Rough estimation based on pixel reduction and quality
  const pixelReduction = (width * height) / (dimensions.width * dimensions.height);
  const qualityFactor = options.quality || 0.8;
  const estimatedSize = Math.round(file.size * pixelReduction * qualityFactor);
  const estimatedSavings = Math.round((1 - estimatedSize / file.size) * 100);
  
  return { estimatedSize, estimatedSavings };
};