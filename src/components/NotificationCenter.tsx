// NotificationCenter.tsx - 헤더의 알림 드롭다운 컴포넌트
// EPIC-03: 기본 알림 시스템 - STORY-012

import React from 'react';

import { CheckMoreHorizontal as _CheckMoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as _DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead,
  getNotificationIcon,
  getRelativeTime,
  getNotificationLink,
} from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Link 
      to={getNotificationLink(notification)}
      onClick={handleClick}
      className="block"
    >
      <div className={`
        flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg
        ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
      `}>
        {/* Actor Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage 
            src={notification.actor?.avatar_url || ''} 
            alt={notification.actor?.username || 'User'} 
          />
          <AvatarFallback className="text-xs">
            {notification.actor?.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-foreground leading-relaxed">
              {notification.message}
            </p>
            <span className="text-lg flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(notification.created_at)}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const NotificationCenter: React.FC = () => {
  const { data: unreadData, isLoading: _unreadLoading } = useUnreadCount();
  const { data: notificationsData, isLoading: notificationsLoading, _error } = useNotifications({ 
    limit: 10 
  });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.notifications || [];

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({
      notification_id: notificationId,
      is_read: true
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  // 에러 상태
  if (error) {
    console.error('알림 조회 에러:', error);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            알림
          </DropdownMenuLabel>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs h-7 px-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              모두 읽음
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {notificationsLoading ? (
            // Loading Skeleton
            <div className="p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">알림이 없습니다</p>
              <p className="text-xs text-muted-foreground">
                새로운 활동이 있으면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            // Notifications
            <div className="p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to="/notifications">
                <Button variant="ghost" className="w-full text-sm">
                  모든 알림 보기
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;