import type { Tables } from "@/lib/supabase-types";

// 기본 댓글 타입 (DB에서 바로 가져온 것)
export type Comment = Tables<"comments">;
export type Profile = Tables<"profiles">;

// 프로필 정보가 포함된 댓글 타입
export interface CommentWithProfile extends Comment {
  profiles: Profile;
  replies?: CommentWithProfile[];
  depth?: number;
}

// 댓글 콘텐츠 타입 정의
export type CommentContentType = "project" | "tip" | "post";

// 댓글 폼 데이터
export interface CommentFormData {
  content: string;
  contentId: string;
  contentType: CommentContentType;
  parentId?: string;
}

// 댓글 작성/수정 요청 타입
export interface CreateCommentRequest {
  content: string;
  content_id: string;
  content_type: CommentContentType;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// 댓글 트리 구조를 위한 헬퍼 타입
export interface CommentTree extends CommentWithProfile {
  children: CommentTree[];
  level: number;
}

// 댓글 쿼리 옵션
export interface CommentQueryOptions {
  contentId: string;
  contentType: CommentContentType;
  sortBy?: "newest" | "oldest" | "popular";
  limit?: number;
  parentId?: string;
}

// 댓글 통계
export interface CommentStats {
  totalCount: number;
  replyCount: number;
  maxDepth: number;
}

// 실시간 댓글 이벤트 타입
export interface CommentRealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  comment: CommentWithProfile;
  contentId: string;
  contentType: CommentContentType;
}

// 댓글 페이지네이션
export interface CommentPagination {
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}

// 댓글 권한 체크
export interface CommentPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
}

// 댓글 검증 옵션
export interface CommentValidationOptions {
  minLength: number;
  maxLength: number;
  allowMarkdown: boolean;
  allowEmojis: boolean;
  maxDepth: number;
}

// 기본 댓글 검증 설정
export const DEFAULT_COMMENT_VALIDATION: CommentValidationOptions = {
  minLength: 1,
  maxLength: 2000,
  allowMarkdown: true,
  allowEmojis: true,
  maxDepth: 3,
};

// 댓글 정렬 옵션
export const COMMENT_SORT_OPTIONS = {
  newest: { field: "created_at", order: "desc" },
  oldest: { field: "created_at", order: "asc" },
  popular: { field: "vibe_count", order: "desc" },
} as const;

// 댓글 상태 타입
export type CommentStatus = "loading" | "success" | "error" | "optimistic";

// 댓글 액션 타입 (Reducer용)
export type CommentAction =
  | { type: "SET_COMMENTS"; comments: CommentWithProfile[] }
  | { type: "ADD_COMMENT"; comment: CommentWithProfile }
  | { type: "UPDATE_COMMENT"; commentId: string; updates: Partial<Comment> }
  | { type: "DELETE_COMMENT"; commentId: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "TOGGLE_REPLY_FORM"; commentId: string }
  | { type: "SET_OPTIMISTIC_COMMENT"; comment: CommentWithProfile };