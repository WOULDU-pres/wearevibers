import { useState, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase-types";
import { useMyProjects } from "@/hooks/useProjects";
import { safeGetProfile } from "@/lib/rlsHelper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  Loader2,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuthStore();
  const { uploadProfileImage } = useFileUpload();
  const { data: myProjects, isLoading: projectsLoading } = useMyProjects();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.warn('🔍 Starting Profile query for user:', user.id);
    setLoading(true);

    try {
      // 1. First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        toast.error('인증 세션에 문제가 있습니다. 다시 로그인해주세요.');
        return;
      }

      if (!session || !session.user) {
        console.warn('⚠️ No valid session found');
        toast.error('로그인이 필요합니다.');
        return;
      }

      console.warn('✅ Valid session found, proceeding with profile query');
      
      // 2. Create timeout promise (reduced to 3 seconds for better UX)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RLS_TIMEOUT: Profile query timed out - likely RLS permission issue'));
        }, 3000);
      });

      // 3. Use safe profile fetcher with built-in RLS handling
      console.warn('🔍 Using safeGetProfile with built-in RLS protection...');
      
      const { data, error, isTimeout } = await safeGetProfile(user.id);
      console.warn('📊 SafeGetProfile _result:', { data: !!data, error, isTimeout });
      
      if (isTimeout) {
        console.warn('⏰ Profile query timed out - using fallback profile');
        toast.warning('프로필 데이터 로드가 지연되어 기본 정보를 표시합니다.');
        
        if (data) {
          setProfile(data);
          setFormData(data);
        }
        return;
      }

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // Handle specific error cases
        if (error.code === 'PGRST116') {
          console.warn('ℹ️ Profile not found - this might be a new user');
          toast.info('프로필을 찾을 수 없습니다. 프로필을 생성해주세요.');
          return;
        }
        
        if (error.message?.includes('JWT') || error.message?.includes('expired')) {
          console.error('🔐 Authentication error - signing out');
          await supabase.auth.signOut();
          toast.error('인증이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        
        throw error;
      }
      
      if (data) {
        console.warn('✅ Profile query successful, setting data');
        setProfile(data);
        setFormData(data);
      } else {
        console.warn('⚠️ No profile data returned');
        toast.warning('프로필 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('💥 Profile query failed:', error);
      
      // Handle different types of errors
      if (error.message?.includes('RLS_TIMEOUT')) {
        console.warn('🚨 RLS timeout in catch block');
        toast.error('프로필 로드가 시간 초과되었습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.message?.includes('network')) {
        toast.error('네트워크 연결을 확인해주세요.');
      } else {
        console.error('Unexpected error fetching profile:', error);
        toast.error('프로필을 불러오는데 실패했습니다.');
      }
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
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">프로필을 찾을 수 없습니다</h2>
              <p className="text-muted-foreground mb-4">
                데이터베이스 연결에 문제가 있거나 프로필이 아직 생성되지 않았을 수 있습니다.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setLoading(true);
                    fetchProfile();
                  }}
                  className="mr-2"
                >
                  다시 시도
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          </div>
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
                                GitHub,
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
              {projectsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg h-64"></div>
                    </div>
                  ))}
                </div>
              ) : myProjects && myProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description || "설명이 없습니다."}
                      image={project.image_urls?.[0] || "/api/placeholder/400/300"}
                      author={{
                        name: profile?.full_name || profile?.username || "Unknown",
                        avatar: profile?.avatar_url || ""
                      }}
                      vibes={project.vibe_count || 0}
                      tags={project.tech_stack || []}
                      vibeEmoji="🚀"
                      isVibed={false}
                      githubUrl={project.github_url || undefined}
                      demoUrl={project.demo_url || undefined}
                      commentCount={project.comment_count || 0}
                    />
                  ))}
                </div>
              ) : (
                <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl border-border/50 bg-card/50 backdrop-blur" gradientColor="#9c40ff" gradientSize={250}>
                  <CardContent className="p-8 text-center space-y-4">
                    <p className="text-muted-foreground">아직 공유한 프로젝트가 없습니다.</p>
                    <Button 
                      onClick={() => window.location.href = '/projects/create'}
                      className="bg-primary hover:bg-primary/90"
                    >
                      첫 프로젝트 만들기
                    </Button>
                  </CardContent>
                </MagicCard>
              )}
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
                  GitHub,
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
                  Twitter,
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
                  LinkedIn,
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