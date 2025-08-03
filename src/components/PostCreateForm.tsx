import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/FileUpload';
import { ImageGallery } from '@/components/ImageGallery';
import { ShinyButton } from '@/components/ui/shiny-button';
import { BorderBeam } from '@/components/ui/border-beam';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { 
  PlusCircle,
  Eye,
  Edit,
  X,
  Trash2,
  Save,
  ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';

const postSchema = z.object({
  title: z.string()
    .min(3, '제목은 최소 3글자 이상이어야 합니다.')
    .max(200, '제목은 200글자를 초과할 수 없습니다.'),
  content: z.string()
    .min(10, '내용은 최소 10글자 이상이어야 합니다.')
    .max(5000, '내용은 5000글자를 초과할 수 없습니다.'),
  category: z.enum(['desk-setup', 'coding-playlist', 'ide-theme', 'free-talk'], {
    required_error: '카테고리를 선택해주세요.',
  }),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostCreateFormProps {
  onSubmit: (data: PostFormData & { image_urls: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<PostFormData>;
}

const categories = [
  { 
    value: 'desk-setup', 
    label: '🖥️ 데스크테리어', 
    description: '작업 공간과 데스크 셋업 공유'
  },
  { 
    value: 'coding-playlist', 
    label: '🎵 코딩플레이리스트', 
    description: '개발할 때 듣는 음악 추천'
  },
  { 
    value: 'ide-theme', 
    label: '🎨 IDE테마', 
    description: 'IDE 테마와 커스터마이징 공유'
  },
  { 
    value: 'free-talk', 
    label: '💬 자유게시판', 
    description: '개발 관련 자유로운 이야기'
  },
];

export const PostCreateForm: React.FC<PostCreateFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  const { uploadFile } = useFileUpload();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: initialData?.category || undefined,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();
  const titleLength = watchedValues.title?.length || 0;
  const contentLength = watchedValues.content?.length || 0;

  // Auto-save draft functionality
  useEffect(() => {
    if (isDirty && !isLoading) {
      const timer = setTimeout(() => {
        localStorage.setItem('post-draft', JSON.stringify({
          ...watchedValues,
          image_urls: uploadedImages,
          timestamp: Date.now(),
        }));
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [watchedValues, uploadedImages, isDirty, isLoading]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('post-draft');
    if (savedDraft && !initialData) {
      try {
        const draft = JSON.parse(savedDraft);
        const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent && (draft.title || draft.content)) {
          const shouldRestore = confirm('임시 저장된 글이 있습니다. 복원하시겠습니까?');
          if (shouldRestore) {
            setValue('title', draft.title || '');
            setValue('content', draft.content || '');
            setValue('category', draft.category);
            setUploadedImages(draft.image_urls || []);
          }
        }
      } catch (error) {
        console.error('Draft restore error:', error);
      }
    }
  }, [setValue, initialData]);

  const handleImageUpload = async (file: File): Promise<string> => {
    if (uploadedImages.length >= 10) {
      throw new Error('최대 10개의 이미지만 업로드할 수 있습니다.');
    }

    setUploadingImages(true);
    try {
      const imageUrl = await uploadFile(file, {
        bucket: 'posts',
        folder: 'images',
        upsert: false,
      });
      
      setUploadedImages(prev => [...prev, imageUrl]);
      return imageUrl;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setUploadedImages(newImages);
  };

  const handleFormSubmit = async (data: PostFormData) => {
    try {
      await onSubmit({ ...data, image_urls: uploadedImages });
      localStorage.removeItem('post-draft');
      reset();
      setUploadedImages([]);
    } catch (error) {
      console.error('Post submission error:', error);
    }
  };

  const handleCancel = () => {
    if (isDirty || uploadedImages.length > 0) {
      const shouldDiscard = confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?');
      if (!shouldDiscard) return;
    }
    localStorage.removeItem('post-draft');
    onCancel();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur relative">
        <BorderBeam size={250} duration={12} delay={9} />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            새 글 작성하기
            {isDraftSaved && (
              <Badge variant="secondary" className="text-xs">
                임시저장됨
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                제목 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  {...register('title')}
                  placeholder="글 제목을 입력하세요..."
                  className={cn(
                    'pr-16',
                    errors.title && 'border-red-500 focus:border-red-500'
                  )}
                  disabled={isLoading}
                />
                <Badge 
                  variant={titleLength > 180 ? 'destructive' : 'secondary'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  {titleLength}/200
                </Badge>
              </div>
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <Select
                value={watchedValues.category}
                onValueChange={(value) => setValue('category', value as PostFormData['category'], { shouldValidate: true })}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(
                  errors.category && 'border-red-500 focus:border-red-500'
                )}>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex flex-col">
                        <span>{category.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Content Editor with Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  내용 <span className="text-red-500">*</span>
                </label>
                <Badge 
                  variant={contentLength > 4500 ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {contentLength}/5000
                </Badge>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    작성
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    미리보기
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="space-y-2">
                  <Textarea
                    {...register('content')}
                    placeholder="내용을 입력하세요... (마크다운 지원)"
                    className={cn(
                      'min-h-[300px] resize-none',
                      errors.content && 'border-red-500 focus:border-red-500'
                    )}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    마크다운 문법을 사용할 수 있습니다. **굵게**, *기울임*, `코드`, [링크](URL)
                  </p>
                </TabsContent>

                <TabsContent value="preview" className="space-y-2">
                  <div className="min-h-[300px] p-4 border rounded-md bg-background">
                    {watchedValues.content ? (
                      <MarkdownRenderer content={watchedValues.content} />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        미리보기할 내용이 없습니다.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {errors.content && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  이미지 ({uploadedImages.length}/10)
                </label>
                {uploadingImages && (
                  <Badge variant="secondary" className="text-xs">
                    업로드 중...
                  </Badge>
                )}
              </div>

              {/* Image Gallery */}
              {uploadedImages.length > 0 && (
                <ImageGallery
                  images={uploadedImages}
                  onImagesChange={handleImagesChange}
                  bucket="posts"
                  maxImages={10}
                  showCounter={true}
                  allowBatchDelete={true}
                  disabled={isLoading || uploadingImages}
                  className="p-4 border rounded-lg bg-muted/20"
                />
              )}

              {/* Upload Area */}
              {uploadedImages.length < 10 && (
                <FileUpload
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  onUpload={handleImageUpload}
                  disabled={isLoading || uploadingImages}
                  enableCompression={true}
                  showCompressionSettings={true}
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                취소
              </Button>
              
              <div className="flex flex-1 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    localStorage.setItem('post-draft', JSON.stringify({
                      ...watchedValues,
                      image_urls: uploadedImages,
                      timestamp: Date.now(),
                    }));
                    toast.success('임시저장되었습니다.');
                  }}
                  disabled={isLoading || (!isDirty && uploadedImages.length === 0)}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  임시저장
                </Button>

                <ShinyButton
                  type="submit"
                  disabled={!isValid || isLoading || uploadingImages}
                  className="flex-1 bg-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      작성 중...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      게시글 작성
                    </>
                  )}
                </ShinyButton>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostCreateForm;