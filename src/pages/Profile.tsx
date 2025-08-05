import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores";
import type { Profile } from "@/lib/supabase-types";
import { useMyProjects } from "@/hooks/useProjects";
import { safeGetProfile } from "@/lib/rlsHelper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { ProfileStats } from "@/components/ProfileStats";
import { ProfileProjects } from "@/components/ProfileProjects";

const Profile = () => {
  const { user } = useAuthStore();
  const { data: myProjects, isLoading: projectsLoading } = useMyProjects();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 프로필 데이터 로드
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const profileData = await safeGetProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileUpdate = useCallback((updatedProfile: Profile) => {
    setProfile(updatedProfile);
  }, []);

  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 프로필 헤더 */}
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          loading={loading}
          onEditToggle={handleEditToggle}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* 프로필 편집 폼 */}
        <ProfileEditForm
          profile={profile}
          isEditing={isEditing}
          onCancel={handleEditCancel}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* 통계 및 기술 스택 */}
        <ProfileStats
          profile={profile}
          projectCount={myProjects?.length || 0}
        />

        {/* 프로젝트 섹션 */}
        <ProfileProjects
          projects={myProjects}
          isLoading={projectsLoading}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Profile;