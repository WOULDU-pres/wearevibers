// ReportButton.tsx - 신고 버튼 컴포넌트
// EPIC-04: 보안 및 안정성 - STORY-015

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Flag, Shield } from 'lucide-react';
import { ReportDialog } from './ReportDialog';
import type { ReportButtonProps } from '@/types/security';

export function ReportButton({
  contentId,
  contentType,
  className,
}: ReportButtonProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleReportSubmit = (params: CreateReportParams) => {
    // 신고 완료 후 추가 처리가 필요하면 여기서 수행
    console.warn('신고 완료:', params);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={className}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsReportDialogOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Flag className="h-4 w-4 mr-2" />
            신고하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        contentId={contentId}
        contentType={contentType}
        onSubmit={handleReportSubmit}
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
      />
    </>
  );
}

/**
 * 간단한 신고 버튼 (드롭다운 없이)
 */
export function SimpleReportButton({
  contentId,
  contentType,
  className,
}: ReportButtonProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleReportSubmit = (params: CreateReportParams) => {
    console.warn('신고 완료:', params);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsReportDialogOpen(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      >
        <Flag className="h-4 w-4 mr-1" />
        신고
      </Button>

      <ReportDialog
        contentId={contentId}
        contentType={contentType}
        onSubmit={handleReportSubmit}
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
      />
    </>
  );
}

/**
 * 보안 관련 액션 버튼 (신고 + 차단)
 */
interface SecurityActionsProps {
  contentId: string;
  contentType: 'post' | 'tip' | 'comment' | 'profile';
  userId?: string; // 차단 기능을 위한 사용자 ID
  username?: string; // 차단 확인을 위한 사용자명
  className?: string;
}

export function SecurityActions({
  contentId,
  contentType,
  userId,
  username,
  className,
}: SecurityActionsProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleReportSubmit = (params: CreateReportParams) => {
    console.warn('신고 완료:', params);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={className}
          >
            <Shield className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsReportDialogOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Flag className="h-4 w-4 mr-2" />
            신고하기
          </DropdownMenuItem>
          
          {userId && username && (
            <DropdownMenuItem
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              사용자 차단
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        contentId={contentId}
        contentType={contentType}
        onSubmit={handleReportSubmit}
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
      />
    </>
  );
}