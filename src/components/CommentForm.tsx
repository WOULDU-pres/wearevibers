import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores';
import { useCreateComment, useUpdateComment } from '@/hooks/useComments';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { 
  Bold, 
  Italic, 
  Code, 
  Eye, 
  Edit, 
  Send, 
  X,
  MessageSquare,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommentContentType, CommentWithProfile, DEFAULT_COMMENT_VALIDATION } from '@/types/comment';

interface CommentFormProps {
  contentId: string;
  contentType: CommentContentType;
  parentId?: string;
  initialValue?: string;
  onSubmit?: (comment: CommentWithProfile) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  isEditing?: boolean;
  editingComment?: CommentWithProfile;
  autoFocus?: boolean;
  compact?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  contentId,
  contentType,
  parentId,
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder,
  className,
  isEditing = false,
  editingComment,
  autoFocus = false,
  compact = false,
}) => {
  const { user, profile } = useAuthStore();
  const [content, setContent] = useState(initialValue);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  // 글자 수 제한
  const maxLength = DEFAULT_COMMENT_VALIDATION.maxLength;
  const minLength = DEFAULT_COMMENT_VALIDATION.minLength;
  const isContentValid = content.trim().length >= minLength && content.length <= maxLength;
  const charactersLeft = maxLength - content.length;

  // 자동 포커스
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // 마크다운 단축키 처리
  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // 선택된 텍스트가 있는 경우
      newText = content.substring(0, start) + syntax + selectedText + syntax + content.substring(end);
      newCursorPos = start + syntax.length + selectedText.length + syntax.length;
    } else {
      // 선택된 텍스트가 없는 경우
      const placeholderText = placeholder || '텍스트';
      newText = content.substring(0, start) + syntax + placeholderText + syntax + content.substring(end);
      newCursorPos = start + syntax.length + placeholderText.length;
    }

    setContent(newText);
    
    // 커서 위치 설정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isContentValid || !user) return;

    setIsSubmitting(true);

    try {
      if (isEditing && editingComment) {
        // 댓글 수정
        const result = await updateComment.mutateAsync({
          commentId: editingComment.id,
          updates: { content: content.trim() },
        });
        
        onSubmit?.(result);
      } else {
        // 새 댓글 작성
        const result = await createComment.mutateAsync({
          content: content.trim(),
          content_id: contentId,
          content_type: contentType,
          parent_id: parentId,
        });
        
        onSubmit?.(result);
      }
      
      // 폼 초기화 (수정이 아닌 경우만)
      if (!isEditing) {
        setContent('');
        setActiveTab('write');
      }
    } catch (error) {
      console.error('댓글 처리 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (isContentValid) {
            handleSubmit(e as React.FormEvent<HTMLFormElement>);
          }
          break;
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '굵은 텍스트');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '기울임 텍스트');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '코드');
          break;
      }
    }

    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          댓글을 작성하려면 로그인이 필요합니다.
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 사용자 프로필 (compact 모드가 아닐 때만) */}
      {!compact && (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback>
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{profile.full_name || profile.username}</span>
            {parentId && (
              <span className="text-xs text-muted-foreground">답글 작성 중...</span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'preview')}>
          <div className="flex items-center justify-between mb-2">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="write" className="flex items-center gap-2">
                <Edit className="h-3 w-3" />
                작성
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                미리보기
              </TabsTrigger>
            </TabsList>

            {/* 글자 수 표시 */}
            <div className="flex items-center gap-2">
              <Badge variant={charactersLeft < 100 ? 'destructive' : 'secondary'} className="text-xs">
                {charactersLeft}자 남음
              </Badge>
            </div>
          </div>

          <TabsContent value="write" className="space-y-2">
            {/* 마크다운 도구 모음 */}
            <div className="flex items-center gap-1 p-2 border border-border rounded-t-md bg-muted/20">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('**', '굵은 텍스트')}
                className="h-7 w-7 p-0"
                title="굵게 (Ctrl+B)"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('*', '기울임 텍스트')}
                className="h-7 w-7 p-0"
                title="기울임 (Ctrl+I)"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('`', '코드')}
                className="h-7 w-7 p-0"
                title="인라인 코드 (Ctrl+`)"
              >
                <Code className="h-3 w-3" />
              </Button>
              
              <div className="flex-1" />
              
              <span className="text-xs text-muted-foreground">
                Ctrl+Enter로 제출
              </span>
            </div>

            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || (parentId ? '답글을 작성해주세요...' : '댓글을 작성해주세요...')}
              className={cn(
                "min-h-[100px] resize-none rounded-t-none border-t-0",
                compact && "min-h-[80px]"
              )}
              maxLength={maxLength}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-2">
            <div className="min-h-[100px] p-3 border border-border rounded-md bg-background">
              {content.trim() ? (
                <MarkdownRenderer content={content} className="prose-sm" />
              ) : (
                <p className="text-muted-foreground text-sm">미리보기할 내용이 없습니다.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 작업 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            마크다운 지원: **굵게**, *기울임*, `코드`
          </div>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            )}
            
            <Button
              type="submit"
              size="sm"
              disabled={!isContentValid || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isEditing ? '수정' : '댓글 작성'}
            </Button>
          </div>
        </div>
      </form>

      {/* 도움말 텍스트 */}
      {!compact && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Ctrl+Enter로 빠르게 작성할 수 있습니다</p>
          <p>• 마크다운 문법을 사용하여 텍스트를 꾸밀 수 있습니다</p>
          <p>• 예의를 지켜주시고, 건설적인 댓글을 작성해주세요</p>
        </div>
      )}
    </div>
  );
};