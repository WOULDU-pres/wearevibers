import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Calendar, Heart, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase-types";

const techTags = [
  "React", "TypeScript", "Node.js", "Python", "Vue.js", "Angular",
  "Next.js", "Express", "MongoDB", "PostgreSQL", "Docker", "AWS"
];

type Profile = Tables<'profiles'>;

const Members = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error in fetchMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  const MembersSkeleton = () => (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-1 mb-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">아직 멤버가 없습니다</h3>
        <p className="text-muted-foreground mb-6">
          첫 번째 멤버가 되어 커뮤니티를 시작해보세요!
        </p>
        <Button className="bg-gradient-vibe hover:opacity-90 text-white border-0">
          회원가입하기
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
        {loading ? (
          <MembersSkeleton />
        ) : members.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={member.avatar_url || ''} alt={member.username} />
                        <AvatarFallback className="bg-gradient-vibe text-white text-lg font-bold">
                          {(member.full_name || member.username)?.slice(0, 2) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {member.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{member.full_name || member.username}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {member.bio || '자기소개가 없습니다.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(member.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} 가입
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.tech_stack && member.tech_stack.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>프로젝트 {member.project_count || 0}개</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      {member.follower_count || 0}
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
        )}

        {/* Load More */}
        {!loading && members.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              더 많은 멤버 보기
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Members;