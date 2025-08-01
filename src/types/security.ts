// security.ts - 보안 시스템 타입 정의
// EPIC-04: 보안 및 안정성 - STORY-015

export type ReportReason = 
  | 'spam'                    // 스팸/도배
  | 'harassment'              // 괴롭힘/욕설
  | 'hate_speech'             // 혐오 발언
  | 'inappropriate_content'   // 부적절한 콘텐츠
  | 'copyright_violation'     // 저작권 침해
  | 'misinformation'          // 잘못된 정보
  | 'other';                  // 기타

export type ReportStatus = 
  | 'pending'    // 대기중
  | 'reviewing'  // 검토중  
  | 'resolved'   // 해결됨
  | 'dismissed'; // 기각됨

export type ReportableContentType = 'post' | 'tip' | 'comment' | 'profile';

export interface Report {
  id: string;
  reporter_id: string;
  reported_content_id: string;
  content_type: ReportableContentType;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  // 조인된 데이터
  reporter?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  resolver?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
  // 조인된 데이터
  blocked_user?: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
}

export type SecurityEventType = 
  | 'report_created'
  | 'report_processed'
  | 'user_blocked'
  | 'user_unblocked'
  | 'suspicious_activity'
  | 'login_attempt'
  | 'password_change'
  | 'account_deletion';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityLog {
  id: string;
  user_id: string | null;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// API 요청 타입들
export interface CreateReportParams {
  reported_content_id: string;
  content_type: ReportableContentType;
  reason: ReportReason;
  description?: string;
}

export interface ProcessReportParams {
  report_id: string;
  new_status: ReportStatus;
  resolution_note?: string;
}

export interface BlockUserParams {
  blocked_user_id: string;
  reason?: string;
}

export interface UnblockUserParams {
  blocked_user_id: string;
}

// API 응답 타입들
export interface ReportListResponse {
  reports: Report[];
  total_count: number;
}

export interface BlockListResponse {
  blocks: UserBlock[];
  total_count: number;
}

export interface ReportStatsResponse {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  dismissed_reports: number;
}

// 컴포넌트 Props 타입들
export interface ReportDialogProps {
  contentId: string;
  contentType: ReportableContentType;
  onSubmit: (params: CreateReportParams) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface ReportButtonProps {
  contentId: string;
  contentType: ReportableContentType;
  className?: string;
}

export interface BlockButtonProps {
  userId: string;
  username: string;
  isBlocked?: boolean;
  onBlock?: () => void;
  onUnblock?: () => void;
  className?: string;
}

// 유틸리티 타입들
export interface ReportReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

export interface SecurityMetrics {
  daily_reports: number;
  weekly_reports: number;
  monthly_reports: number;
  spam_detection_rate: number;
  average_resolution_time: number; // hours
  block_effectiveness: number; // percentage
}