import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const PageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, session, loading, initialized } = useAuthStore();
  const location = useLocation();

  // 로딩 중이거나 초기화되지 않은 경우 스켈레톤 표시
  // loading이 undefined인 경우를 고려하여 명시적으로 true인지 확인
  if (loading === true || !initialized) {
    return <PageSkeleton />;
  }

  // 인증이 필요한 페이지인데 사용자가 로그인하지 않은 경우
  // 세션과 사용자 정보 모두 확인
  if (requireAuth && (!user || !session)) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // 인증이 필요하지 않은 페이지인데 사용자가 로그인한 경우 (로그인/회원가입 페이지)
  if (!requireAuth && user && session) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};