import type { Tables } from "@/lib/supabase-types";

// 기본 포스트 타입 (DB에서 바로 가져온 것)
export type Post = Tables<"posts">;
export type Profile = Tables<"profiles">;

// 프로필 정보가 포함된 포스트 타입
export interface PostWithProfile extends Post {
  profiles: Profile;
}

// 포스트 폼 데이터
export interface PostFormData {
  title: string;
  content: string;
  category: string;
  image_urls?: string[];
}

// 포스트 작성 요청 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  image_urls?: string[];
}

// 포스트 수정 요청 타입
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  category?: string;
  image_urls?: string[];
}

// 포스트 쿼리 옵션
export interface PostQueryOptions {
  category?: string;
  userId?: string;
  sortBy?: "newest" | "oldest" | "popular" | "most_commented";
  limit?: number;
  offset?: number;
}

// 포스트 통계
export interface PostStats {
  totalCount: number;
  vibeCount: number;
  commentCount: number;
}

// 실시간 포스트 이벤트 타입
export interface PostRealtimeEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  post: PostWithProfile;
}

// 포스트 페이지네이션
export interface PostPagination {
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}

// 포스트 권한 체크
export interface PostPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canVibe: boolean;
  canComment: boolean;
}

// 포스트 검증 옵션
export interface PostValidationOptions {
  titleMinLength: number;
  titleMaxLength: number;
  contentMinLength: number;
  contentMaxLength: number;
  allowMarkdown: boolean;
  maxImageCount: number;
  requiredFields: (keyof PostFormData)[];
}

// 기본 포스트 검증 설정
export const DEFAULT_POST_VALIDATION: PostValidationOptions = {
  titleMinLength: 3,
  titleMaxLength: 200,
  contentMinLength: 10,
  contentMaxLength: 10000,
  allowMarkdown: true,
  maxImageCount: 10,
  requiredFields: ["title", "content", "category"],
};

// 포스트 정렬 옵션
export const POST_SORT_OPTIONS = {
  newest: { field: "created_at", order: "desc" },
  oldest: { field: "created_at", order: "asc" },
  popular: { field: "vibe_count", order: "desc" },
  most_commented: { field: "comment_count", order: "desc" },
} as const;

// 포스트 카테고리 옵션
export const POST_CATEGORIES = [
  "general",
  "tutorial",
  "discussion",
  "showcase",
  "question",
  "announcement",
  "feedback",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

// 포스트 상태 타입
export type PostStatus = "loading" | "success" | "error" | "optimistic";

// 포스트 액션 타입 (Reducer용)
export type PostAction =
  | { type: "SET_POSTS"; posts: PostWithProfile[] }
  | { type: "ADD_POST"; post: PostWithProfile }
  | { type: "UPDATE_POST"; postId: string; updates: Partial<Post> }
  | { type: "DELETE_POST"; postId: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_OPTIMISTIC_POST"; post: PostWithProfile };

// 포스트 편집 모드
export type PostEditMode = "inline" | "modal" | "page";

// 포스트 삭제 모드
export type PostDeleteMode = "soft" | "hard";

// 포스트 편집 상태
export interface PostEditState {
  isEditing: boolean;
  editMode: PostEditMode;
  originalPost?: Post;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

// 포스트 삭제 확인 옵션
export interface PostDeleteConfirmation {
  showConfirmDialog: boolean;
  deleteMode: PostDeleteMode;
  cascadeComments: boolean;
  reason?: string;
}