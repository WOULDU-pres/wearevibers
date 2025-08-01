// notification.ts - 알림 시스템 타입 정의
// EPIC-03: 기본 알림 시스템 - STORY-010

export type NotificationType = 
  | 'comment'      // 내 포스트/댓글에 댓글
  | 'vibe'         // 내 포스트/댓글에 바이브
  | 'follow'       // 새로운 팔로워
  | 'post'         // 팔로우하는 사용자의 새 포스트
  | 'tip';         // 팔로우하는 사용자의 새 팁

export type ContentType = 'post' | 'tip' | 'comment' | 'project';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  content_id: string | null;
  content_type: ContentType | null;
  message: string;
  is_read: boolean;
  created_at: string;
  // 조인된 데이터
  actor?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface NotificationSettings {
  user_id: string;
  comment_notifications: boolean;
  vibe_notifications: boolean;
  follow_notifications: boolean;
  post_notifications: boolean;
  tip_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export interface NotificationListResponse {
  notifications: Notification[];
  total_count: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

// 알림 생성 시 사용하는 파라미터
export interface CreateNotificationParams {
  user_id: string;
  actor_id?: string;
  type: NotificationType;
  content_id?: string;
  content_type?: ContentType;
  message: string;
}

// 알림 읽음 처리 파라미터
export interface MarkAsReadParams {
  notification_id: string;
  is_read: boolean;
}

// 알림 목록 조회 파라미터
export interface GetNotificationsParams {
  user_id?: string;
  is_read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
}