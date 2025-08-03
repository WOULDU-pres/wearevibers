import React from 'react';
import { cn } from '@/lib/utils';

interface OnlineStatusProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showPulse?: boolean;
  position?: 'absolute' | 'relative';
  className?: string;
  onlineText?: string;
  offlineText?: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  size = 'md',
  showText = false,
  showPulse = true,
  position = 'absolute',
  className,
  onlineText = '온라인',
  offlineText = '오프라인',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          dot: 'w-2 h-2',
          text: 'text-xs',
          pulse: 'w-2 h-2',
        };
      case 'lg':
        return {
          dot: 'w-4 h-4',
          text: 'text-sm',
          pulse: 'w-4 h-4',
        };
      default:
        return {
          dot: 'w-3 h-3',
          text: 'text-xs',
          pulse: 'w-3 h-3',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getPositionClasses = () => {
    if (position === 'absolute') {
      return size === 'sm' 
        ? 'absolute -bottom-0.5 -right-0.5' 
        : size === 'lg'
        ? 'absolute -bottom-1 -right-1'
        : 'absolute -bottom-1 -right-1';
    }
    return 'relative';
  };

  if (showText) {
    return (
      <div className={cn(
        'flex items-center gap-2',
        position === 'relative' && 'relative',
        className,
      )}>
        <div className="relative">
          <div
            className={cn(
              sizeClasses.dot,
              'rounded-full border-2 border-background',
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            )}
          />
          {isOnline && showPulse && (
            <div
              className={cn(
                sizeClasses.pulse,
                'absolute top-0 left-0 rounded-full bg-green-500 animate-ping opacity-75'
              )}
            />
          )}
        </div>
        <span className={cn(
          sizeClasses.text,
          'font-medium',
          isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        )}>
          {isOnline ? onlineText : offlineText}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      getPositionClasses(),
      className,
    )}>
      <div
        className={cn(
          sizeClasses.dot,
          'rounded-full border-2 border-background',
          isOnline ? 'bg-green-500' : 'bg-gray-400',
          'transition-colors duration-200'
        )}
        title={isOnline ? onlineText : offlineText}
      />
      {isOnline && showPulse && (
        <div
          className={cn(
            sizeClasses.pulse,
            'absolute top-0 left-0 rounded-full bg-green-500 animate-ping opacity-75'
          )}
        />
      )}
    </div>
  );
};

// Avatar와 함께 사용하기 위한 래퍼 컴포넌트
interface AvatarWithOnlineStatusProps {
  children: React.ReactNode;
  isOnline: boolean;
  onlineStatusSize?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const AvatarWithOnlineStatus: React.FC<AvatarWithOnlineStatusProps> = ({
  children,
  isOnline,
  onlineStatusSize = 'md',
  showPulse = true,
  className,
}) => {
  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      <OnlineStatus
        isOnline={isOnline}
        size={onlineStatusSize}
        showPulse={showPulse}
        position="absolute"
      />
    </div>
  );
};

// 온라인 사용자 수를 표시하는 컴포넌트
interface OnlineCountProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const OnlineCount: React.FC<OnlineCountProps> = ({
  count,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-xs',
          dot: 'w-2 h-2',
        };
      case 'lg':
        return {
          text: 'text-base',
          dot: 'w-4 h-4',
        };
      default:
        return {
          text: 'text-sm',
          dot: 'w-3 h-3',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn(
      'flex items-center gap-2 text-muted-foreground',
      className,
    )}>
      {showIcon && (
        <div className="relative">
          <div
            className={cn(
              sizeClasses.dot,
              'rounded-full bg-green-500'
            )}
          />
          <div
            className={cn(
              sizeClasses.dot,
              'absolute top-0 left-0 rounded-full bg-green-500 animate-ping opacity-75'
            )}
          />
        </div>
      )}
      <span className={cn(sizeClasses.text, 'font-medium')}>
        {count}명 온라인
      </span>
    </div>
  );
};

export default OnlineStatus;