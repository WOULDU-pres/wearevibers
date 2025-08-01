// BlockButton.tsx - 사용자 차단 버튼 컴포넌트
// EPIC-04: 보안 및 안정성 - STORY-015

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import { useBlockUser, useUnblockUser, useIsUserBlocked } from '@/hooks/useSecurity';
import type { BlockButtonProps } from '@/types/security';

export function BlockButton({
  userId,
  username,
  isBlocked: propIsBlocked,
  onBlock,
  onUnblock,
  className
}: BlockButtonProps) {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // 차단 상태 조회 (prop으로 전달되지 않은 경우)
  const { data: isBlockedFromQuery } = useIsUserBlocked(userId);
  const isBlocked = propIsBlocked ?? isBlockedFromQuery ?? false;

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleBlock = async () => {
    try {
      await blockUserMutation.mutateAsync({
        blocked_user_id: userId,
        reason: blockReason.trim() || undefined
      });
      
      setBlockReason('');
      setIsBlockDialogOpen(false);
      onBlock?.();
    } catch (error) {
      console.error('차단 실패:', error);
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUserMutation.mutateAsync({
        blocked_user_id: userId
      });
      
      setIsUnblockDialogOpen(false);
      onUnblock?.();
    } catch (error) {
      console.error('차단 해제 실패:', error);
    }
  };

  if (isBlocked) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUnblockDialogOpen(true)}
          className={`text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 ${className}`}
          disabled={unblockUserMutation.isPending}
        >
          <UserCheck className="h-4 w-4 mr-1" />
          차단 해제
        </Button>

        {/* 차단 해제 확인 다이얼로그 */}
        <AlertDialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldOff className="h-5 w-5 text-green-500" />
                차단 해제하기
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{username}</strong>님의 차단을 해제하시겠습니까?
                <br />
                차단 해제 후 해당 사용자의 콘텐츠가 다시 표시됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnblock}
                disabled={unblockUserMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {unblockUserMutation.isPending ? '처리 중...' : '차단 해제'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsBlockDialogOpen(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ${className}`}
        disabled={blockUserMutation.isPending}
      >
        <UserX className="h-4 w-4 mr-1" />
        차단하기
      </Button>

      {/* 차단 확인 다이얼로그 */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              사용자 차단하기
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{username}</strong>님을 차단하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* 차단 효과 안내 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">차단 시 효과:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>해당 사용자의 게시글과 댓글이 보이지 않습니다</li>
                <li>해당 사용자가 나의 콘텐츠에 댓글을 달 수 없습니다</li>
                <li>서로 팔로우가 해제됩니다</li>
                <li>언제든지 차단을 해제할 수 있습니다</li>
              </ul>
            </div>

            {/* 차단 사유 (선택사항) */}
            <div className="space-y-2">
              <Label htmlFor="block-reason">
                차단 사유 (선택사항)
              </Label>
              <Textarea
                id="block-reason"
                placeholder="차단 사유를 입력해주세요 (개인 기록용, 상대방에게 보이지 않음)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {blockReason.length}/200자
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setBlockReason('');
                setIsBlockDialogOpen(false);
              }}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={blockUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {blockUserMutation.isPending ? '차단 중...' : '차단하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * 간단한 차단 토글 버튼 (확인 다이얼로그 없이)
 */
interface SimpleBlockToggleProps {
  userId: string;
  username: string;
  isBlocked?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SimpleBlockToggle({
  userId,
  username,
  isBlocked: propIsBlocked,
  size = 'sm',
  className
}: SimpleBlockToggleProps) {
  const { data: isBlockedFromQuery } = useIsUserBlocked(userId);
  const isBlocked = propIsBlocked ?? isBlockedFromQuery ?? false;

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleToggle = async () => {
    try {
      if (isBlocked) {
        await unblockUserMutation.mutateAsync({ blocked_user_id: userId });
      } else {
        await blockUserMutation.mutateAsync({ 
          blocked_user_id: userId,
          reason: `${username} 사용자 빠른 차단`
        });
      }
    } catch (error) {
      console.error('차단 토글 실패:', error);
    }
  };

  const isLoading = blockUserMutation.isPending || unblockUserMutation.isPending;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${
        isBlocked 
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
      } ${className}`}
    >
      {isBlocked ? (
        <ShieldOff className="h-4 w-4" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
    </Button>
  );
}