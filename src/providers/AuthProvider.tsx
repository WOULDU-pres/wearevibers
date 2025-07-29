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
    let isSubscribed = true;
    let authSubscription: any = null;

    const setupAuth = async () => {
      // 초기화가 아직 안 된 경우에만 실행
      if (!initialized) {
        await initialize();
      }

      // Auth 상태 변경 감지 설정 (구독이 아직 없는 경우에만)
      if (isSubscribed && !authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isSubscribed) return; // 구독이 취소된 경우 무시
            
            console.log('Auth state changed:', event, session?.user?.email);
            
            // INITIAL_SESSION 처리 - OAuth 콜백 후 중요한 이벤트
            if (event === 'INITIAL_SESSION') {
              if (session) {
                console.log('Initial session found, updating state');
                setSession(session);
                setUser(session.user);
                
                if (session.user) {
                  await fetchProfile(session.user.id);
                }
              } else {
                console.log('No initial session found');
              }
              return;
            }
            
            // 실제 로그아웃 이벤트만 처리
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, cleaning up state');
              
              cleanup();
              
              // 로그인이 필요한 페이지에서 로그아웃 시 홈으로 리다이렉트
              const currentPath = window.location.pathname;
              const publicPaths = ['/', '/login', '/signup', '/demo/image-viewer'];
              
              if (!publicPaths.includes(currentPath)) {
                console.log('Redirecting to home due to sign out');
                window.location.href = '/';
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                await fetchProfile(session.user.id);
              }
            } else if (event === 'SIGNED_IN') {
              // 로그인 시에만 상태 업데이트
              console.log('User signed in, updating state');
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                await fetchProfile(session.user.id);
              }
            }
          }
        );
        
        authSubscription = subscription;
      }
    };

    setupAuth();

    return () => {
      isSubscribed = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }
    };
  }, []); // 빈 dependency 배열로 한 번만 실행

  return <>{children}</>;
};;