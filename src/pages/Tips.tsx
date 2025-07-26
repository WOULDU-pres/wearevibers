import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Bookmark, Search, Code, Palette, GitBranch, Layers, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase-types";

type Tip = Tables<'tips'>;

const tipCategories = [
  { name: "Productivity", icon: Layers, count: 0 },
  { name: "CSS_Trick", icon: Palette, count: 0 },
  { name: "Git_Flow", icon: GitBranch, count: 0 },
  { name: "UI/UX", icon: Code, count: 0 },
];

const Tips = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching tips:', error);
        return;
      }

      setTips(data || []);
    } catch (error) {
      console.error('Error in fetchTips:', error);
    } finally {
      setLoading(false);
    }
  };

  const TipsSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-12 text-center">
        <PlusCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">아직 팁이 없습니다</h3>
        <p className="text-muted-foreground mb-6">
          유용한 개발 팁을 공유해서 커뮤니티에 기여해보세요!
        </p>
        <Button className="bg-gradient-vibe hover:opacity-90 text-white border-0">
          첫 번째 팁 공유하기
        </Button>
      </CardContent>
    </Card>
  );
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
          <div className="lg:col-span-3">
            {loading ? (
              <TipsSkeleton />
            ) : tips.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {tips.map((tip) => (
                  <Card key={tip.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{tip.category || '일반'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {tip.difficulty_level ? `레벨 ${tip.difficulty_level}` : '초급'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {tip.read_time || '5'}분 읽기
                            </span>
                          </div>
                          <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                            {tip.title}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground mt-1">
                            by {tip.profiles?.username || '익명'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {tip.content}
                      </p>
                      
                      {/* Tags 기능은 추후 추가 예정 */}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-red-500">
                            <Heart className="w-4 h-4" />
                            {tip.vibe_count || 0}
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
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Tips;