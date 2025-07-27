import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useCreateTip, useUpdateTip } from '@/hooks/useTips';
import { toast } from 'sonner';
import type { Tip } from '@/lib/supabase-types';
import { useUIStore } from '@/stores';

const tipSchema = z.object({
  title: z.string().min(3, '제목은 최소 3자 이상이어야 합니다').max(200, '제목은 200자를 초과할 수 없습니다'),
  content: z.string().min(10, '내용은 최소 10자 이상이어야 합니다'),
  category: z.enum(['productivity', 'css-tricks', 'git-flow', 'ui-ux'], {
    required_error: '카테고리를 선택해주세요',
  }),
  difficulty_level: z.number().min(1).max(5),
  read_time: z.number().min(1).max(60).optional(),
});

type TipFormData = z.infer<typeof tipSchema>;

interface TipFormProps {
  tip?: Tip;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TipForm: React.FC<TipFormProps> = ({ tip, onSuccess, onCancel }) => {
  const { activeTab, setActiveTab, estimatedReadTime, setEstimatedReadTime } = useUIStore();
  
  const createTipMutation = useCreateTip();
  const updateTipMutation = useUpdateTip();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<TipFormData>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: tip?.title || '',
      content: tip?.content || '',
      category: tip?.category as any || 'productivity',
      difficulty_level: tip?.difficulty_level || 1,
      read_time: tip?.read_time || 5,
    },
    mode: 'onChange',
  });

  const content = watch('content');
  const difficulty = watch('difficulty_level');

  // Auto-calculate read time based on content length
  useEffect(() => {
    if (content) {
      const words = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute
      setEstimatedReadTime(readTime);
      setValue('read_time', readTime);
    }
  }, [content, setValue]);

  const onSubmit = async (data: TipFormData) => {
    try {
      if (tip) {
        await updateTipMutation.mutateAsync({
          tipId: tip.id,
          tipData: data,
        });
      } else {
        await createTipMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving tip:', error);
    }
  };

  const categoryOptions = [
    { value: 'productivity', label: 'Productivity', description: '생산성 향상 팁' },
    { value: 'css-tricks', label: 'CSS Tricks', description: 'CSS 트릭과 스타일링' },
    { value: 'git-flow', label: 'Git Flow', description: 'Git 워크플로우' },
    { value: 'ui-ux', label: 'UI/UX', description: 'UI/UX 디자인' },
  ];

  const difficultyLabels = {
    1: '입문',
    2: '초급',
    3: '중급',
    4: '고급',
    5: '전문가',
  };

  const isLoading = createTipMutation.isPending || updateTipMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {tip ? '팁 수정하기' : '새로운 팁 작성하기'}
        </h1>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            className="bg-gradient-vibe hover:opacity-90 text-white"
          >
            {isLoading ? (tip ? '수정 중...' : '게시 중...') : (tip ? '수정하기' : '게시하기')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="팁의 제목을 입력해주세요"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(value) => setValue('category', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>난이도: {difficultyLabels[difficulty as keyof typeof difficultyLabels]}</Label>
                <Slider
                  value={[difficulty]}
                  onValueChange={(value) => setValue('difficulty_level', value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>입문</span>
                  <span>초급</span>
                  <span>중급</span>
                  <span>고급</span>
                  <span>전문가</span>
                </div>
              </div>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                예상 읽기 시간: {estimatedReadTime}분
              </Badge>
              <span className="text-xs text-muted-foreground">
                (내용 길이에 따라 자동 계산됩니다)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>내용 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">편집</TabsTrigger>
                <TabsTrigger value="preview">미리보기</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="mt-4">
                <MarkdownEditor
                  markdown={content}
                  onChange={(value) => setValue('content', value)}
                  placeholder="팁의 내용을 마크다운으로 작성해주세요..."
                  className="min-h-[400px]"
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <div className="border border-border rounded-md p-4 min-h-[400px] bg-muted/20">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-muted-foreground">미리보기할 내용이 없습니다.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default TipForm;