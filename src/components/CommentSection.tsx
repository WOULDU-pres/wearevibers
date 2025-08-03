import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommentForm } from '@/components/CommentForm';
import { CommentCard } from '@/components/CommentCard';
import { useComments, useCommentCount } from '@/hooks/useComments';
import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import { useAuthStore } from '@/stores';
import { 
  MessageSquare, 
  SortAsc, 
  SortAsc,
  RefreshCw,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommentContentType, CommentWithProfile } from '@/types/comment';

interface CommentSectionProps {
  contentId: string;
  contentType: CommentContentType;
  className?: string;
  title?: string;
  showTitle?: boolean;
  enableRealtime?: boolean;
  maxDepth?: number;
  initialSortBy?: 'newest' | 'oldest' | 'popular';
  showStats?: boolean;
  compact?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'popular';

const SORT_OPTIONS = {
  newest: { label: '최신순', icon: Clock },
  oldest: { label: '등록순', icon: SortAsc },
  popular: { label: '인기순', icon: TrendingUp },
} as const;

export const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  contentType,
  className,
  title,
  showTitle = true,
  enableRealtime = true,
  maxDepth = 3,
  initialSortBy = 'newest',
  showStats = true,
  compact = false,
}) => {
  const { user } = useAuthStore();
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState<CommentWithProfile | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);

  // 댓글 데이터 조회
  const { 
    data: comments = [], 
    isLoading, 
    error,
    refetch,
  } = useComments(contentId, contentType);

  const { 
    data: commentCount = 0 
  } = useCommentCount(contentId, contentType);

  // 실시간 업데이트
  useRealtimeComments({
    contentId,
    contentType,
    enabled: enableRealtime,
  });

  // 댓글 정렬
  const sortedComments = React.useMemo(() => {
    if (!comments) return [];

    const sortComment = (a: CommentWithProfile, b: CommentWithProfile) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'popular':
          return (b.vibe_count || 0) - (a.vibe_count || 0);
        default:
          return 0;
      }
    };

    // 재귀적으로 댓글과 답글을 정렬
    const sortCommentsRecursively = (commentsToSort: CommentWithProfile[]): CommentWithProfile[] => {
      return commentsToSort
        .sort(sortComment)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? sortCommentsRecursively(comment.replies) : [],
        }));
    };

    return sortCommentsRecursively([...comments]);
  }, [comments, sortBy]);

  // 통계 계산
  const stats = React.useMemo(() => {
    const calculateStats = (commentsArray: CommentWithProfile[]): {
      totalComments: number;
      totalVibes: number;
      uniqueAuthors: Set<string>;
    } => {
      let totalComments = 0;
      let totalVibes = 0;
      const uniqueAuthors = new Set<string>();

      const processComment = (comment: CommentWithProfile) => {
        totalComments++;
        totalVibes += comment.vibe_count || 0;
        uniqueAuthors.add(comment.user_id);

        if (comment.replies) {
          comment.replies.forEach(processComment);
        }
      };

      commentsArray.forEach(processComment);

      return { totalComments, totalVibes, uniqueAuthors };
    };

    if (!comments || comments.length === 0) {
      return { totalComments: 0, totalVibes: 0, uniqueAuthors: 0 };
    }

    const { totalComments, totalVibes, uniqueAuthors } = calculateStats(comments);
    return {
      totalComments,
      totalVibes,
      uniqueAuthors: uniqueAuthors.size,
    };
  }, [comments]);

  // 답글 처리
  const handleReply = (parentId: string) => {
    setReplyingToComment(parentId);
    setShowCommentForm(false);
  };

  // 수정 처리
  const handleEdit = (comment: CommentWithProfile) => {
    setEditingComment(comment);
    setShowCommentForm(false);
    setReplyingToComment(null);
  };

  // 새 댓글 작성 완료
  const handleCommentSubmit = () => {
    setShowCommentForm(false);
  };

  // 답글 작성 완료
  const handleReplySubmit = () => {
    setReplyingToComment(null);
  };

  // 수정 완료
  const handleEditSubmit = () => {
    setEditingComment(null);
  };

  // 로딩 스켈레톤
  const CommentSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      {showTitle && (
        <CardHeader className={cn("space-y-4", compact && "pb-4")}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {title || '댓글'}
              <Badge variant="secondary" className="ml-2">
                {commentCount}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* 정렬 옵션 */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([value, { label, icon: Icon }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 새로고침 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* 통계 */}
          {showStats && stats.totalComments > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {stats.totalComments}개 댓글
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {stats.uniqueAuthors}명 참여
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stats.totalVibes}개 좋아요
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className={cn("space-y-6", compact && "pt-0")}>
        {/* 새 댓글 작성 폼 */}
        {user && !editingComment && !replyingToComment && (
          <div>
            {showCommentForm ? (
              <CommentForm
                contentId={contentId}
                contentType={contentType}
                onSubmit={handleCommentSubmit}
                onCancel={() => setShowCommentForm(false)}
                autoFocus={true}
              />
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowCommentForm(true)}
                className="w-full justify-start h-12 text-muted-foreground"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                댓글을 작성해보세요...
              </Button>
            )}
          </div>
        )}

        {!showTitle && <Separator />}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <CommentSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">댓글을 불러오는 중 오류가 발생했습니다.</p>
              <Button variant="outline" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          ) : sortedComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {user ? '첫 번째 댓글을 작성해보세요!' : '아직 댓글이 없습니다.'}
              </p>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  댓글을 작성하려면 로그인이 필요합니다.
                </p>
              )}
            </div>
          ) : (
            <>
              {sortedComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  contentId={contentId}
                  contentType={contentType}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  maxDepth={maxDepth}
                />
              ))}
            </>
          )}
        </div>

        {/* 수정 폼 */}
        {editingComment && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-3">댓글 수정</h4>
            <CommentForm
              contentId={contentId}
              contentType={contentType}
              initialValue={editingComment.content}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingComment(null)}
              isEditing={true}
              editingComment={editingComment}
              autoFocus={true}
            />
          </div>
        )}

        {/* 답글 폼 */}
        {replyingToComment && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-3">답글 작성</h4>
            <CommentForm
              contentId={contentId}
              contentType={contentType}
              parentId={replyingToComment}
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyingToComment(null)}
              placeholder="답글을 작성해주세요..."
              autoFocus={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};