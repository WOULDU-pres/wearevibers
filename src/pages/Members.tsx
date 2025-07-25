import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Calendar, Heart } from "lucide-react";

const techTags = [
  "React", "TypeScript", "Node.js", "Python", "Vue.js", "Angular",
  "Next.js", "Express", "MongoDB", "PostgreSQL", "Docker", "AWS"
];

const members = [
  {
    id: 1,
    name: "DevViber",
    avatar: "/placeholder.svg",
    bio: "풀스택 개발자 | 아름다운 코드를 추구합니다 ✨",
    location: "서울, 한국",
    joinDate: "2024년 1월",
    projects: 12,
    vibes: 450,
    tags: ["React", "TypeScript", "Node.js"],
    isOnline: true
  },
  {
    id: 2,
    name: "DesignCoder",
    avatar: "/placeholder.svg",
    bio: "UI/UX 디자이너 겸 프론트엔드 개발자",
    location: "부산, 한국",
    joinDate: "2024년 2월",
    projects: 8,
    vibes: 320,
    tags: ["Figma", "React", "CSS"],
    isOnline: false
  },
  {
    id: 3,
    name: "BackendMaster",
    avatar: "/placeholder.svg",
    bio: "서버 아키텍처와 성능 최적화에 관심이 많습니다",
    location: "대구, 한국",
    joinDate: "2023년 12월",
    projects: 15,
    vibes: 680,
    tags: ["Python", "Django", "PostgreSQL"],
    isOnline: true
  },
  {
    id: 4,
    name: "MobileViber",
    avatar: "/placeholder.svg",
    bio: "모바일 앱 개발자 | React Native 전문가",
    location: "인천, 한국",
    joinDate: "2024년 3월",
    projects: 6,
    vibes: 210,
    tags: ["React Native", "Expo", "TypeScript"],
    isOnline: true
  },
  {
    id: 5,
    name: "CloudNinja",
    avatar: "/placeholder.svg",
    bio: "클라우드 아키텍트 | DevOps 엔지니어",
    location: "대전, 한국",
    joinDate: "2024년 1월",
    projects: 10,
    vibes: 520,
    tags: ["AWS", "Docker", "Kubernetes"],
    isOnline: false
  },
  {
    id: 6,
    name: "FrontendArtist",
    avatar: "/placeholder.svg",
    bio: "아름다운 웹 경험을 만드는 프론트엔드 개발자",
    location: "광주, 한국",
    joinDate: "2024년 2월",
    projects: 14,
    vibes: 390,
    tags: ["Vue.js", "Nuxt.js", "SCSS"],
    isOnline: true
  }
];

const Members = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-vibe bg-clip-text text-transparent mb-4">
            Members
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            창의적인 개발자들과 연결되고, 함께 성장하는 커뮤니티
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="멤버 검색하기..." 
                className="pl-10 bg-muted/50 border-border hover:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                전체
              </Button>
              <Button variant="outline" size="sm">
                온라인
              </Button>
              <Button variant="outline" size="sm">
                최신 가입
              </Button>
            </div>
          </div>

          {/* Tech Tags Filter */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">기술 스택으로 필터링:</p>
            <div className="flex flex-wrap gap-2">
              {techTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-vibe text-white text-lg font-bold">
                        {member.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{member.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {member.location}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {member.joinDate} 가입
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {member.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>프로젝트 {member.projects}개</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    {member.vibes}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    프로필 보기
                  </Button>
                  <Button size="sm" className="bg-gradient-vibe hover:opacity-90 text-white border-0">
                    팔로우
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            더 많은 멤버 보기
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Members;