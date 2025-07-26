import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, Calendar, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase-types";

type Post = Tables<'posts'>;

const loungeCategories = [
  { name: "데스크테리어", count: 0, color: "bg-primary/10 text-primary" },
  { name: "코딩플레이리스트", count: 0, color: "bg-secondary/10 text-secondary" },
  { name: "IDE테마", count: 0, color: "bg-accent/10 text-accent" },
  { name: "자유게시판", count: 0, color: "bg-muted/50 text-muted-foreground" },
];

const Lounge = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
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
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
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
        <Button className="bg-gradient-vibe hover:opacity-90 text-white border-0">
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
          <div className="lg:col-span-3">
            {loading ? (
              <PostsSkeleton />
            ) : posts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{post.category || '일반'}
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
                          {post.profiles?.username || '익명'}
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
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:text-red-500">
                            <Heart className="w-4 h-4" />
                            {post.vibe_count || 0}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comment_count || 0}
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
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Lounge;