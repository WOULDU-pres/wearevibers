import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'wearevibers-auth-token',
    flowType: 'pkce',
    // 세션 갱신 설정 개선
    refreshInterval: 60 * 15, // 15분마다 갱신
  },
  global: {
    headers: {
      "X-Client-Info": "wearevibers-web",
      "X-Client-Version": "1.0.0",
    },
  },
  // 데이터베이스 연결 설정 개선
  db: {
    schema: 'public',
  },
  // 연결 설정
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// 타입 안전성을 위한 헬퍼 타입들
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
