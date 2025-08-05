import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent /*, CardHeader, CardTitle */ } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, /* MapPin, */ Calendar, /* GitBranch, Stars, */ ArrowLeft, Github, Globe, Mail } from "lucide-react";
import { BlockButton } from "@/components/BlockButton";
import { ReportButton } from "@/components/ReportButton";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile, useProfileStats, useIsFollowing, /* useFollowuseUserProjects, */ useUserPosts } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuthStore } from "@/stores";


const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: profile, isLoading: profileLoading, _error: profileError } = useProfile(id!);
  const { data: stats, isLoading: statsLoading } = useProfileStats(id!);
  const { data: isFollowing, isLoading: followingLoading } = useIsFollowing(id!);
  const { data: userProjects, isLoading: projectsLoading } = useUserProjects(id!);
  const { data: userPosts, isLoading: postsLoading } = useUserPosts(id!);
  const followMutation = useFollowUser();

  const handleFollow = () => {
    if (!id) return;
    followMutation.mutate({ targetUserId: id, isFollowing: isFollowing || false });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
          <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex flex-col items-center lg:items-start">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <Skeleton className="h-8 w-48 mt-4" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">사용자를 찾을 수 없습니다</h2>
              <p className="text-muted-foreground">요청하신 사용자 프로필이 존재하지 않습니다.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로 가기
        </Button>

        {/* Profile Header */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || profile.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {(profile.full_name || profile.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.is_online && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background rounded-full"></div>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mt-4 mb-2">{profile.full_name || profile.username}</h1>
                <p className="text-muted-foreground text-center lg:text-left mb-4">{profile.bio || '자기소개가 없습니다.'}</p>
                
                {/* Social Links */}
                <div className="flex gap-2 mb-6">
                  {profile.website_url && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4" />
                        웹사이트
                      </a>
                    </Button>
                  )}
                  {profile.github_url && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                        GitHub,
                      </a>
                    </Button>
                  )}
                  {profile.linkedin_url && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Mail className="w-4 h-4" />
                        LinkedIn,
                      </a>
                    </Button>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                  {!followingLoading && isFollowing !== undefined && (
                    <Button 
                      onClick={handleFollow}
                      disabled={followMutation.isPending}
                      className={`w-full lg:w-auto ${isFollowing 
                        ? 'bg-muted hover:bg-muted/80 text-muted-foreground' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground border-0'
                      }`}
                    >
                      {followMutation.isPending ? '처리 중...' : (isFollowing ? '팔로잉' : '팔로우')}
                    </Button>
                  )}
                  
                  {/* Security Actions - only for other users */}
                  {user && user.id !== id && (
                    <div className="flex gap-2 w-full lg:w-auto">
                      <BlockButton
                        userId={id!}
                        username={profile.username}
                        className="flex-1 lg:flex-none"
                      />
                      <ReportButton
                        contentId={id!}
                        contentType="profile"
                        className="flex-1 lg:flex-none"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {profile.bio || '자기소개가 없습니다.'}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : (stats?.projects || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">프로젝트</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {statsLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : (stats?.vibes || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Vibes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.follower_count || 0}</div>
                    <div className="text-sm text-muted-foreground">팔로워</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.following_count || 0}</div>
                    <div className="text-sm text-muted-foreground">팔로잉</div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDistanceToNow(new Date(profile.created_at!), { addSuffix: true, locale: ko })} 가입
                  </div>
                </div>
                
                {/* Tech Stack */}
                {profile.tech_stack && profile.tech_stack.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.tech_stack.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">프로젝트</TabsTrigger>
            <TabsTrigger value="posts">게시글</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-6">
            {projectsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                    <Skeleton className="aspect-video rounded-t-lg" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex gap-1 mb-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userProjects && userProjects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project) => (
                  <Card key={project.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-muted/50 rounded-t-lg">
                      {project.image_urls && project.image_urls[0] && (
                        <img 
                          src={project.image_urls[0]} 
                          alt={project.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tech_stack.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4 text-red-500" />
                          {project.vibe_count || 0}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <h3 className="font-semibold mb-2">아직 프로젝트가 없습니다</h3>
                  <p className="text-muted-foreground">사용자가 공개한 프로젝트가 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="posts" className="mt-6">
            {postsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-6 w-3/4" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at!), { addSuffix: true, locale: ko })}
                            </span>
                          </div>
                          <h3 
                            className="font-bold text-lg hover:text-primary transition-colors cursor-pointer"
                            onClick={() => navigate(`/posts/${post.id}`)}
                          >
                            {post.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.vibe_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {post.comment_count || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <h3 className="font-semibold mb-2">아직 게시글이 없습니다</h3>
                  <p className="text-muted-foreground">사용자가 작성한 게시글이 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default MemberProfile;