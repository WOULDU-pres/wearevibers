import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { supabase } from '@/lib/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    initialize, 
    initialized, 
    setUser, 
    setProfile, 
    setSession, 
    setLoading,
    fetchProfile,
    cleanup 
  } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      // 초기화 실행
      initialize();
    }

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // 세션 만료 또는 로그아웃 처리
        if (event === 'SIGNED_OUT' || !session) {
          console.log('Session expired or user signed out, cleaning up state');
          
          cleanup();
          
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
  }, [initialized]);

  return <>{children}</>;
};