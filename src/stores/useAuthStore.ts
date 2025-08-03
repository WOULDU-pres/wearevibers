import { create } from "zustand";
import { devtools, subscribeWithSelector, persist } from "zustand/middleware";
import { Session, AuthError } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import {
  captureError,
  addBreadcrumb,
  setSentryUser,
  clearSentryUser,
} from "@/lib/sentry";
import { safeGetProfile, handleRLSError, executeWithRLSTimeout } from "@/lib/rlsHelper";

type Profile = Tables<"profiles">;

export interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    userData: {
      username: string;
      fullName: string;
    }
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: "google") => Promise<{ error: AuthError | null }>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: AuthError | null }>;

  // Internal actions
  setUser: (user: User | null) => void;
  _setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  _setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      subscribeWithSelector((set, _get) => ({
        // Initial state
        user: null,
        profile: null,
        session: null,
        loading: true,
        initialized: false,

        // Internal actions
        setUser: (user: User | null) => set({ user }, false, "setUser"),

        _setProfile: (profile: Profile | null) =>
          set({ profile, loading: false }, false, "setProfile"),

        setSession: (session: Session | null) =>
          set({ session }, false, "setSession"),

        _setLoading: (loading: boolean) => set({ loading }, false, "setLoading"),

        setInitialized: (initialized: boolean) =>
          set({ initialized }, false, "setInitialized"),

        cleanup: () => {
          set(
            {
              user: null,
              profile: null,
              session: null,
            },
            false,
            "cleanup"
          );
          clearSentryUser();
        },

        fetchProfile: async (userId: string) => {
          try {
            console.warn('🔍 AuthStore fetchProfile for user:', userId);
            
            // Use safe profile fetcher with built-in RLS handling
            const { data, error, isTimeout } = await safeGetProfile(userId);
            
            console.warn('📊 SafeGetProfile _result:', { 
              hasData: !!data, 
              hasError: !!error, 
              isTimeout,
              username: data?.username 
            });

            if (error) {
              const { isRLSIssue, shouldFallback, userMessage } = handleRLSError(error);
              
              if (isRLSIssue) {
                if (shouldFallback) {
                  console.warn('🚨 RLS issue detected - using fallback behavior');
                  get().setProfile(null);
                  return;
                }
                
                // 인증 관련 RLS 에러 - 세션 정리
                console.error('🔐 Authentication RLS error, signing out:', error);
                await supabase.auth.signOut();
                return;
              }
              
              // 다른 에러들 처리
              if (error.message?.includes('세션이 유효하지 않습니다')) {
                console.warn('⚠️ Invalid session - cleaning up state');
                get().cleanup();
                return;
              }

              console.error('❌ Profile fetch error:', error);
              get().setProfile(null);
              return;
            }

            if (data) {
              if (isTimeout) {
                console.warn('⏰ Using fallback profile data due to RLS timeout');
              } else {
                console.warn('✅ AuthStore profile fetch successful');
              }
              get().setProfile(data);
            } else {
              console.warn('ℹ️ No profile found - new user or profile not created yet');
              get().setProfile(null);
            }
          } catch (error) {
            console.error('💥 Unexpected error in fetchProfile:', error);

            // 세션 상태 확인
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) {
                console.warn("No valid session found, cleaning up state");
                get().cleanup();
              } else {
                // 세션은 있지만 프로필 조회 실패 - null로 설정하여 앱 동작 유지
                get().setProfile(null);
              }
            } catch (sessionError) {
              console.error('Error checking session:', sessionError);
              get().cleanup();
            }
          }
        },

        initialize: async () => {
          console.warn('🚀 Starting auth initialization...');
          
          try {
            // 먼저 RLS 상태 체크
            const { debugRLSIssues } = await import('@/lib/rlsDebugger');
            console.warn('🔍 Running initial RLS diagnostics...');
            
            const rlsStatus = await debugRLSIssues();
            console.warn('📊 RLS Status:', {
              sessionValid: rlsStatus.sessionStatus.tokenValid,
              profileAccess: rlsStatus.databaseAccess.canAccessProfiles
            });
            
            // 세션 조회
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            if (error) {
              console.error("❌ Error getting session:", error);

              // Sentry로 에러 리포팅
              captureError(
                new Error(`Session retrieval failed: ${error.message}`),
                {
                  authContext: "getInitialSession",
                  errorCode: error.status,
                  errorMessage: error.message,
                }
              );

              get().cleanup();
            } else {
              console.warn('📋 Session found:', {
                hasSession: !!session,
                userId: session?.user?.id,
                email: session?.user?.email
              });
              
              get().setSession(session);
              get().setUser(session?.user ?? null);

              if (session?.user) {
                // 프로필 조회 시 더 짧은 타임아웃 사용
                console.warn('👤 Fetching user profile...');
                await get().fetchProfile(session.user.id);

                // 로그인 성공 시 Sentry 사용자 정보 설정
                setSentryUser({
                  id: session.user.id,
                  email: session.user.email,
                });

                addBreadcrumb(
                  `User session restored: ${session.user.email}`,
                  "auth",
                  "info"
                );
                
                console.warn('✅ Auth initialization completed successfully');
              } else {
                console.warn('🚪 No active session - user needs to sign in');
              }
            }
          } catch (error) {
            console.error("💥 Error in initialize:", error);

            // Sentry로 예외 리포팅
            captureError(error as Error, {
              authContext: "initialize_exception",
              url: window.location.href,
            });

            get().cleanup();
          } finally {
            get().setLoading(false);
            get().setInitialized(true);
            console.warn('🏁 Auth initialization process completed');
          }
        },

        signIn: async (email: string, password: string) => {
          get().setLoading(true);

          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              // 로그인 실패 시 Sentry 리포팅
              captureError(new Error(`Sign in failed: ${error.message}`), {
                authContext: "signIn",
                email,
                errorCode: error.status,
                errorMessage: error.message,
              });
            } else {
              addBreadcrumb(`User signed in: ${email}`, "auth", "info");
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            captureError(error as Error, {
              authContext: "signIn_exception",
              email,
            });
            return { error: error as AuthError };
          }
        },

        signUp: async (
          email: string,
          password: string,
          userData: { username: string; fullName: string }
        ) => {
          get().setLoading(true);

          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  username: userData.username,
                  full_name: userData.fullName,
                },
              },
            });

            if (error) {
              // 회원가입 실패 시 Sentry 리포팅
              captureError(new Error(`Sign up failed: ${error.message}`), {
                authContext: "signUp",
                email,
                username: userData.username,
                errorCode: error.status,
                errorMessage: error.message,
              });
            } else {
              addBreadcrumb(`User signed up: ${email}`, "auth", "info");
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            captureError(error as Error, {
              authContext: "signUp_exception",
              email,
              username: userData.username,
            });
            return { error: error as AuthError };
          }
        },

        signOut: async () => {
          console.warn("🔄 SignOut function started, setting loading...");
          get().setLoading(true);

          try {
            console.warn("🌐 Calling supabase.auth.signOut()...");
            
            // Use RLS helper for safer signOut with shorter timeout
            const { error } = await executeWithRLSTimeout(
              supabase.auth.signOut(),
              1500, // 1.5 seconds for better UX
              null,
            );

            console.warn("📊 SignOut API response:", { error });

            // Always cleanup local state regardless of API response
            // This handles cases where the token is expired and signOut API fails
            console.warn("🧹 Cleaning up local state...");
            get().cleanup();

            if (!error) {
              console.warn("✅ SignOut successful");
              addBreadcrumb("User signed out manually", "auth", "info");
            } else {
              // Log the error but don't prevent logout
              console.warn(
                "⚠️ SignOut API failed, but local state cleared:",
                error,
              );
              
              // Only report non-timeout errors to Sentry
              if (!error.message?.includes('RLS_TIMEOUT')) {
                captureError(new Error(`Sign out failed: ${error.message}`), {
                  authContext: "signOut",
                  errorMessage: error.message,
                });
              }
            }

            console.warn("🏁 SignOut function completing, setting loading false");
            get().setLoading(false);
            // Always return success since we cleared local state
            return { error: null };
          } catch (error) {
            // Even if there's an exception, cleanup local state
            console.warn("💥 SignOut exception occurred:", error);
            console.warn("🧹 Exception cleanup - clearing local state...");
            get().cleanup();
            get().setLoading(false);

            console.warn("⚠️ SignOut exception, but local state cleared:", error);
            
            // Only report non-timeout errors to Sentry
            if (!(error instanceof Error) || !error.message?.includes('RLS_TIMEOUT')) {
              captureError(error as Error, {
                authContext: "signOut_exception",
              });
            }

            console.warn("🏁 SignOut function completing after exception");
            // Return success since we cleared local state
            return { error: null };
          }
        },

        signInWithOAuth: async (provider: "google") => {
          // 개발환경에서는 현재 origin을 사용, 프로덕션에서는 VITE_SITE_URL 사용
          const isDev = import.meta.env.DEV;
          const redirectUrl = isDev 
            ? window.location.origin 
            : (import.meta.env.VITE_SITE_URL || window.location.origin);

          console.warn('OAuth redirect URL:', redirectUrl);

          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${redirectUrl}/`,
            },
          });

          return { error };
        },

        updateProfile: async (updates: Partial<Profile>) => {
          const { user } = get();
          if (!user) {
            return { error: new Error("User not authenticated") as AuthError };
          }

          get().setLoading(true);

          const { error } = await supabase
            .from("profiles")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (!error) {
            // 프로필 다시 가져오기
            await get().fetchProfile(user.id);
          }

          get().setLoading(false);
          return { error };
        },
      })),
      {
        name: "auth-store-dev",
      }
    ),
    {
      name: "wearevibers-auth-store",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        initialized: state.initialized,
        loading: state.loading,
      }),
    }
  )
);
