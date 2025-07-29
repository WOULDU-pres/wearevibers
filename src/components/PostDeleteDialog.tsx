import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '@/types/post';

interface PostDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post & {
    profiles: {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  onDelete: (postId: string) => Promise<void>;
  isLoading?: boolean;
}

export const PostDeleteDialog: React.FC<PostDeleteDialogProps> = ({
  isOpen,
  onClose,
  post,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = async () => {
    try {
      await onDelete(post.id);
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('게시글 삭제에 실패했습니다.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex items-start space-x-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                게시글 삭제
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            
            {/* Post Info */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {post.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                <span>작성자: {post.profiles.full_name || post.profiles.username}</span>
                <span>•</span>
                <span>댓글 {post.comment_count || 0}개</span>
                <span>•</span>
                <span>좋아요 {post.vibe_count || 0}개</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    주의사항
                  </p>
                  <ul className="mt-1 text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• 게시글과 관련된 모든 댓글이 함께 삭제됩니다</li>
                    <li>• 삭제된 데이터는 복구할 수 없습니다</li>
                    <li>• 다른 사용자에게도 즉시 반영됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDeleteDialog;