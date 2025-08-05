import { create } from "zustand";
import { devtools, subscribeWithSelector, persist } from "zustand/middleware";
import { Session, AuthError, User } from "@supabase/supabase-js";
import type { Tables } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { safeGetProfile, executeWithRLSTimeout } from "@/lib/rlsHelper";

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
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      subscribeWithSelector((set, get) => ({
        // Initial state
        user: null,
        profile: null,
        session: null,
        loading: true,
        initialized: false,

        // Internal actions
        setUser: (user: User | null) => set({ user }, false, "setUser"),

        setProfile: (profile: Profile | null) =>
          set({ profile, loading: false }, false, "setProfile"),

        setSession: (session: Session | null) =>
          set({ session }, false, "setSession"),

        setLoading: (loading: boolean) => set({ loading }, false, "setLoading"),

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
        },

        fetchProfile: async (userId: string) => {
          try {
            console.warn('Fetching profile for user:', userId);
            
            const { data, error } = await safeGetProfile(userId);
            
            if (error) {
              console.error('Error fetching profile:', error);
              return;
            }

            if (data) {
              get().setProfile(data);
              console.warn('Profile loaded successfully');
            }
          } catch (error) {
            console.error('Exception in fetchProfile:', error);
          }
        },

        initialize: async () => {
          console.warn('Initializing auth...');
          
          try {
            get().setLoading(true);
            
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
              console.error("Error getting session:", error);
              get().cleanup();
              get().setInitialized(true);
              get().setLoading(false);
              return;
            }

            if (session) {
              console.warn('Session found, restoring user state...');
              get().setSession(session);
              get().setUser(session.user);
              
              await get().fetchProfile(session.user.id);
              console.warn('User session restored successfully');
            } else {
              console.warn('No active session found');
              get().setLoading(false);
            }

            get().setInitialized(true);
          } catch (error) {
            console.error("Error in initialize:", error);
            get().cleanup();
            get().setInitialized(true);
            get().setLoading(false);
          }
        },

        signIn: async (email: string, password: string) => {
          try {
            get().setLoading(true);
            
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              console.error('Sign in failed:', error);
            } else {
              console.warn('User signed in successfully');
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            console.error('Exception in signIn:', error);
            return { error: error as AuthError };
          }
        },

        signUp: async (email: string, password: string, userData: { username: string; fullName: string }) => {
          try {
            get().setLoading(true);
            
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
              console.error('Sign up failed:', error);
            } else {
              console.warn('User signed up successfully');
            }

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            console.error('Exception in signUp:', error);
            return { error: error as AuthError };
          }
        },

        signOut: async () => {
          try {
            console.warn('Signing out user...');
            
            const { error } = await executeWithRLSTimeout(
              supabase.auth.signOut(),
              3000,
              'SignOut timeout'
            );

            console.warn('Cleaning up local state...');
            get().cleanup();

            if (!error) {
              console.warn('SignOut successful');
            } else {
              console.warn('SignOut API failed, but local state cleared:', error);
            }

            return { error };
          } catch (error) {
            console.warn('SignOut exception, but local state cleared:', error);
            return { error: error as AuthError };
          }
        },

        signInWithOAuth: async (provider: "google") => {
          try {
            get().setLoading(true);
            
            const { error } = await supabase.auth.signInWithOAuth({
              provider,
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });

            get().setLoading(false);
            return { error };
          } catch (error) {
            get().setLoading(false);
            console.error('OAuth sign in exception:', error);
            return { error: error as AuthError };
          }
        },

        updateProfile: async (updates: Partial<Profile>) => {
          try {
            const currentProfile = get().profile;
            if (!currentProfile) {
              return { error: new Error('No profile to update') as AuthError };
            }

            const { error } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', currentProfile.id);

            if (error) {
              console.error('Profile update failed:', error);
              return { error: error as AuthError };
            }

            get().setProfile({ ...currentProfile, ...updates });
            console.warn('Profile updated successfully');
            return { error: null };
          } catch (error) {
            console.error('Profile update exception:', error);
            return { error: error as AuthError };
          }
        },
      })),
      {
        name: "auth-store",
      }
    ),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    }
  )
);