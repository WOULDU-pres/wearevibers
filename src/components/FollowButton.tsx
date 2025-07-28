import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggle: (userId: string, isFollowing: boolean) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  followText?: string;
  followingText?: string;
  unfollowText?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  onToggle,
  size = 'md',
  variant = 'default',
  className,
  disabled = false,
  showIcon = true,
  followText = '팔로우',
  followingText = '팔로잉',
  unfollowText = '언팔로우',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      await onToggle(userId, isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-xs';
      case 'lg':
        return 'h-12 px-6 text-base';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

    if (isLoading) {
      return <Loader2 className={cn(iconSize, 'animate-spin')} />;
    }

    if (isFollowing) {
      return isHovered ? (
        <UserMinus className={iconSize} />
      ) : (
        <UserCheck className={iconSize} />
      );
    }

    return <UserPlus className={iconSize} />;
  };

  const getText = () => {
    if (isFollowing) {
      return isHovered ? unfollowText : followingText;
    }
    return followText;
  };

  const getVariant = () => {
    if (isFollowing) {
      return isHovered ? 'destructive' : 'secondary';
    }
    return variant;
  };

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || isLoading}
      variant={getVariant()}
      className={cn(
        getButtonSize(),
        'transition-all duration-200 ease-in-out',
        isFollowing && 'hover:bg-destructive hover:text-destructive-foreground',
        isFollowing && !isHovered && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        !isFollowing && variant === 'default' && 'bg-gradient-vibe hover:opacity-90 text-white border-0',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className={cn(
          'transition-all duration-200',
          isLoading && 'opacity-70'
        )}>
          {getText()}
        </span>
      </div>
    </Button>
  );
};

// 팔로우 버튼의 컴팩트 버전 (아이콘만)
export const FollowIconButton: React.FC<Omit<FollowButtonProps, 'followText' | 'followingText' | 'unfollowText'>> = ({
  userId,
  isFollowing,
  onToggle,
  size = 'md',
  variant = 'outline',
  className,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      await onToggle(userId, isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

    if (isLoading) {
      return <Loader2 className={cn(iconSize, 'animate-spin')} />;
    }

    if (isFollowing) {
      return isHovered ? (
        <UserMinus className={iconSize} />
      ) : (
        <UserCheck className={iconSize} />
      );
    }

    return <UserPlus className={iconSize} />;
  };

  const getVariant = () => {
    if (isFollowing) {
      return isHovered ? 'destructive' : 'secondary';
    }
    return variant;
  };

  const getTooltipText = () => {
    if (isFollowing) {
      return isHovered ? '언팔로우' : '팔로잉';
    }
    return '팔로우';
  };

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || isLoading}
      variant={getVariant()}
      size="icon"
      className={cn(
        getButtonSize(),
        'transition-all duration-200 ease-in-out',
        isFollowing && 'hover:bg-destructive hover:text-destructive-foreground',
        isFollowing && !isHovered && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        !isFollowing && variant === 'default' && 'bg-gradient-vibe hover:opacity-90 text-white border-0',
        className
      )}
      title={getTooltipText()}
    >
      {getIcon()}
    </Button>
  );
};

export default FollowButton;