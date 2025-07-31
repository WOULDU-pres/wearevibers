import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SearchHighlight, SearchSnippet } from "@/components/SearchHighlight";
import { Heart, Bookmark, Search, Code, Palette, GitBranch, Layers, PlusCircle } from "lucide-react";
import { useTips, useIsTipVibed, useVibeTip, useIsTipBookmarked, useBookmarkTip } from "@/hooks/useTips";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const tipCategories = [
  { name: "productivity", value: "productivity", icon: Layers },
  { name: "css-tricks", value: "css-tricks", icon: Palette },
  { name: "git-flow", value: "git-flow", icon: GitBranch },
  { name: "ui-ux", value: "ui-ux", icon: Code },
];

const Tips = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');

  // Fetch tips data - moved before early return
  const { data: tips = [], isLoading: loading, error } = useTips({ 
    category: selectedCategory, 
    search: searchQuery,
    sortBy 
  });

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Early return after all hooks are declared
  if (isPageLoading) {
    return <LoadingScreen message="팁 로딩중..." />;
  }

  // Debug logging
  console.log('Tips query state:', { tips, loading, error });

  const TipCard = ({ tip }: { tip: Record<string, unknown> }) => {
    const { data: isTipVibed } = useIsTipVibed(tip.id);
    const { data: isTipBookmarked } = useIsTipBookmarked(tip.id);
    const vibeTipMutation = useVibeTip();
    const bookmarkTipMutation = useBookmarkTip();

    const handleVibe = () => {
      vibeTipMutation.mutate({ tipId: tip.id, isVibed: isTipVibed || false });
    };

    const handleBookmark = () => {
      bookmarkTipMutation.mutate({ tipId: tip.id, isBookmarked: isTipBookmarked || false });
    };

    const handleViewDetail = () => {
      navigate(`/tips/${tip.id}`);
    };

    return (
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
              <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer" onClick={handleViewDetail}>
                <SearchHighlight text={tip.title} searchTerm={searchQuery} />
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                by {tip.profiles?.full_name || tip.profiles?.username || '익명'} · {formatDistanceToNow(new Date(tip.created_at!), { addSuffix: true, locale: ko })}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-muted-foreground mb-4 line-clamp-2">
            <SearchSnippet content={tip.content} searchTerm={searchQuery} maxLength={150} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleVibe}
                disabled={vibeTipMutation.isPending}
                className={`flex items-center gap-1 ${isTipVibed ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${isTipVibed ? 'fill-current' : ''}`} />
                {tip.vibe_count || 0}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBookmark}
                disabled={bookmarkTipMutation.isPending}
                className={`flex items-center gap-1 ${isTipBookmarked ? 'text-blue-500' : 'hover:text-blue-500'}`}
              >
                <Bookmark className={`w-4 h-4 ${isTipBookmarked ? 'fill-current' : ''}`} />
                저장
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleViewDetail}>
              자세히 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
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
          <h1 className="text-4xl font-bold text-primary font-semibold mb-4">
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
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(query) => setSearchQuery(query)}
                placeholder="팁 검색하기..."
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={sortBy === 'newest' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('newest')}
              >
                최신순
              </Button>
              <Button 
                variant={sortBy === 'popular' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('popular')}
              >
                인기순
              </Button>
              <Button 
                variant={sortBy === 'trending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('trending')}
              >
                조회순
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
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${!selectedCategory ? 'bg-muted/50' : ''}`}
                  onClick={() => setSelectedCategory("")}
                >
                  <Layers className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="font-medium">전체</span>
                    <div className="text-xs text-muted-foreground">{tips?.length || 0}개</div>
                  </div>
                </div>
                {tipCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.value;
                  return (
                    <div
                      key={category.value}
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50' : ''}`}
                      onClick={() => setSelectedCategory(isSelected ? "" : category.value)}
                    >
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {tips?.filter(tip => tip.category === category.value).length || 0}개
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Button 
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              onClick={() => navigate('/tips/create')}
            >
              팁 공유하기
            </Button>
          </div>

          {/* Tips Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <TipsSkeleton />
            ) : error ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    네트워크 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    새로고침
                  </Button>
                </CardContent>
              </Card>
            ) : tips.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {tips?.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
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