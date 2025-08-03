import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '@/types/post';

interface PostEditDialogProps {
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
  onSave: (postId: string, updates: {
    title?: string;
    content?: string;
    category?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const categories = [
  { value: 'desk-setup', label: '데스크테리어' },
  { value: 'coding-playlist', label: '코딩플레이리스트' },
  { value: 'ide-theme', label: 'IDE테마' },
  { value: 'free-talk', label: '자유게시판' },
];

export const PostEditDialog: React.FC<PostEditDialogProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: post.title || '',
    content: post.content || '',
    category: post.category || 'free-talk',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 원본 데이터와 비교하여 변경사항 감지
  useEffect(() => {
    const hasFormChanges = 
      formData.title !== post.title ||
      formData.content !== post.content ||
      formData.category !== post.category;
    
    setHasChanges(hasFormChanges);
  }, [formData, post]);

  // 폼 데이터 초기화
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category || 'free-talk',
      });
      setErrors({});
    }
  }, [post, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length < 3) {
      newErrors.title = '제목은 최소 3자 이상이어야 합니다.';
    } else if (formData.title.length > 200) {
      newErrors.title = '제목은 최대 200자까지 입력 가능합니다.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (formData.content.length < 10) {
      newErrors.content = '내용은 최소 10자 이상이어야 합니다.';
    } else if (formData.content.length > 10000) {
      newErrors.content = '내용은 최대 10,000자까지 입력 가능합니다.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    if (!hasChanges) {
      toast.info('변경된 내용이 없습니다.');
      onClose();
      return;
    }

    try {
      await onSave(post.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('게시글 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        '수정된 내용이 저장되지 않습니다. 정말 취소하시겠습니까?'
      );
      if (!confirmLeave) return;
    }
    
    // 폼 데이터 초기화
    setFormData({
      title: post.title || '',
      content: post.content || '',
      category: post.category || 'free-talk',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            게시글 수정
          </DialogTitle>
          <DialogDescription>
            게시글의 제목, 내용, 카테고리를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200자
            </p>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              내용 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="게시글 내용을 입력하세요"
              className={`min-h-[200px] resize-none ${
                errors.content ? 'border-red-500 focus:border-red-500' : ''
              }`}
              disabled={isLoading}
              maxLength={10000}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/10,000자
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostEditDialog;