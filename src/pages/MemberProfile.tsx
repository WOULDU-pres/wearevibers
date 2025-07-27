import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MapPin, Calendar, GitBranch, Star, Users, ArrowLeft, Github, Globe, Mail } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const mockMemberProfile = {
  id: 1,
  name: "DevViber",
  avatar: "/placeholder.svg",
  bio: "풀스택 개발자 | 아름다운 코드를 추구합니다 ✨",
  longBio: "안녕하세요! 5년차 풀스택 개발자입니다. 클린 코드와 사용자 경험을 중시하며, 항상 새로운 기술을 배우는 것을 좋아합니다. 특히 React와 Node.js 생태계에 관심이 많고, 오픈소스 프로젝트에도 활발히 기여하고 있습니다.",
  location: "서울, 한국",
  joinDate: "2024년 1월",
  website: "https://devviber.dev",
  github: "https://github.com/devviber",
  email: "hello@devviber.dev",
  isOnline: true,
  isFollowing: false,
  stats: {
    projects: 12,
    vibes: 450,
    followers: 89,
    following: 56
  },
  tags: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
  projects: [
    {
      id: 1,
      title: "모던 투두 앱",
      description: "React + TypeScript로 만든 아름다운 할 일 관리 앱",
      tags: ["React", "TypeScript", "Tailwind"],
      vibes: 45,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "실시간 채팅 서비스",
      description: "Socket.io를 활용한 실시간 메시징 플랫폼",
      tags: ["Node.js", "Socket.io", "MongoDB"],
      vibes: 67,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "포트폴리오 웹사이트",
      description: "3D 애니메이션이 포함된 개인 포트폴리오",
      tags: ["Three.js", "React", "GSAP"],
      vibes: 89,
      image: "/placeholder.svg"
    }
  ],
  posts: [
    {
      id: 1,
      title: "React 18의 새로운 기능들",
      category: "개발팁",
      time: "3일 전",
      vibes: 34,
      comments: 8
    },
    {
      id: 2,
      title: "TypeScript 타입 가드 완벽 가이드",
      category: "튜토리얼",
      time: "1주 전",
      vibes: 56,
      comments: 12
    }
  ]
};

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(mockMemberProfile.isFollowing);
  const [followersCount, setFollowersCount] = useState(mockMemberProfile.stats.followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

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
                    <AvatarImage src={mockMemberProfile.avatar} alt={mockMemberProfile.name} />
                    <AvatarFallback className="bg-gradient-vibe text-white text-3xl font-bold">
                      {mockMemberProfile.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {mockMemberProfile.isOnline && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background rounded-full"></div>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold mt-4 mb-2">{mockMemberProfile.name}</h1>
                <p className="text-muted-foreground text-center lg:text-left mb-4">{mockMemberProfile.bio}</p>
                
                {/* Social Links */}
                <div className="flex gap-2 mb-6">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    웹사이트
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    연락하기
                  </Button>
                </div>
                
                <Button 
                  onClick={handleFollow}
                  className={`w-full lg:w-auto ${isFollowing 
                    ? 'bg-muted hover:bg-muted/80 text-muted-foreground' 
                    : 'bg-gradient-vibe hover:opacity-90 text-white border-0'
                  }`}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </Button>
              </div>
              
              <div className="flex-1">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {mockMemberProfile.longBio}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockMemberProfile.stats.projects}</div>
                    <div className="text-sm text-muted-foreground">프로젝트</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockMemberProfile.stats.vibes}</div>
                    <div className="text-sm text-muted-foreground">Vibes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{followersCount}</div>
                    <div className="text-sm text-muted-foreground">팔로워</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mockMemberProfile.stats.following}</div>
                    <div className="text-sm text-muted-foreground">팔로잉</div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {mockMemberProfile.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {mockMemberProfile.joinDate} 가입
                  </div>
                </div>
                
                {/* Tech Stack */}
                <div>
                  <h3 className="font-semibold mb-3">기술 스택</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockMemberProfile.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMemberProfile.projects.map((project) => (
                <Card key={project.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-muted/50 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4 text-red-500" />
                        {project.vibes}
                      </div>
                      <Button variant="outline" size="sm">
                        보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              {mockMemberProfile.posts.map((post) => (
                <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            #{post.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.time}</span>
                        </div>
                        <h3 className="font-bold text-lg hover:text-primary transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.vibes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default MemberProfile;