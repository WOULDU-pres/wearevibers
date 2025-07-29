import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useVibeStatus, 
  useVibeCount, 
  useToggleVibe, 
  useRealtimeVibes,
  useDebouncedToggleVibe,
  type VibeContentType 
} from '@/hooks/useVibes';

interface VibeButtonProps {
  contentId: string;
  contentType: VibeContentType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
  showText?: boolean;
  className?: string;
  disabled?: boolean;
  enableRealtime?: boolean;
  useDebouncedToggle?: boolean;
  debounceDelay?: number;
}

export const VibeButton: React.FC<VibeButtonProps> = ({
  contentId,
  contentType,
  size = 'md',
  variant = 'ghost',
  showCount = true,
  showText = false,
  className,
  disabled = false,
  enableRealtime = true,
  useDebouncedToggle = false,
  debounceDelay = 300,
}) => {
  const [isOptimistic, setIsOptimistic] = useState(false);

  // 데이터 조회
  const { data: isVibed = false } = useVibeStatus(contentId, contentType);
  const { data: vibeCount = 0 } = useVibeCount(contentId, contentType);

  // 뮤테이션
  const normalToggle = useToggleVibe();
  const debouncedToggle = useDebouncedToggleVibe(debounceDelay);
  const toggleVibe = useDebouncedToggle ? debouncedToggle : normalToggle;

  // 실시간 업데이트
  useRealtimeVibes(contentId, contentType);

  const handleClick = async () => {
    if (disabled || toggleVibe.isPending) return;

    try {
      setIsOptimistic(true);
      await toggleVibe.mutateAsync({
        contentId,
        contentType,
        isVibed,
      });
    } catch (error) {
      console.error('Error toggling vibe:', error);
    } finally {
      setIsOptimistic(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 px-2 text-xs',
          icon: 'h-3 w-3',
          gap: 'gap-1',
        };
      case 'lg':
        return {
          button: 'h-12 px-4 text-base',
          icon: 'h-6 w-6',
          gap: 'gap-3',
        };
      default:
        return {
          button: 'h-10 px-3 text-sm',
          icon: 'h-4 w-4',
          gap: 'gap-2',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const isLoading = toggleVibe.isPending || isOptimistic;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={variant}
      className={cn(
        sizeClasses.button,
        'transition-all duration-200 ease-in-out',
        isVibed && 'text-red-500 hover:text-red-600',
        !isVibed && 'text-muted-foreground hover:text-red-500',
        className
      )}
    >
      <div className={cn('flex items-center', sizeClasses.gap)}>
        {isLoading ? (
          <Loader2 className={cn(sizeClasses.icon, 'animate-spin')} />
        ) : (
          <Heart 
            className={cn(
              sizeClasses.icon,
              'transition-all duration-200',
              isVibed && 'fill-current scale-110'
            )} 
          />
        )}
        
        {(showCount || showText) && (
          <div className="flex items-center gap-1">
            {showCount && (
              <span className={cn(
                'font-medium transition-all duration-200',
                isVibed && 'text-red-500',
                isLoading && 'opacity-70'
              )}>
                {vibeCount}
              </span>
            )}
            {showText && (
              <span className={cn(
                'transition-all duration-200',
                isLoading && 'opacity-70'
              )}>
                {isVibed ? '좋아요 취소' : '좋아요'}
              </span>
            )}
          </div>
        )}
      </div>
    </Button>
  );
};

// 컴팩트 버전 (아이콘 + 숫자만)
export const VibeIconButton: React.FC<Omit<VibeButtonProps, 'showText'>> = ({
  contentId,
  contentType,
  size = 'sm',
  variant = 'ghost',
  showCount = true,
  className,
  disabled = false,
  enableRealtime = true,
}) => {
  return (
    <VibeButton
      contentId={contentId}
      contentType={contentType}
      size={size}
      variant={variant}
      showCount={showCount}
      showText={false}
      className={className}
      disabled={disabled}
      enableRealtime={enableRealtime}
    />
  );
};

// 좋아요 수만 표시하는 컴포넌트
export const VibeCount: React.FC<{
  contentId: string;
  contentType: VibeContentType;
  enableRealtime?: boolean;
  className?: string;
}> = ({ contentId, contentType, enableRealtime = true, className }) => {
  const { data: vibeCount = 0 } = useVibeCount(contentId, contentType);
  
  // 실시간 업데이트
  useEffect(() => {
    if (enableRealtime) {
      // Realtime vibes are handled by parent component
    }
  }, [enableRealtime, contentId, contentType]);

  return (
    <div className={cn(
      'flex items-center gap-1 text-sm text-muted-foreground',
      className
    )}>
      <Heart className="h-3 w-3 text-red-500" />
      <span className="font-medium">{vibeCount}</span>
    </div>
  );
};

// 좋아요 상태만 확인하는 컴포넌트 (UI 없음)
export const VibeStatusIndicator: React.FC<{
  contentId: string;
  contentType: VibeContentType;
  onStatusChange?: (isVibed: boolean) => void;
}> = ({ contentId, contentType, onStatusChange }) => {
  const { data: isVibed = false } = useVibeStatus(contentId, contentType);

  React.useEffect(() => {
    onStatusChange?.(isVibed);
  }, [isVibed, onStatusChange]);

  return null;
};

export default VibeButton;