import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, User, Calendar, PlusCircle, Search, TrendingUp, Clock, Filter } from "lucide-react";
import { usePosts, useVibePost, useIsPostVibed } from "@/hooks/usePosts";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useUIStore } from "@/stores";
import { useNavigate } from "react-router-dom";

const loungeCategories = [
  { 
    id: 'all', 
    name: "전체", 
    value: undefined, 
    color: "bg-primary/10 text-primary",
    icon: Filter
  },
  { 
    id: 'desk-setup', 
    name: "데스크테리어", 
    value: 'desk-setup', 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    icon: PlusCircle
  },
  { 
    id: 'coding-playlist', 
    name: "코딩플레이리스트", 
    value: 'coding-playlist', 
    color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    icon: MessageCircle
  },
  { 
    id: 'ide-theme', 
    name: "IDE테마", 
    value: 'ide-theme', 
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    icon: Heart
  },
  { 
    id: 'free-talk', 
    name: "자유게시판", 
    value: 'free-talk', 
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
    icon: User
  },
];

const sortOptions = [
  { value: 'newest', label: '최신순', icon: Clock },
  { value: 'popular', label: '인기순', icon: TrendingUp },
  { value: 'comments', label: '댓글순', icon: MessageCircle },
];

const Lounge = () => {
  const { user } = useAuthStore();
  const { 
    activeCategory, 
    setActiveCategory, 
    sortBy, 
    setSortBy, 
    searchQuery, 
    setSearchQuery 
  } = useUIStore();

  // Get current category value for API call
  const currentCategory = loungeCategories.find(cat => cat.id === activeCategory)?.value;

  // Fetch posts with filters
  const { data: posts, isLoading, error } = usePosts({
    category: currentCategory,
    search: searchQuery || undefined,
    sortBy
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          toast.success('새로운 게시글이 등록되었습니다! 🎉');
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          // Silently update without notification for likes/comments
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Post Card Component with Vibe functionality
  const PostCard = ({ post }: { post: typeof posts[0] }) => {
    const navigate = useNavigate();
    const { data: isVibed, isLoading: vibeLoading } = useIsPostVibed(post.id);
    const vibePostMutation = useVibePost();

    const handleVibe = () => {
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }
      vibePostMutation.mutate({ 
        postId: post.id, 
        isVibed: !!isVibed 
      });
    };

    const getCategoryColor = (category: string) => {
      const categoryData = loungeCategories.find(cat => cat.value === category);
      return categoryData?.color || "bg-muted/50 text-muted-foreground";
    };

    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(post.category)}`}>
                  #{post.category || '일반'}
                </Badge>
              </div>
              <CardTitle 
                className="text-xl hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                {post.title}
              </CardTitle>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.profiles?.username || post.profiles?.full_name || '익명'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {post.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1 transition-colors ${
                  isVibed 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'hover:text-red-500'
                }`}
                onClick={handleVibe}
                disabled={vibeLoading || vibePostMutation.isPending}
              >
                <Heart className={`w-4 h-4 ${isVibed ? 'fill-current' : ''}`} />
                {post.vibe_count || 0}
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.comment_count || 0}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              읽어보기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PostsSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
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
        <h3 className="text-xl font-semibold mb-2">아직 게시글이 없습니다</h3>
        <p className="text-muted-foreground mb-6">
          첫 번째 게시글을 작성해서 커뮤니티를 시작해보세요!
        </p>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          첫 게시글 작성하기
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
            Vibe Lounge
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            코딩과 관련된 라이프스타일과 바이브를 자유롭게 공유하는 커뮤니티 공간
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="게시글 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {loungeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 ${
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                <PlusCircle className="w-4 h-4 mr-2" />
                새 글 작성하기
              </Button>

              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">통계</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">전체 게시글</span>
                    <span className="font-medium">{posts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">현재 카테고리</span>
                    <span className="font-medium">
                      {activeCategory === 'all' ? '전체' : 
                       loungeCategories.find(cat => cat.id === activeCategory)?.name || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <PostsSkeleton />
            ) : error ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">게시글을 불러올 수 없습니다</h3>
                  <p className="text-muted-foreground mb-6">
                    네트워크 연결을 확인하고 다시 시도해주세요.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            ) : !posts || posts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {/* Load More Button */}
                <div className="text-center pt-8">
                  <Button variant="outline" className="hover:bg-primary/10">
                    더 많은 게시글 보기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Lounge;