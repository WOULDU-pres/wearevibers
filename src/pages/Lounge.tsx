import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, User, Calendar } from "lucide-react";

const loungeCategories = [
  { name: "데스크테리어", count: 42, color: "bg-primary/10 text-primary" },
  { name: "코딩플레이리스트", count: 38, color: "bg-secondary/10 text-secondary" },
  { name: "IDE테마", count: 25, color: "bg-accent/10 text-accent" },
  { name: "자유게시판", count: 67, color: "bg-muted/50 text-muted-foreground" },
];

const loungePosts = [
  {
    id: 1,
    title: "밤샘 코딩을 위한 완벽한 플레이리스트 🎵",
    author: "VibeSeeker",
    category: "코딩플레이리스트",
    time: "2시간 전",
    likes: 24,
    comments: 8,
    content: "로파이 힙합부터 앰비언트까지, 집중력을 극대화하는 음악 리스트를 공유합니다..."
  },
  {
    id: 2,
    title: "미니멀 데스크 셋업 완성! 🖥️",
    author: "CleanCoder",
    category: "데스크테리어",
    time: "4시간 전",
    likes: 45,
    comments: 12,
    content: "1년간 준비한 미니멀 데스크 셋업을 드디어 완성했습니다. 키보드부터 모니터 암까지..."
  },
  {
    id: 3,
    title: "VS Code 테마 추천: Tokyo Night Storm",
    author: "ThemeHunter",
    category: "IDE테마",
    time: "6시간 전",
    likes: 18,
    comments: 5,
    content: "Tokyo Night의 새로운 변형인 Storm 버전을 사용해봤는데 정말 눈이 편해요..."
  },
];

const Lounge = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-vibe bg-clip-text text-transparent mb-4">
            Vibe Lounge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            코딩과 관련된 라이프스타일과 바이브를 자유롭게 공유하는 커뮤니티 공간
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loungeCategories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className={category.color}>
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full mt-4 bg-gradient-vibe hover:opacity-90 text-white border-0">
              새 글 작성하기
            </Button>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-3 space-y-6">
            {loungePosts.map((post) => (
              <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                        {post.title}
                      </CardTitle>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.time}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      읽어보기
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

export default Lounge;