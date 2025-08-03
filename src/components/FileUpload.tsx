import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Zap, Info } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Button } from '@/components/ui/button';

import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUIStore } from '@/stores';
import { 
  
  compressImage, 
  COMPRESSION_PRESETS, 
  formatFileSize, 
  isValidImageType,
  estimateCompressionSavings as _estimateCompressionSavings,
  type CompressionOptions,
  type ImageMetadata 
} from '@/utils/imageUtils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onUpload: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
  compact?: boolean;
  enableCompression?: boolean;
  compressionOptions?: CompressionOptions;
  showCompressionSettings?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUpload,
  className,
  disabled = false,
  multiple = false,
  maxFiles = 1,
  showPreview: _showPreview = false,
  compact = false,
  enableCompression = true,
  compressionOptions,
  showCompressionSettings = false,
}) => {
  const { 
    uploading, 
    setUploading, 
    uploadProgress, 
    setUploadProgress, 
    uploadComplete, 
    setUploadComplete,
    resetUploadState: _resetUploadState 
  } = useUIStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [compressionEnabled, setCompressionEnabled] = useState(enableCompression);
  const [compressionPreset, setCompressionPreset] = useState<keyof typeof COMPRESSION_PRESETS>('standard');
  const [compressionMetadata, setCompressionMetadata] = useState<ImageMetadata | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / (1024 * 1024))}MB까지 업로드 가능합니다.`;
      }

      // Check file type
      if (accept && accept !== '*') {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const isValidType = acceptedTypes.some(type => {
          if (type.includes('*')) {
            return fileType.startsWith(type.replace('*', ''));
          }
          return fileType === type;
        });

        if (!isValidType) {
          return `지원하지 않는 파일 형식입니다. (${accept})`;
        }
      }

      return null;
    };

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setUploadedFile(file);
    setUploadProgress(0);
    setUploadComplete(false);
    setCompressionMetadata(null);

    try {
      let fileToUpload = file;
      let metadata: ImageMetadata | null = null;

      // Compress image if enabled and it's an image file
      if (compressionEnabled && isValidImageType(file)) {
        setUploadProgress(10);
        
        try {
          const effectiveOptions = compressionOptions || COMPRESSION_PRESETS[compressionPreset];
          const compressionResult = await compressImage(file, effectiveOptions);
          
          fileToUpload = compressionResult.file;
          metadata = compressionResult.metadata;
          setCompressionMetadata(metadata);
          
          toast.success(
            `이미지 압축 완료: ${formatFileSize(metadata.originalSize)} → ${formatFileSize(metadata.compressedSize)} (${metadata.compressionRatio}% 절약)`
          );
          
          setUploadProgress(30);
        } catch (compressionError) {
          console.warn('Image compression failed, uploading original:', compressionError);
          toast.warning('이미지 압축에 실패했습니다. 원본 파일을 업로드합니다.');
        }
      }

      // Simulate progress updates for upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Call the upload function with potentially compressed file
      const _result = await onUpload(fileToUpload);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);
      
      const message = metadata 
        ? `파일이 성공적으로 업로드되었습니다. (압축률: ${metadata.compressionRatio}%)`
        : '파일이 성공적으로 업로드되었습니다.';
      
      toast.success(message);
      
      // Reset after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadedFile(null);
        setUploadComplete(false);
        setCompressionMetadata(null);
      }, 3000);

    } catch (error) {
      console.error('File upload error:', error);
      toast.error('파일 업로드에 실패했습니다.');
      setUploading(false);
      setUploadProgress(0);
      setUploadedFile(null);
      setUploadComplete(false);
      setCompressionMetadata(null);
    }
  }, [onUpload, maxSize, accept, compressionEnabled, compressionOptions, compressionPreset, setUploadProgress, setUploading, setUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      // Handle multiple files
      const filesToProcess = acceptedFiles.slice(0, maxFiles);
      filesToProcess.forEach(file => handleFileUpload(file));
    } else {
      // Handle single file
      const file = acceptedFiles[0];
      if (file) {
        handleFileUpload(file);
      }
    }
  }, [handleFileUpload, multiple, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple,
    disabled: disabled || uploading,
  });

  return (
    <div className={cn('relative', className)}>
      {/* Compression Settings */}
      {showCompressionSettings && !compact && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              이미지 최적화 설정
            </h4>
            <Switch
              checked={compressionEnabled}
              onCheckedChange={setCompressionEnabled}
              disabled={uploading}
            />
          </div>
          
          {compressionEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">압축 프리셋</label>
                <Select
                  value={compressionPreset}
                  onValueChange={(value: keyof typeof COMPRESSION_PRESETS) => setCompressionPreset(value)}
                  disabled={uploading}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thumbnail">썸네일 (300px, 70%)</SelectItem>
                    <SelectItem value="preview">미리보기 (800px, 75%)</SelectItem>
                    <SelectItem value="standard">표준 (1920px, 80%)</SelectItem>
                    <SelectItem value="high">고품질 (2560px, 85%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      압축 정보
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-xs">
                    <div className="space-y-2">
                      <p><strong>썸네일:</strong> 프로필 이미지나 작은 미리보기용</p>
                      <p><strong>미리보기:</strong> 갤러리나 카드 표시용</p>
                      <p><strong>표준:</strong> 일반적인 웹 이미지용 (권장)</p>
                      <p><strong>고품질:</strong> 세부사항이 중요한 이미지용</p>
                      <div className="mt-3 pt-2 border-t">
                        <p className="text-muted-foreground">
                          이미지는 자동으로 WebP 포맷으로 변환되어 더 작은 용량으로 최적화됩니다.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full rounded-lg cursor-pointer transition-all duration-300',
          compact ? 'h-32 border border-dashed' : 'h-64 border-2 border-dashed',
          isDragActive || uploading
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          disabled && 'cursor-not-allowed opacity-50',
          uploading && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        
        {/* Border Beam Effect when dragging */}
        {(isDragActive || uploading) && (
          <BorderBeam
            size={250}
            duration={12}
            colorFrom="#9c40ff"
            colorTo="#ffaa40"
            className="rounded-lg"
          />
        )}

        {/* Content */}
        <div className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "p-4 space-y-2" : "p-6 space-y-4"
        )}>
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <AnimatedCircularProgressBar
                value={uploadProgress}
                max={100}
                gaugePrimaryColor="#9c40ff"
                gaugeSecondaryColor="#e5e7eb"
                className={compact ? "w-8 h-8" : "w-12 h-12"}
              />
              {!compact && (
                <div className="text-sm font-medium text-muted-foreground truncate max-w-48">
                  {uploadedFile?.name}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {uploadProgress < 30 && compressionEnabled && isValidImageType(uploadedFile!) 
                  ? '이미지 압축 중...' 
                  : `업로드 중... ${Math.round(uploadProgress)}%`}
              </div>
              {compressionMetadata && (
                <div className="text-xs text-green-600 font-medium">
                  {formatFileSize(compressionMetadata.originalSize)} → {formatFileSize(compressionMetadata.compressedSize)}
                </div>
              )}
            </div>
          ) : uploadComplete ? (
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                "flex items-center justify-center bg-green-100 rounded-full",
                compact ? "w-8 h-8" : "w-12 h-12"
              )}>
                <Check className={cn("text-green-600", compact ? "w-4 h-4" : "w-6 h-6")} />
              </div>
              <div className="text-sm font-medium text-green-600">
                업로드 완료!
              </div>
              {compressionMetadata && (
                <div className="text-xs text-green-600">
                  {compressionMetadata.compressionRatio}% 절약됨
                </div>
              )}
            </div>
          ) : (
            <>
              <Upload className={cn("text-muted-foreground", compact ? "w-6 h-6" : "w-10 h-10")} />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">클릭하여 업로드</span>
                  {!compact && " 또는 파일을 여기에 드래그하세요"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {multiple && `최대 ${maxFiles}개의 `}
                  {accept === 'image/*' ? '이미지' : accept} 파일
                  {!compact && `, 최대 ${Math.round(maxSize / (1024 * 1024))}MB`}
                  {compressionEnabled && accept === 'image/*' && !compact && (
                    <span className="block text-green-600 mt-1">
                      ⚡ 자동 압축 활성화 - 용량 최적화
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Button Alternative */}
      {!uploading && !uploadComplete && !compact && (
        <div className="flex justify-center mt-4">
          <ShinyButton
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            disabled={disabled}
            className="bg-primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            {multiple ? '파일 선택' : '파일 선택'}
          </ShinyButton>
        </div>
      )}
    </div>
  );
};