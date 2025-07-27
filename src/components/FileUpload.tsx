import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUIStore } from '@/stores';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onUpload: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUpload,
  className,
  disabled = false,
}) => {
  const { 
    uploading, 
    setUploading, 
    uploadProgress, 
    setUploadProgress, 
    uploadComplete, 
    setUploadComplete,
    resetUploadState 
  } = useUIStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setUploadedFile(file);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Call the upload function
      const result = await onUpload(file);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);
      
      toast.success('파일이 성공적으로 업로드되었습니다.');
      
      // Reset after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadedFile(null);
        setUploadComplete(false);
      }, 2000);

    } catch (error) {
      console.error('File upload error:', error);
      toast.error('파일 업로드에 실패했습니다.');
      setUploading(false);
      setUploadProgress(0);
      setUploadedFile(null);
      setUploadComplete(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false,
    disabled: disabled || uploading,
  });

  return (
    <div className={cn('relative', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300',
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
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <AnimatedCircularProgressBar
                value={uploadProgress}
                max={100}
                gaugePrimaryColor="#9c40ff"
                gaugeSecondaryColor="#e5e7eb"
                className="mb-2"
              />
              <div className="text-sm font-medium text-muted-foreground">
                {uploadedFile?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                업로드 중... {Math.round(uploadProgress)}%
              </div>
            </div>
          ) : uploadComplete ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-green-600">
                업로드 완료!
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">클릭하여 업로드</span> 또는 파일을 여기에 드래그하세요
              </p>
              <p className="text-xs text-muted-foreground">
                {accept === 'image/*' ? '이미지' : accept} 파일, 최대 {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Button Alternative */}
      {!uploading && !uploadComplete && (
        <div className="flex justify-center mt-4">
          <ShinyButton
            onClick={() => document.querySelector('input[type="file"]')?.click()}
            disabled={disabled}
            className="bg-gradient-vibe"
          >
            <Upload className="w-4 h-4 mr-2" />
            파일 선택
          </ShinyButton>
        </div>
      )}
    </div>
  );
};