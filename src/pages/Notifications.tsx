// Notifications.tsx - 알림 목록 페이지
// EPIC-03: 기본 알림 시스템 - STORY-012

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead,
  getNotificationIcon,
  getRelativeTime,
  getNotificationLink,
} from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string, isRead: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleToggleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead(notification.id, !notification.is_read);
  };

  return (
    <Card className={`
      hover:shadow-sm transition-all duration-200 border
      ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'hover:bg-muted/30'}
    `}>
      <CardContent className="p-4">
        <Link 
          to={getNotificationLink(notification)}
          className="block"
        >
          <div className="flex items-start gap-3">
            {/* Actor Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={notification.actor?.avatar_url || ''} 
                alt={notification.actor?.username || 'User'} 
              />
              <AvatarFallback className="text-sm">
                {notification.actor?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="text-base">
                        {getNotificationIcon(notification.type)}
                      </span>
                      {notification.type === 'comment' && '댓글'}
                      {notification.type === 'vibe' && '바이브'}
                      {notification.type === 'follow' && '팔로우'}
                      {notification.type === 'post' && '포스트'}
                      {notification.type === 'tip' && '팁'}
                    </span>
                    <span>•</span>
                    <span>{getRelativeTime(notification.created_at)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleToggleRead}>
                        <Check className="h-4 w-4 mr-2" />
                        {notification.is_read ? '읽지 않음으로 표시' : '읽음으로 표시'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

interface NotificationListProps {
  filter?: 'all' | 'unread' | NotificationType;
}

const NotificationList: React.FC<NotificationListProps> = ({ filter = 'all' }) => {
  const queryParams = filter === 'all' ? {} : 
                     filter === 'unread' ? { is_read: false } : 
                     { type: filter as NotificationType };

  const { data, isLoading, _error, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications({
    ...queryParams,
    limit: 20
  });

  const markAsReadMutation = useMarkAsRead();

  const notifications = data?.notifications || [];

  const handleMarkAsRead = (notificationId: string, isRead: boolean) => {
    markAsReadMutation.mutate({
      notification_id: notificationId,
      is_read: isRead
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            알림을 불러오는 중 오류가 발생했습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
          </p>
          <p className="text-xs text-muted-foreground">
            새로운 활동이 있으면 여기에 표시됩니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="group">
          <NotificationItem
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      ))}

      {hasNextPage && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? '로딩 중...' : '더 보기'}
          </Button>
        </div>
      )}
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: notificationsData } = useNotifications();
  const markAllAsReadMutation = useMarkAllAsRead();

  const unreadCount = notificationsData?.unread_count || 0;

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">알림</h1>
          <p className="text-muted-foreground">
            새로운 활동과 상호작용을 확인하세요
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            모두 읽음
            <Badge variant="secondary" className="ml-1">
              {unreadCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            전체
            {notificationsData?.total_count && (
              <Badge variant="secondary" className="ml-2">
                {notificationsData.total_count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            읽지 않음
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comment">댓글</TabsTrigger>
          <TabsTrigger value="vibe">바이브</TabsTrigger>
          <TabsTrigger value="follow">팔로우</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationList filter="all" />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationList filter="unread" />
        </TabsContent>

        <TabsContent value="comment" className="mt-6">
          <NotificationList filter="comment" />
        </TabsContent>

        <TabsContent value="vibe" className="mt-6">
          <NotificationList filter="vibe" />
        </TabsContent>

        <TabsContent value="follow" className="mt-6">
          <NotificationList filter="follow" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;