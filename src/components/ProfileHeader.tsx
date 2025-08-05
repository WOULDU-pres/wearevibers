import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { ConfettiButton } from "@/components/ui/confetti";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { SocialLinks } from "@/components/ui/social-links";
import type { ProfileHeaderProps } from "@/types";
import { Calendar, Edit, Loader2 } from "lucide-react";

export const ProfileHeader = ({ 
  profile, 
  isEditing, 
  loading, 
  onEditToggle,
  onProfileUpdate 
}: ProfileHeaderProps) => {
  const handleAvatarUpdate = (avatarUrl: string) => {
    if (profile) {
      const updatedProfile = { ...profile, avatar_url: avatarUrl };
      onProfileUpdate(updatedProfile);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <BlurFade delay={0.25} inView>
        <div className="relative mb-8">
          {/* 배경 그라디언트 */}
          <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-t-lg"></div>
          
          {/* 프로필 정보 */}
          <div className="relative px-6 pb-6">
            {/* 아바타 */}
            <div className="absolute -top-16">
              <ProfileAvatar
                src={profile.avatar_url}
                alt={profile.full_name || "User"}
                fallbackText={profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                userId={profile.id}
                size="lg"
                editable={true}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </div>

            {/* 편집 버튼 */}
            <div className="flex justify-end pt-4">
              <Button
                variant={isEditing ? "destructive" : "outline"}
                size="sm"
                onClick={onEditToggle}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "편집 취소" : "프로필 편집"}
              </Button>
            </div>

            {/* 프로필 기본 정보 */}
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                <ConfettiButton>
                  <span className="text-2xl">🎉</span>
                </ConfettiButton>
              </div>
              
              {profile.username && profile.full_name && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
              )}

              {/* 메타 정보 */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profile.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    가입일: {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* 소셜 링크 */}
              <SocialLinks
                links={[
                  ...(profile.github_url ? [{ type: 'github' as const, url: profile.github_url }] : []),
                  ...(profile.twitter_url ? [{ type: 'twitter' as const, url: profile.twitter_url }] : []),
                  ...(profile.linkedin_url ? [{ type: 'linkedin' as const, url: profile.linkedin_url }] : []),
                  ...(profile.website_url ? [{ type: 'website' as const, url: profile.website_url }] : []),
                ]}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        </div>
      </BlurFade>

    </>
  );
};