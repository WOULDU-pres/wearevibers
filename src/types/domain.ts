import { z } from "zod";

// Project related types
export interface Project {
  id: string;
  title: string;
  description: string;
  image_urls: string[];
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  vibe_count: number;
  is_featured: boolean;
  status: ProjectStatus;
}

export type ProjectStatus = "draft" | "published" | "archived";

// Post creation and forms (WeAreVibers specific)
export const postSchema = z.object({
  title: z.string()
    .min(3, '제목은 최소 3글자 이상이어야 합니다.')
    .max(200, '제목은 200글자를 초과할 수 없습니다.'),
  content: z.string()
    .min(10, '내용은 최소 10글자 이상이어야 합니다.')
    .max(5000, '내용은 5000글자를 초과할 수 없습니다.'),
  category: z.enum(['desk-setup', 'coding-playlist', 'ide-theme', 'free-talk'], {
    required_error: '카테고리를 선택해주세요.',
  }),
});

export type PostFormData = z.infer<typeof postSchema>;

export interface PostCreateFormProps {
  onSubmit: (data: PostFormData & { image_urls: string[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<PostFormData>;
}

// Comment system
export interface Comment {
  id: string;
  content: string;
  content_id: string;
  content_type: string;
  user_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  vibe_count: number;
  profile?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

// Reporting and moderation
export type ReportReason = 
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "copyright_violation"
  | "misinformation"
  | "other";

export interface ReportSubmission {
  content_id: string;
  content_type: "project" | "comment" | "profile";
  reason: ReportReason;
  details?: string;
}

// Search and filtering
export interface SearchFilters {
  query?: string;
  category?: string;
  tech_stack?: string[];
  sort_by?: "created_at" | "vibe_count" | "title";
  sort_order?: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export type NotificationType = 
  | "comment"
  | "vibe"
  | "follow"
  | "project_featured"
  | "system";

// Analytics and metrics
export interface UserStats {
  projectCount: number;
  totalVibes: number;
  followerCount: number;
  followingCount: number;
  joinDate: string;
}

export interface ProjectMetrics {
  views: number;
  vibes: number;
  comments: number;
  shares: number;
}

// Tech stack and categories
export interface TechStackItem {
  name: string;
  category: string;
  color?: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  project_count: number;
}

// Upload and media
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface ImageUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}