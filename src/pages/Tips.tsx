import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Bookmark, Search, Code, Palette, GitBranch, Layers } from "lucide-react";

const tipCategories = [
  { name: "Productivity", icon: Layers, count: 34 },
  { name: "CSS_Trick", icon: Palette, count: 28 },
  { name: "Git_Flow", icon: GitBranch, count: 19 },
  { name: "UI/UX", icon: Code, count: 42 },
];

const tips = [
  {
    id: 1,
    title: "CSS Grid로 완벽한 반응형 레이아웃 만들기",
    author: "GridMaster",
    category: "CSS_Trick",
    vibes: 89,
    difficulty: "초급",
    readTime: "5분",
    preview: "Grid의 fr 단위와 minmax() 함수를 활용해서 모든 화면 크기에 완벽하게 대응하는 레이아웃을 만드는 방법을 알아봅시다...",
    tags: ["CSS", "반응형", "레이아웃"]
  },
  {
    id: 2,
    title: "Git 브랜치 전략: 팀 프로젝트에서 충돌 최소화하기",
    author: "GitNinja",
    category: "Git_Flow",
    vibes: 156,
    difficulty: "중급",
    readTime: "8분",
    preview: "Git Flow와 GitHub Flow의 장단점을 비교하고, 팀 규모와 프로젝트 특성에 맞는 브랜치 전략을 선택하는 방법...",
    tags: ["Git", "팀워크", "버전관리"]
  },
  {
    id: 3,
    title: "VS Code 생산성 10배 높이는 확장 프로그램",
    author: "CodeOptimizer",
    category: "Productivity",
    vibes: 203,
    difficulty: "초급",
    readTime: "6분",
    preview: "매일 사용하는 VS Code를 더 스마트하게! 코딩 속도를 획기적으로 향상시켜주는 필수 확장 프로그램들을 소개합니다...",
    tags: ["VSCode", "확장프로그램", "생산성"]
  },
  {
    id: 4,
    title: "사용자 경험을 높이는 마이크로 인터랙션 디자인",
    author: "UXDesigner",
    category: "UI/UX",
    vibes: 127,
    difficulty: "중급",
    readTime: "12분",
    preview: "버튼 호버 효과부터 로딩 애니메이션까지, 사용자가 느끼는 앱의 품질을 크게 좌우하는 마이크로 인터랙션 디자인 가이드...",
    tags: ["UX", "애니메이션", "인터랙션"]
  }
];

const Tips = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-vibe bg-clip-text text-transparent mb-4">
            Vibe Tips
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            개발과 디자인 과정에서 유용한 팁과 노하우를 공유하는 지식 허브
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="팁 검색하기..." 
                className="pl-10 bg-muted/50 border-border hover:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                최신순
              </Button>
              <Button variant="outline" size="sm">
                인기순
              </Button>
              <Button variant="outline" size="sm">
                북마크
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tipCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={category.name}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
                        <div className="text-xs text-muted-foreground">{category.count}개</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Button className="w-full mt-4 bg-gradient-vibe hover:opacity-90 text-white border-0">
              팁 공유하기
            </Button>
          </div>

          {/* Tips Feed */}
          <div className="lg:col-span-3 space-y-6">
            {tips.map((tip) => (
              <Card key={tip.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{tip.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {tip.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {tip.readTime} 읽기
                        </span>
                      </div>
                      <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                        {tip.title}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        by {tip.author}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {tip.preview}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tip.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {tip.vibes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        저장
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      자세히 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Tips;