// useNotifications.tsx - 알림 시스템 React Hook
// EPIC-03: 기본 알림 시스템 - STORY-011

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { 
  Notification, 
  NotificationListResponse, 
  UnreadCountResponse,
  GetNotificationsParams,
  MarkAsReadParams 
} from '@/types/notification';

// ============================================================================
// 알림 조회 함수들
// ============================================================================

/**
 * 사용자의 알림 목록을 조회합니다
 */
export const fetchNotifications = async (params: GetNotificationsParams = {}): Promise<NotificationListResponse> => {
  const { user_id, is_read, type, limit = 20, offset = 0 } = params;
  
  try {
    let query = supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        actor_id,
        type,
        content_id,
        content_type,
        message,
        is_read,
        created_at,
        actor:profiles!actor_id (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (user_id) query = query.eq('user_id', user_id);
    if (is_read !== undefined) query = query.eq('is_read', is_read);
    if (type) query = query.eq('type', type);

    const { data, error, count } = await query;

    if (error) {
      console.error('알림 조회 에러:', error);
      throw error;
    }

    // 읽지 않은 알림 개수 별도 조회
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id || '')
      .eq('is_read', false);

    if (countError) {
      console.error('읽지 않은 알림 개수 조회 에러:', countError);
    }

    return {
      notifications: data || [],
      total_count: count || 0,
      unread_count: unreadCount || 0
    };
  } catch (error) {
    console.error('fetchNotifications 에러:', error);
    throw error;
  }
};

/**
 * 읽지 않은 알림 개수를 조회합니다
 */
export const fetchUnreadCount = async (user_id: string): Promise<UnreadCountResponse> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('is_read', false);

    if (error) {
      console.error('읽지 않은 알림 개수 조회 에러:', error);
      throw error;
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('fetchUnreadCount 에러:', error);
    throw error;
  }
};

/**
 * 알림을 읽음으로 표시합니다
 */
export const markNotificationAsRead = async (params: MarkAsReadParams): Promise<void> => {
  const { notification_id, is_read } = params;
  
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read })
      .eq('id', notification_id);

    if (error) {
      console.error('알림 읽음 상태 업데이트 에러:', error);
      throw error;
    }
  } catch (error) {
    console.error('markNotificationAsRead 에러:', error);
    throw error;
  }
};

/**
 * 모든 알림을 읽음으로 표시합니다
 */
export const markAllNotificationsAsRead = async (user_id: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('mark_all_notifications_read', {
      target_user_id: user_id
    });

    if (error) {
      console.error('모든 알림 읽음 표시 에러:', error);
      throw error;
    }
  } catch (error) {
    console.error('markAllNotificationsAsRead 에러:', error);
    throw error;
  }
};

// ============================================================================
// React Hooks
// ============================================================================

/**
 * 알림 목록을 조회하는 Hook
 */
export const useNotifications = (params: GetNotificationsParams = {}) => {
  const { user } = useAuthStore();
  
  const queryParams = {
    ...params,
    user_id: user?.id || params.user_id
  };

  return useQuery({
    queryKey: ['notifications', queryParams],
    queryFn: () => fetchNotifications(queryParams),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 30, // 30초마다 폴링
    refetchIntervalInBackground: false, // 백그라운드에서는 폴링 안함
  });
};

/**
 * 읽지 않은 알림 개수를 조회하는 Hook
 */
export const useUnreadCount = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: () => fetchUnreadCount(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30초
    refetchInterval: 1000 * 30, // 30초마다 폴링
    refetchIntervalInBackground: false,
  });
};

/**
 * 알림 읽음 상태를 변경하는 Hook
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // 알림 목록과 읽지 않은 개수 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('알림을 읽음으로 표시했습니다.');
    },
    onError: (error) => {
      console.error('알림 읽음 표시 에러:', error);
      toast.error('알림 상태 변경에 실패했습니다.');
    }
  });
};

/**
 * 모든 알림을 읽음으로 표시하는 Hook
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(user!.id),
    onSuccess: () => {
      // 알림 관련 모든 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('모든 알림을 읽음으로 표시했습니다.');
    },
    onError: (error) => {
      console.error('모든 알림 읽음 표시 에러:', error);
      toast.error('알림 상태 변경에 실패했습니다.');
    }
  });
};

// ============================================================================
// 실시간 알림 관리 Hook
// ============================================================================

/**
 * 실시간 알림 구독을 위한 Hook (향후 확장용)
 */
export const useNotificationSubscription = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 향후 Supabase Realtime 구독 로직 추가 예정
  // 현재는 폴링 방식 사용

  return {
    isSubscribed: false,
    subscribe: () => {
      // TODO: Supabase Realtime 구독 구현
      console.warn('실시간 알림 구독 시작 (향후 구현 예정)');
    },
    unsubscribe: () => {
      // TODO: Supabase Realtime 구독 해제 구현
      console.warn('실시간 알림 구독 해제 (향후 구현 예정)');
    }
  };
};

// ============================================================================
// 알림 유틸리티 함수들
// ============================================================================

/**
 * 알림 타입에 따른 아이콘을 반환합니다
 */
export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'comment':
      return '💬';
    case 'vibe':
      return '✨';
    case 'follow':
      return '👤';
    case 'post':
      return '📝';
    case 'tip':
      return '💡';
    default:
      return '🔔';
  }
};

/**
 * 알림 생성 시간을 상대적으로 표시합니다
 */
export const getRelativeTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return created.toLocaleDateString('ko-KR');
};

/**
 * 알림 콘텐츠 링크를 생성합니다
 */
export const getNotificationLink = (notification: Notification): string => {
  const { type, content_id, content_type, actor_id } = notification;

  switch (type) {
    case 'comment':
    case 'vibe':
      if (content_type === 'post') return `/post/${content_id}`;
      if (content_type === 'tip') return `/tip/${content_id}`;
      return '/lounge';
    
    case 'follow':
      return `/profile/${actor_id}`;
    
    case 'post':
      return `/post/${content_id}`;
    
    case 'tip':
      return `/tip/${content_id}`;
    
    default:
      return '/';
  }
};