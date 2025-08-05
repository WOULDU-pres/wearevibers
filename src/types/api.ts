// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// HTTP methods and options
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

// Supabase specific types  
export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
  status: number;
  statusText: string;
}

// Real-time subscription types
export interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: T;
  old?: T;
}

export interface SubscriptionOptions {
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  schema?: string;
  table?: string;
  filter?: string;
}

// Auth related API types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  username: string;
  full_name?: string;
}

export interface AuthResponse {
  user: unknown;
  session: unknown;
  error?: SupabaseError;
}

// File upload API types
export interface FileUploadResponse {
  url: string;
  path: string;
  fullPath: string;
}

export interface BulkUploadResponse {
  successful: FileUploadResponse[];
  failed: Array<{
    file: string;
    error: string;
  }>;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Webhook types
export interface WebhookPayload<T = unknown> {
  event: string;
  data: T;
  timestamp: string;
  signature?: string;
}

// Cache types
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidateOnStale?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}