import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ImageDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  imageCount?: number;
  title?: string;
  description?: string;
}

export const ImageDeleteDialog: React.FC<ImageDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  imageCount = 1,
  title,
  description,
}) => {
  const defaultTitle = imageCount > 1 
    ? `${imageCount}개의 이미지 삭제`
    : '이미지 삭제';

  const defaultDescription = imageCount > 1
    ? `${imageCount}개의 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    : '이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title || defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isDeleting}>
              취소
            </Button>
          </AlertDialogCancel>
          
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ImageDeleteDialog;