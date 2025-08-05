// ReportDialog.tsx - 신고 다이얼로그 컴포넌트
// EPIC-04: 보안 및 안정성 - STORY-015

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText } from 'lucide-react';
import { useCreateReport } from '@/hooks/useSecurity';
import { useFormValidation } from '@/hooks/useValidation';
import { validationSchemas } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitization';
import { REPORT_REASON_OPTIONS } from '@/lib/constants/report-reasons';
import type {
  ReportDialogProps,
  ReportReason,
  CreateReportParams as _CreateReportParams,
} from '@/types/security';


export function ReportDialog({
  contentId,
  contentType,
  onSubmit,
  isOpen,
  onClose,
}: ReportDialogProps) {
  const createReportMutation = useCreateReport();

  // 폼 유효성 검사 훅 사용
  const {
    data,
    updateField,
    validateForm,
    resetForm,
    errors: _errors,
    hasFieldError: _hasFieldError,
    getFieldError,
    shouldShowFieldError,
  } = useFormValidation(validationSchemas.report.createReport, {
    reported_content_id: contentId,
    content_type: contentType,
    reason: '' as ReportReason,
    description: '',
  }, {
    sanitize: true,
    sanitizer: sanitizeText,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 폼 유효성 검사
      const validation = await validateForm();
      
      if (!validation.success || !validation.data) {
        setIsSubmitting(false);
        return;
      }

      // 신고 제출
      await createReportMutation.mutateAsync(validation.data);
      onSubmit(validation.data);
      
      // 폼 초기화 및 다이얼로그 닫기
      resetForm({
        reported_content_id: contentId,
        content_type: contentType,
        reason: '' as ReportReason,
        description: '',
      });
      onClose();
    } catch (error) {
      console.error('신고 제출 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다이얼로그가 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm({
        reported_content_id: contentId,
        content_type: contentType,
        reason: '' as ReportReason,
        description: '',
      });
    }
  }, [isOpen, contentId, contentType, resetForm]);

  const selectedReasonOption = REPORT_REASON_OPTIONS.find(
    option => option.value === data.reason
  );

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return '게시글';
      case 'tip': return '팁';
      case 'comment': return '댓글';
      case 'profile': return '프로필';
      default: return '콘텐츠';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {getContentTypeLabel(contentType)} 신고하기
          </DialogTitle>
          <DialogDescription>
            부적절한 콘텐츠를 신고해주세요. 신고된 내용은 검토 후 적절한 조치가 취해집니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 신고 사유 선택 */}
          <div className="space-y-2">
            <Label htmlFor="report-reason">신고 사유 *</Label>
            <Select
              value={data.reason}
              onValueChange={(value: ReportReason) => updateField('reason', value)}
            >
              <SelectTrigger className={shouldShowFieldError('reason') ? 'border-red-500' : ''}>
                <SelectValue placeholder="신고 사유를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowFieldError('reason') && (
              <p className="text-xs text-red-500">
                {getFieldError('reason')}
              </p>
            )}
          </div>

          {/* 선택된 사유의 설명 표시 */}
          {selectedReasonOption && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{selectedReasonOption.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedReasonOption.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 추가 설명 */}
          <div className="space-y-2">
            <Label htmlFor="report-description">
              추가 설명 (선택사항)
            </Label>
            <Textarea
              id="report-description"
              placeholder="신고 사유에 대한 자세한 설명을 입력해주세요 (선택사항)"
              value={data.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={3}
              maxLength={500}
              className={shouldShowFieldError('description') ? 'border-red-500' : ''}
            />
            {shouldShowFieldError('description') && (
              <p className="text-xs text-red-500">
                {getFieldError('description')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {(data.description || '').length}/500자
            </p>
          </div>

          {/* 주의사항 */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">신고하기 전에 확인해주세요</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>허위 신고는 제재 대상이 될 수 있습니다</li>
                  <li>신고 처리까지 1-3일 소요될 수 있습니다</li>
                  <li>신고 결과는 별도로 알려드리지 않습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!data.reason || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '신고 중...' : '신고하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

