import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  Share2, 
  ExternalLink,
  Github, 
  Calendar, 
  User,
  Tag,
  ArrowLeft,
  Eye,
  MessageCircle,
} from "lucide-react";
import { ReportButton } from "@/components/ReportButton";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";

// Mock data for project details (나중에 실제 API로 교체)
const mockProjectDetails = {
  "1": {
    id: "1",
    title: "React Code Editor",
    description: "스타트업에서 개발팀이 2주간 야근하며 만든 코드 에디터. VS Code보다 가벼우면서도 필수 기능은 모두 포함하려 했던 도전적인 프로젝트입니다.",
    fullDescription: `이 프로젝트는 웹 기반 코드 에디터를 만드는 것이 목표였습니다. Monaco Editor를 기반으로 하여 VS Code의 핵심 기능들을 웹에서 구현했습니다.

**주요 기능:**
- 실시간 협업 편집 (WebSocket 기반)
- 문법 하이라이팅 및 자동 완성
- 파일 트리 네비게이션
- 통합 터미널
- Git 통합
- 플러그인 시스템

**기술적 도전:**
가장 큰 도전은 실시간 협업 기능이었습니다. 여러 사용자가 동시에 편집할 때 충돌을 방지하기 위해 Operational Transform 알고리즘을 구현했습니다. 또한 메모리 사용량을 최적화하여 대용량 파일도 원활하게 편집할 수 있도록 했습니다.

**성과:**
- 사내에서 일일 사용자 500명 달성
- 메모리 사용량 기존 대비 40% 절감
- 로딩 속도 3초 → 1초로 개선`,
    image: "/api/placeholder/800/400",
    author: {
      id: "user-1",
      name: "김준혁",
      username: "junhyuk_kim",
      avatar: "/api/placeholder/60/60",
      title: "Frontend Developer",
      company: "TechCorp"
    },
    stats: {
      vibes: 124,
      views: 2847,
      comments: 23
    },
    tags: ["React", "TypeScript", "Monaco Editor", "WebSocket", "Collaboration"],
    category: "frontend",
    vibeEmoji: "🚀",
    isVibed: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    links: {
      demo: "https://code-editor-demo.vercel.app",
      github: "https://github.com/junhyuk/react-code-editor",
      website: "https://junhyuk.dev"
    },
    techStack: [
      { name: "React", type: "frontend" },
      { name: "TypeScript", type: "language" },
      { name: "Monaco Editor", type: "library" },
      { name: "Node.js", type: "backend" },
      { name: "Socket.io", type: "realtime" },
      { name: "MongoDB", type: "database" }
    ]
  }
  // 다른 프로젝트들도 필요시 추가
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isVibed, setIsVibed] = useState(false);

  // Mock API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="프로젝트 로딩중..." />;
  }

  const project = id ? mockProjectDetails[id as keyof typeof mockProjectDetails] : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">프로젝트를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground mb-8">
            요청하신 프로젝트가 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleVibe = () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setIsVibed(!isVibed);
    toast.success(isVibed ? "좋아요 취소" : "좋아요!");
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("링크가 복사되었습니다!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          프로젝트 목록으로 돌아가기
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        #{project.category}
                      </Badge>
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-3xl mb-3">{project.title}</CardTitle>
                    <p className="text-lg text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  
                  {/* Report button for non-owners */}
                  {user && user.id !== project.author.id && (
                    <ReportButton
                      contentId={project.id}
                      contentType="project"
                      className="h-8 w-8 p-0"
                    />
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Project Image */}
            <Card className="mb-8">
              <CardContent className="p-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Project Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">프로젝트 상세</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {project.fullDescription.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
                          {paragraph.slice(2, -2)}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="ml-4">
                          {paragraph.slice(2)}
                        </li>
                      );
                    }
                    if (paragraph.trim()) {
                      return (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    }
                    return <br key={index} />;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">기술 스택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge 
                      key={tech.name} 
                      variant="outline" 
                      className="px-3 py-1"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tech.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">프로젝트 생성자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={project.author.avatar} />
                    <AvatarFallback>{project.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{project.author.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{project.author.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.author.title} at {project.author.company}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/profile/${project.author.id}`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  프로필 보기
                </Button>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">프로젝트 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">바이브</span>
                  </div>
                  <span className="font-medium">{project.stats.vibes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">조회수</span>
                  </div>
                  <span className="font-medium">{project.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">댓글</span>
                  </div>
                  <span className="font-medium">{project.stats.comments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">생성일</span>
                  </div>
                  <span className="text-sm">{formatDate(project.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={handleVibe}
                  variant={isVibed ? "default" : "outline"}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isVibed ? 'fill-current' : ''}`} />
                  {isVibed ? '바이브 취소' : '바이브 하기'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  공유하기
                </Button>
              </CardContent>
            </Card>

            {/* External Links */}
            {(project.links.demo || project.links.github) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">외부 링크</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.links.demo && (
                    <a 
                      href={project.links.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        라이브 데모
                      </Button>
                    </a>
                  )}
                  {project.links.github && (
                    <a 
                      href={project.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub 저장소
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectDetail;