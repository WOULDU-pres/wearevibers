import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase-types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { FileUpload } from "@/components/FileUpload";
import { TechStackAnimatedList } from "@/components/TechStackList";
import NumberTicker from "@/components/ui/number-ticker";
import { ConfettiButton } from "@/components/ui/confetti";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { 
  Settings, 
  Upload, 
  Camera, 
  Heart, 
  MessageSquare, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  Edit,
  Save,
  X,
  Linkedin,
  Loader2
} from "lucide-react";

const Profile = () => {
  const { user } = useAuthStore();
  const { uploadProfileImage } = useFileUpload();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔍 Starting Profile query for user:', user.id);
      
      // Create a Promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RLS_TIMEOUT: Profile query timed out - likely RLS permission issue'));
        }, 5000);
      });

      // First, try a very simple query to test RLS with timeout
      console.log('🧪 Testing basic profile table access...');
      
      const testQueryPromise = supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .limit(1);
      
      // Race between the query and timeout
      const testQuery = await Promise.race([testQueryPromise, timeoutPromise]);
      
      console.log('🧪 Basic profile query result:', testQuery);
      
      if (testQuery.error) {
        console.error('❌ Basic profile query failed:', testQuery.error);
        throw testQuery.error;
      }
      
      // If basic query works, proceed with full query
      console.log('✅ Basic query successful, proceeding with full profile query...');
      
      const fullQueryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('🔍 Executing full profile query...');
      const { data, error } = await Promise.race([fullQueryPromise, timeoutPromise]);
      
      console.log('📊 Full profile query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // If it's a timeout error, show error message but don't set profile
        if (error.message?.includes('RLS_TIMEOUT')) {
          console.warn('🚨 RLS timeout detected - profile data unavailable');
          toast.error('프로필 데이터를 불러올 수 없습니다. RLS 권한 문제가 있을 수 있습니다.');
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Profile query successful, setting data');
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('💥 Profile query failed:', error);
      
      // If it's a timeout error, show appropriate message
      if (error.message?.includes('RLS_TIMEOUT')) {
        console.warn('🚨 RLS timeout detected - profile data unavailable');
        toast.error('프로필 데이터를 불러올 수 없습니다. RLS 권한 문제가 있을 수 있습니다.');
        return;
      }
      
      console.error('Error fetching profile:', error);
      toast.error('프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          github_url: formData.github_url,
          twitter_url: formData.twitter_url,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profile || {});
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadProfileImage(file);
      
      // Update profile in database
      if (user && profile) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        // Update local state
        setProfile({ ...profile, avatar_url: imageUrl });
        setIsAvatarDialogOpen(false);
        toast.success('프로필 이미지가 성공적으로 업데이트되었습니다.');
      }
      
      return imageUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('프로필 이미지 업로드에 실패했습니다.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>프로필을 불러오는 중...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">프로필을 찾을 수 없습니다.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <BlurFade delay={0.25} inView>
          <div className="relative mb-8">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-primary rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => {
                  toast.info("커버 이미지 업로드 기능은 곧 추가될 예정입니다.");
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div>

            {/* Profile Info */}
            <div className="relative -mt-16 px-6">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                {/* Avatar */}
                <BlurFade delay={0.5}>
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                      <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                      <AvatarFallback className="bg-primary text-white text-3xl font-bold">
                        {profile.username?.slice(0, 2) || profile.full_name?.slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => setIsAvatarDialogOpen(true)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </BlurFade>

                {/* User Info */}
                <div className="flex-1 mt-4 md:mt-0">
                  <BlurFade delay={0.75}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                        <p className="text-xl text-muted-foreground">@{profile.username}</p>
                        <p className="text-muted-foreground mt-2">{profile.bio || '자기소개가 없습니다.'}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입</span>
                          </div>
                          {profile.website_url && (
                            <div className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <a href={profile.website_url} className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                                {profile.website_url.replace('https://', '')}
                              </a>
                            </div>
                          )}
                          {profile.github_url && (
                            <div className="flex items-center space-x-1">
                              <Github className="w-4 h-4" />
                              <a href={profile.github_url} className="hover:text-primary" target="_blank" rel="noopener noreferrer">
                                GitHub
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <BlurFade delay={1.0}>
                        <div className="flex space-x-3 mt-4 md:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button variant="outline" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </BlurFade>
                    </div>
                  </BlurFade>

                  {/* Stats */}
                  <BlurFade delay={1.25}>
                    <div className="flex space-x-6 mt-4">
                      <ConfettiButton 
                        className="text-center bg-transparent border-none p-0 hover:bg-transparent cursor-pointer"
                        options={{
                          particleCount: 100,
                          spread: 70,
                          colors: ['#9c40ff', '#ffaa40', '#4ecdc4', '#ff6b6b']
                        }}
                      >
                        <div className="text-2xl font-bold">
                          <NumberTicker value={profile.project_count || 0} delay={0.5} />
                        </div>
                        <div className="text-sm text-muted-foreground">Projects</div>
                      </ConfettiButton>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          <NumberTicker value={42} delay={0.7} />
                        </div>
                        <div className="text-sm text-muted-foreground">Vibes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          <NumberTicker value={profile.follower_count || 128} delay={0.9} />
                        </div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          <NumberTicker value={profile.following_count || 89} delay={1.1} />
                        </div>
                        <div className="text-sm text-muted-foreground">Following</div>
                      </div>
                    </div>
                  </BlurFade>
                </div>
              </div>

              {/* Tech Stack Section */}
              <BlurFade delay={1.5}>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">기술 스택</h3>
                  <TechStackAnimatedList className="max-w-sm" />
                </div>
              </BlurFade>
            </div>
          </div>
        </BlurFade>

        {/* Profile Content */}
        <BlurFade delay={1.5}>
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="lounge">Lounge</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="vibed">Vibed</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock projects will be replaced with real data later */}
                <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl border-border/50 bg-card/50 backdrop-blur" gradientColor="#9c40ff" gradientSize={250}>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">프로젝트가 없습니다.</p>
                  </CardContent>
                </MagicCard>
              </div>
            </TabsContent>

            <TabsContent value="lounge">
              <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl border-border/50 bg-card/50 backdrop-blur" gradientColor="#ffaa40" gradientSize={300}>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">라운지 게시글이 없습니다.</p>
                </CardContent>
              </MagicCard>
            </TabsContent>

            <TabsContent value="tips">
              <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl border-border/50 bg-card/50 backdrop-blur" gradientColor="#4ecdc4" gradientSize={280}>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">공유한 팁이 없습니다.</p>
                </CardContent>
              </MagicCard>
            </TabsContent>

            <TabsContent value="vibed">
              <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl border-border/50 bg-card/50 backdrop-blur" gradientColor="#ff6b6b" gradientSize={260}>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">좋아요를 누른 콘텐츠가 없습니다.</p>
                </CardContent>
              </MagicCard>
            </TabsContent>
          </Tabs>
        </BlurFade>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>프로필 편집</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">사용자명</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                value={formData.full_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">자기소개</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="자신을 소개해주세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="github_url">
                  <Github className="w-4 h-4 mr-2 inline" />
                  GitHub
                </Label>
                <Input
                  id="github_url"
                  value={formData.github_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_url">
                  <Twitter className="w-4 h-4 mr-2 inline" />
                  Twitter
                </Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">
                  <Linkedin className="w-4 h-4 mr-2 inline" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">
                  <Globe className="w-4 h-4 mr-2 inline" />
                  웹사이트
                </Label>
                <Input
                  id="website_url"
                  value={formData.website_url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>프로필 이미지 업로드</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              onUpload={handleAvatarUpload}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-center">
              JPG, PNG, GIF 파일만 업로드 가능합니다. (최대 5MB)
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Profile;