import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { isAuthError, handleAuthError } from "@/lib/authErrorHandler";
import { createQueryErrorHandler, captureError } from "@/lib/sentry";
import * as Sentry from "@sentry/react";
import Index from "./pages/Index";
import Lounge from "./pages/Lounge";
import Tips from "./pages/Tips";
import Members from "./pages/Members";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: Error) => {
        // 인증 에러는 재시도하지 않음
        if (isAuthError(error) || error?.message?.includes('세션이 만료')) {
          return false;
        }
        // 일반 에러는 최대 3회 재시도
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
      onError: createQueryErrorHandler(), // Sentry 에러 핸들러 추가
    },
    mutations: {
      onError: async (error: Error) => {
        console.error('Global mutation error:', error);
        
        // Sentry로 mutation 에러 리포팅
        captureError(error, {
          context: 'React Query Mutation',
          isAuthError: isAuthError(error),
        });
        
        if (isAuthError(error)) {
          await handleAuthError(error);
        }
      },
    },
  },
});

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Auth routes - only accessible when not logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/lounge" 
              element={
                <ProtectedRoute>
                  <Lounge />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tips" 
              element={
                <ProtectedRoute>
                  <Tips />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/members" 
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
