import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // 세션 조회 실패 시 상태 정리
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        // 예외 발생 시 상태 정리
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // 세션 만료 또는 로그아웃 처리
        if (event === 'SIGNED_OUT' || !session) {
          console.log('Session expired or user signed out, cleaning up state');
          setSession(null);
          setUser(null);
          setProfile(null);
          
          // 로그인이 필요한 페이지에서 만료 시 홈으로 리다이렉트
          const currentPath = window.location.pathname;
          const publicPaths = ['/', '/login', '/signup'];
          
          if (!publicPaths.includes(currentPath)) {
            console.log('Redirecting to home due to session expiry');
            window.location.href = '/';
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        } else {
          // 일반적인 세션 업데이트
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필이 존재하지 않는 경우 (새 사용자)
          setProfile(null);
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
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      // 네트워크 에러나 기타 예외 시에도 세션 상태 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No valid session found, cleaning up state');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { username: string; fullName: string }
  ) => {
    setLoading(true);

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

    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    
    setLoading(false);
    return { error };
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectUrl}/`,
      },
    });

    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('User not authenticated') as AuthError };
    }

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      // 프로필 다시 가져오기
      await fetchProfile(user.id);
    }

    setLoading(false);
    return { error };
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};