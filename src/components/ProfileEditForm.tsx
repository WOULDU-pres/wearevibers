import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Profile } from "@/lib/supabase-types";
import { Save, X } from "lucide-react";

interface ProfileEditFormProps {
  profile: Profile | null;
  isEditing: boolean;
  onCancel: () => void;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export const ProfileEditForm = ({ 
  profile, 
  isEditing, 
  onCancel, 
  onProfileUpdate 
}: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        github_url: profile.github_url || "",
        twitter_url: profile.twitter_url || "",
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onProfileUpdate(data);
        toast.success("프로필이 업데이트되었습니다!");
        onCancel();
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) return null;

  return (
    <BlurFade delay={0.5} inView>
      <MagicCard className="mb-8" gradientColor="#D9D9D955">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6">프로필 편집</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="실명을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="사용자명을 입력하세요"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="자신에 대해 간단히 소개해보세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <Label htmlFor="twitter_url">Twitter URL</Label>
                <Input
                  id="twitter_url"
                  type="url"
                  value={formData.twitter_url || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label htmlFor="website_url">웹사이트 URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "저장 중..." : "저장"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
          </div>
        </CardContent>
      </MagicCard>
    </BlurFade>
  );
};