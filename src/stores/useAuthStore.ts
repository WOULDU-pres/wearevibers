import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { User, Session, AuthError } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { captureError, addBreadcrumb, setSentryUser, clearSentryUser } from '@/lib/sentry';

type Profile = Tables<'profiles'>;

export interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string, 
    password: string, 
    userData: {
      username: string;
      fullName: string;
    }
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google') => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        user: null,
        profile: null,
        session: null,
        loading: true,
        initialized: false,
        
        // Internal actions
        setUser: (user: User | null) =>
          set({ user }, false, 'setUser'),
        
        setProfile: (profile: Profile | null) =>
          set({ profile }, false, 'setProfile'),
        
        setSession: (session: Session | null) =>
          set({ session }, false, 'setSession'),
        
        setLoading: (loading: boolean) =>
          set({ loading }, false, 'setLoading'),
        
        setInitialized: (initialized: boolean) =>
          set({ initialized }, false, 'setInitialized'),
        
        cleanup: () => {
          set({
            user: null,
            profile: null,
            session: null,
          }, false, 'cleanup');
          clearSentryUser();
        },
        
        fetchProfile: async (userId: string) => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (error) {
              if (error.code === 'PGRST116') {
                // 프로필이 존재하지 않는 경우 (새 사용자)
                get().setProfile(null);
                return;
              }
              
              // 인증 관련 에러인 경우 세션 정리
              if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('expired')) {
                console.error('Auth error in fetchProfile, signing out:', error);
                await supabase.auth.signOut();
                return;
              }
              
              console.error('Error fetching profile:', error);
              return;
            }

            if (data) {
              get().setProfile(data);
            }
          } catch (error) {
            console.error('Error in fetchProfile:', error);
            
            // 네트워크 에러나 기타 예외 시에도 세션 상태 확인
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              console.log('No valid session found, cleaning up state');
              get().cleanup();
            }
          }
        },
        
        initialize: async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session:', error);
              
              // Sentry로 에러 리포팅
              captureError(new Error(`Session retrieval failed: ${error.message}`), {
                authContext: 'getInitialSession',
                errorCode: error.status,
                errorMessage: error.message,
              });
              
              get().cleanup();
            } else {
              get().setSession(session);
              get().setUser(session?.user ?? null);
              
              if (session?.user) {
                await get().fetchProfile(session.user.id);
                
                // 로그인 성공 시 Sentry 사용자 정보 설정
                setSentryUser({
                  id: session.user.id,
                  email: session.user.email,
                });
                
                addBreadcrumb(
                  `User session restored: ${session.user.email}`,
                  'auth',
                  'info'
                );
              }
            }
          } catch (error) {
            console.error('Error in initialize:', error);
            
            // Sentry로 예외 리포팅
            captureError(error as Error, {
              authContext: 'initialize_exception',
              url: window.location.href,
            });
            
            get().cleanup();
          } finally {
            get().setLoading(false);
            get().setInitialized(true);
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
                authContext: 'signIn',
                email: email,
                errorCode: error.status,
                errorMessage: error.message,
              });
            } else {
              addBreadcrumb(
                `User signed in: ${email}`,
                'auth',
                'info'
              );
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            captureError(error as Error, {
              authContext: 'signIn_exception',
              email: email,
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
                authContext: 'signUp',
                email: email,
                username: userData.username,
                errorCode: error.status,
                errorMessage: error.message,
              });
            } else {
              addBreadcrumb(
                `User signed up: ${email}`,
                'auth',
                'info'
              );
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            captureError(error as Error, {
              authContext: 'signUp_exception',
              email: email,
              username: userData.username,
            });
            return { error: error as AuthError };
          }
        },
        
        signOut: async () => {
          get().setLoading(true);
          
          try {
            const { error } = await supabase.auth.signOut();
            
            if (!error) {
              addBreadcrumb(
                'User signed out manually',
                'auth',
                'info'
              );
              
              get().cleanup();
            } else {
              captureError(new Error(`Sign out failed: ${error.message}`), {
                authContext: 'signOut',
                errorCode: error.status,
                errorMessage: error.message,
              });
            }
            
            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            captureError(error as Error, {
              authContext: 'signOut_exception',
            });
            return { error: error as AuthError };
          }
        },
        
        signInWithOAuth: async (provider: 'google') => {
          const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
          
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
            return { error: new Error('User not authenticated') as AuthError };
          }

          get().setLoading(true);

          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (!error) {
            // 프로필 다시 가져오기
            await get().fetchProfile(user.id);
          }

          get().setLoading(false);
          return { error };
        },
      })
    ),
    {
      name: 'auth-store',
    }
  )
);