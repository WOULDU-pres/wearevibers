import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/QueryProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

import Index from "./pages/Index";
import Lounge from "./pages/Lounge";
import Tips from "./pages/Tips";
import Members from "./pages/Members";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TipDetail from "./pages/TipDetail";
import PostDetail from "./pages/PostDetail";
import CreateTip from "./pages/CreateTip";
import CreatePost from "./pages/CreatePost";
import CreateProject from "./pages/CreateProject";
import MemberProfile from "./pages/MemberProfile";
import Search from "./pages/Search";
import ImageViewerDemo from "./pages/ImageViewerDemo";
import Notifications from "./pages/Notifications";
import AdminReports from "./pages/AdminReports";
import ProjectDetail from "./pages/ProjectDetail";

const App = () => (
  <AppErrorBoundary>
    <QueryProvider>
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
              path="/lounge/create" 
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/create" 
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={<ProjectDetail />}
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
              path="/tips/create" 
              element={
                <ProtectedRoute>
                  <CreateTip />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tips/:id" 
              element={
                <ProtectedRoute>
                  <TipDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/posts/:id" 
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <MemberProfile />
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
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            
            {/* Demo routes */}
            <Route path="/demo/image-viewer" element={<ImageViewerDemo />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryProvider>
  </AppErrorBoundary>
);

export default App;
