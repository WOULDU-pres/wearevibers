import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFileUpload } from './useFileUpload';
import { toast } from 'sonner';

export interface ImageDeleteOptions {
  bucket: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showConfirmation?: boolean;
  confirmationMessage?: string;
}

export const useImageDelete = (options: ImageDeleteOptions) => {
  const { deleteFile } = useFileUpload();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Extract file path from public URL
   * Supabase public URLs follow pattern: {baseUrl}/storage/v1/object/public/{bucket}/{path}
   */
  const extractFilePathFromUrl = (publicUrl: string, bucket: string): string => {
    try {
      const url = new URL(publicUrl);
      const pathSegments = url.pathname.split('/');
      const bucketIndex = pathSegments.findIndex(segment => segment === bucket);
      
      if (bucketIndex === -1 || bucketIndex === pathSegments.length - 1) {
        throw new Error('Invalid file URL format');
      }
      
      // Get path after bucket name
      const filePath = pathSegments.slice(bucketIndex + 1).join('/');
      return filePath;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      throw new Error('잘못된 파일 URL 형식입니다.');
    }
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      const filePath = extractFilePathFromUrl(imageUrl, options.bucket);
      await deleteFile(options.bucket, filePath);
      return { imageUrl, filePath };
    },
    onSuccess: (data) => {
      toast.success('이미지가 성공적으로 삭제되었습니다.');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Image deletion failed:', error);
      toast.error(`이미지 삭제에 실패했습니다: ${error.message}`);
      options.onError?.(error);
    },
  });

  const deleteImageWithConfirmation = async (imageUrl: string) => {
    if (options.showConfirmation !== false) {
      const confirmMessage = options.confirmationMessage || 
        '이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';
      
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    setIsDeleting(true);
    try {
      await deleteImageMutation.mutateAsync(imageUrl);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteImageBatch = async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return;

    if (options.showConfirmation !== false) {
      const confirmMessage = `${imageUrls.length}개의 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`;
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const imageUrl of imageUrls) {
      try {
        await deleteImageMutation.mutateAsync(imageUrl);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to delete image: ${imageUrl}`, error);
      }
    }

    setIsDeleting(false);

    // Show batch result
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount}개의 이미지가 성공적으로 삭제되었습니다.`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount}개 삭제 완료, ${errorCount}개 실패했습니다.`);
    } else if (errorCount > 0) {
      toast.error(`${errorCount}개의 이미지 삭제에 실패했습니다.`);
    }
  };

  return {
    deleteImage: deleteImageWithConfirmation,
    deleteImageBatch,
    deleteImageMutation,
    isDeleting: isDeleting || deleteImageMutation.isPending,
    error: deleteImageMutation.error,
    extractFilePathFromUrl,
  };
};

export default useImageDelete;