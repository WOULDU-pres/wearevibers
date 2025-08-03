import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { CommentForm } from '@/components/CommentForm';
import { useAuthStore } from '@/stores';
import { 
  useDeleteComment, 
  useVibeComment, 
  useCommentVibeStatus 
} from '@/hooks/useComments';
import { 
  Heart, 
  MessageCircle, 
  
  Edit, 
  
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { CommentWithProfile, CommentContentType } from '@/types/comment';

interface CommentCardProps {
  comment: CommentWithProfile;
  contentId: string;
  contentType: CommentContentType;
  onReply?: (parentId: string) => void;
  onEdit?: (comment: CommentWithProfile) => void;
  depth?: number;
  maxDepth?: number;
  className?: string;
  showReplies?: boolean;
  onToggleReplies?: (commentId: string) => void;
  isCollapsed?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  contentId,
  contentType,
  onReply,
  onEdit,
  depth = 0,
  maxDepth = 3,
  className,
  showReplies = true,
  onToggleReplies,
  isCollapsed = false,
}) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [repliesCollapsed, setRepliesCollapsed] = useState(false);

  const deleteComment = useDeleteComment();
  const vibeComment = useVibeComment();
  const { data: isVibed = false } = useCommentVibeStatus(comment.id);

  // 권한 확인
  const isOwner = user?.id === comment.user_id;
  const canReply = !!user && depth < maxDepth;
  const hasReplies = comment.replies && comment.replies.length > 0;

  // 시간 포맷팅
  const timeAgo = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { 
        addSuffix: true, 
        locale: ko 
      })
    : '';

  // 들여쓰기 계산
  const indentLevel = Math.min(depth, maxDepth);
  const indentClass = indentLevel > 0 ? `ml-${indentLevel * 4}` : '';

  // 댓글 삭제 처리
  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync(comment.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  // 좋아요 토글
  const handleVibeToggle = async () => {
    try {
      await vibeComment.mutateAsync({
        commentId: comment.id,
        isVibed,
      });
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 답글 폼 토글
  const handleReplyClick = () => {
    if (onReply) {
      onReply(comment.id);
    } else {
      setShowReplyForm(!showReplyForm);
    }
  };

  // 수정 처리
  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment);
    } else {
      setIsEditing(true);
    }
  };

  // 수정 완료
  const handleEditComplete = () => {
    setIsEditing(false);
  };

  // 답글 완료
  const handleReplyComplete = () => {
    setShowReplyForm(false);
  };

  // 답글 토글
  const handleToggleReplies = () => {
    if (onToggleReplies) {
      onToggleReplies(comment.id);
    } else {
      setRepliesCollapsed(!repliesCollapsed);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* 메인 댓글 */}
      <div className={cn(
        "flex gap-3 p-4 rounded-lg border border-border bg-card",
        indentClass,
        depth > 0 && "bg-muted/20",
        isCollapsed && "opacity-50"
      )}>
        {/* 아바타 */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage 
            src={comment.profiles.avatar_url || ''} 
            alt={comment.profiles.username} 
          />
          <AvatarFallback>
            {comment.profiles.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.profiles.full_name || comment.profiles.username}
              </span>
              
              {comment.profiles.is_online && (
                <Badge variant="secondary" className="text-xs">
                  온라인
                </Badge>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo}
                {comment.updated_at !== comment.created_at && (
                  <span className="ml-1">(편집됨)</span>
                )}
              </div>
            </div>

            {/* 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwner && (
                  <DropdownMenuItem>
                    신고하기
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 댓글 내용 */}
          {isEditing ? (
            <CommentForm
              contentId={contentId}
              contentType={contentType}
              initialValue={comment.content}
              onSubmit={handleEditComplete}
              onCancel={() => setIsEditing(false)}
              isEditing={true}
              editingComment={comment}
              compact={true}
              autoFocus={true}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={comment.content} />
            </div>
          )}

          {/* 액션 버튼들 */}
          {!isEditing && (
            <div className="flex items-center gap-1">
              {/* 좋아요 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVibeToggle}
                disabled={vibeComment.isPending}
                className={cn(
                  "h-7 px-2 text-xs",
                  isVibed && "text-red-500 bg-red-50 hover:bg-red-100"
                )}
              >
                {vibeComment.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Heart className={cn("h-3 w-3 mr-1", isVibed && "fill-current")} />
                )}
                {comment.vibe_count || 0}
              </Button>

              {/* 답글 버튼 */}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplyClick}
                  className="h-7 px-2 text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  답글
                </Button>
              )}

              {/* 답글 토글 버튼 */}
              {hasReplies && showReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleReplies}
                  className="h-7 px-2 text-xs"
                >
                  {repliesCollapsed || isCollapsed ? (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  )}
                  답글 {comment.replies?.length}개
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 답글 작성 폼 */}
      {showReplyForm && !isEditing && (
        <div className={cn("pl-11", indentLevel > 0 && `ml-${indentLevel * 4}`)}>
          <CommentForm
            contentId={contentId}
            contentType={contentType}
            parentId={comment.id}
            onSubmit={handleReplyComplete}
            onCancel={() => setShowReplyForm(false)}
            placeholder="답글을 작성해주세요..."
            compact={true}
            autoFocus={true}
          />
        </div>
      )}

      {/* 답글 목록 */}
      {hasReplies && showReplies && !(repliesCollapsed || isCollapsed) && (
        <div className="space-y-3">
          {comment.replies?.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              contentId={contentId}
              contentType={contentType}
              onReply={onReply}
              onEdit={onEdit}
              depth={depth + 1}
              maxDepth={maxDepth}
              showReplies={showReplies}
              onToggleReplies={onToggleReplies}
            />
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 댓글이 영구적으로 삭제됩니다.
              {hasReplies && " 이 댓글에 달린 모든 답글도 함께 삭제됩니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteComment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};