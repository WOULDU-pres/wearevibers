import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';
import { 
  
  
  Eye, 
  Download, 
  MoreHorizontal,
  CheckSquare,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useImageDelete } from '@/hooks/useImageDelete';
import { ImageDeleteDialog } from './ImageDeleteDialog';
import { EnhancedImageViewer } from '@/components/ui/enhanced-image-viewer';

interface ImageGalleryProps {
  images: string[];
  onImagesChange?: (images: string[]) => void;
  className?: string;
  maxImages?: number;
  showCounter?: boolean;
  allowBatchDelete?: boolean;
  allowReorder?: boolean;
  bucket?: string;
  disabled?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagesChange,
  className,
  maxImages = 10,
  showCounter = true,
  allowBatchDelete = true,
  allowReorder = false,
  bucket = 'posts',
  disabled = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const { deleteImage, deleteImageBatch, isDeleting } = useImageDelete({
    bucket,
    onSuccess: () => {
      if (imageToDelete) {
        // Single image deletion
        const newImages = images.filter(img => img !== imageToDelete);
        onImagesChange?.(newImages);
        setImageToDelete(null);
      } else {
        // Batch deletion
        const newImages = images.filter(img => !selectedImages.has(img));
        onImagesChange?.(newImages);
        setSelectedImages(new Set());
      }
      setDeleteDialogOpen(false);
    },
  });

  const handleSingleDelete = (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setDeleteDialogOpen(true);
  };

  const handleBatchDelete = () => {
    if (selectedImages.size === 0) return;
    setImageToDelete(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (imageToDelete) {
      // Single image deletion
      await deleteImage(imageToDelete);
    } else {
      // Batch deletion
      await deleteImageBatch(Array.from(selectedImages));
    }
  };

  const handleImageSelect = (imageUrl: string, checked: boolean) => {
    const newSelected = new Set(selectedImages);
    if (checked) {
      newSelected.add(imageUrl);
    } else {
      newSelected.delete(imageUrl);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images));
    }
  };

  const handleViewImage = (imageUrl: string) => {
    const index = images.indexOf(imageUrl);
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>업로드된 이미지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showCounter && (
            <Badge variant="secondary" className="text-xs">
              {images.length}/{maxImages}
            </Badge>
          )}
          
          {allowBatchDelete && images.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={disabled}
              className="h-8 text-xs"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              {selectedImages.size === images.length ? '선택 해제' : '전체 선택'}
            </Button>
          )}
        </div>

        {selectedImages.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={disabled || isDeleting}
            className="h-8 text-xs"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3 mr-1" />
            )}
            {selectedImages.size}개 삭제
          </Button>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={imageUrl}
              alt={`업로드된 이미지 ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-border"
            />
            
            {/* Selection checkbox */}
            {allowBatchDelete && (
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedImages.has(imageUrl)}
                  onCheckedChange={(checked) => 
                    handleImageSelect(imageUrl, checked as boolean)
                  }
                  disabled={disabled}
                  className="bg-white/90 border-2"
                />
              </div>
            )}

            {/* Action buttons overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewImage(imageUrl)}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem 
                      onClick={() => handleDownload(imageUrl, index)}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      다운로드
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleSingleDelete(imageUrl)}
                      className="text-red-600 dark:text-red-400"
                      disabled={disabled}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Quick delete button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleSingleDelete(imageUrl)}
              disabled={disabled || isDeleting}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ImageDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        imageCount={imageToDelete ? 1 : selectedImages.size}
      />

      {/* Enhanced Image Viewer */}
      <EnhancedImageViewer
        images={images}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        showThumbnails={true}
        allowDownload={true}
      />
    </div>
  );
};

export default ImageGallery;