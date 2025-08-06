import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AvatarWithOnlineStatus, OnlineCount } from "@/components/OnlineStatus";
import { FollowButton } from "@/components/FollowButton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, Users, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { 
  useIsFollowing, 
  useToggleFollow, 
  useOnlineUsersCount,
} from "@/hooks/useFollow";
import { useUserTotalVibes } from "@/hooks/useVibes";
import type { Tables } from "@/lib/supabase-types";

const techTags = [
  "React", "TypeScript", "Node.js", "Python", "Vue.js", "Angular",
  "Next.js", "Express", "MongoDB", "PostgreSQL", "Docker", "AWS"
];

type Profile = Tables<'profiles'>;

type SortOption = 'newest' | 'followers' | 'projects' | 'online';
type FilterOption = 'all' | 'online' | 'following';

const SORT_OPTIONS = {
  newest: { label: '최신 가입', value: 'newest' },
  followers: { label: '팔로워 많은 순', value: 'followers' },
  projects: { label: '프로젝트 많은 순', value: 'projects' },
  online: { label: '온라인 우선', value: 'online' },
} as const;

const FILTER_OPTIONS = {
  all: { label: '전체', value: 'all' },
  online: { label: '온라인', value: 'online' },
  following: { label: '팔로잉', value: 'following' },
} as const;

const Members = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Hooks moved before early return
  const { data: onlineCount } = useOnlineUsersCount();
  const toggleFollow = useToggleFollow();

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // fetchMembers moved before early return to ensure consistent hook calls
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      console.warn('🔍 Starting Members query with filters:', { sortBy, filterBy });
      
      // Create a Promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RLS_TIMEOUT: Members query timed out - likely RLS permission issue'));
        }, 5000);
      });

      // First, try a very simple query to test RLS with timeout
      console.warn('🧪 Testing basic profiles table access...');
      
      const testQueryPromise = supabase
        .from('profiles')
        .select('id, username')
        .limit(1);
      
      // Race between the query and timeout
      const testQuery = await Promise.race([testQueryPromise, timeoutPromise]);
      
      console.warn('🧪 Basic profiles query result:', testQuery);
      
      if (testQuery.error) {
        console.error('❌ Basic profiles query failed:', testQuery.error);
        throw testQuery.error;
      }
      
      // If basic query works, proceed with full query
      console.warn('✅ Basic query successful, proceeding with full query...');
      
      let query = supabase
        .from('profiles')
        .select('*');

      // 필터 적용
      if (filterBy === 'online') {
        query = query.eq('is_online', true);
      } else if (filterBy === 'following' && user) {
        // 팔로잉하는 사용자들만 조회
        query = query.in('id', 
          supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)
        );
      }

      // 정렬 적용
      switch (sortBy) {
        case 'followers':
          query = query.order('follower_count', { ascending: false });
          break;
        case 'projects':
          query = query.order('project_count', { ascending: false });
          break;
        case 'online':
          query = query.order('is_online', { ascending: false })
                      .order('follower_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(50);

      console.warn('🔍 Executing full members query...');
      const fullQueryPromise = query;
      const { data, error } = await Promise.race([fullQueryPromise, timeoutPromise]);
      
      console.warn('📊 Full members query result:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Error fetching members:', error);
        
        // If it's a timeout error, set empty array to show EmptyState
        if (error.message?.includes('RLS_TIMEOUT')) {
          console.warn('🚨 RLS timeout detected - showing empty state instead of hanging forever');
          setMembers([]);
          return;
        }
        
        throw error;
      }

      console.warn('✅ Members query successful, setting data');
      setMembers(data || []);
    } catch (error) {
      console.error('💥 Members query failed:', error);
      
      // If it's a timeout error, set empty array to show EmptyState
      if (error.message?.includes('RLS_TIMEOUT')) {
        console.warn('🚨 RLS timeout detected - showing empty state instead of hanging forever');
        setMembers([]);
        return;
      }
      
      console.error('Error in fetchMembers:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterBy, user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 필터링된 멤버 목록
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(member => 
        member.username?.toLowerCase().includes(query) ||
        member.full_name?.toLowerCase().includes(query) ||
        member.bio?.toLowerCase().includes(query)
      );
    }

    // 기술 스택 필터링
    if (selectedTechTags.length > 0) {
      filtered = filtered.filter(member => 
        member.tech_stack && 
        selectedTechTags.some(tag => member.tech_stack.includes(tag))
      );
    }

    return filtered;
  }, [members, searchQuery, selectedTechTags]);

  // Early return after all hooks are declared
  if (isPageLoading) {
    return <LoadingScreen message="멤버 로딩중..." />;
  }

  const handleTechTagToggle = (tag: string) => {
    setSelectedTechTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    try {
      await toggleFollow.mutateAsync({ userId, isFollowing });
      // 팔로우 상태 변경 후 목록 갱신
      if (filterBy === 'following') {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // 멤버 카드 컴포넌트
  const MemberCard = ({ 
    member, 
    currentUser,
    onFollowToggle,
  }: { 
    member: Profile; 
    currentUser: { id: string } | null; 
    onFollowToggle: (userId: string, isFollowing: boolean) => Promise<void>; 
  }) => {
    const { data: isFollowing } = useIsFollowing(member.id);
    const { data: totalVibes } = useUserTotalVibes(member.id);

    const isOwnProfile = currentUser?.id === member.id;

    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <AvatarWithOnlineStatus 
              isOnline={member.is_online || false}
              onlineStatusSize="md"
            >
              <Avatar className="w-16 h-16">
                <AvatarImage src={member.avatar_url || ''} alt={member.username} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {(member.full_name || member.username)?.slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
            </AvatarWithOnlineStatus>
            
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

          {/* 기술 스택 */}
          {member.tech_stack && member.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {member.tech_stack.slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {member.tech_stack.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{member.tech_stack.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* 활동 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {member.project_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">프로젝트</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {member.follower_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">팔로워</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary">
                {totalVibes || 0}
              </div>
              <div className="text-xs text-muted-foreground">좋아요</div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              프로필 보기
            </Button>
            {!isOwnProfile && currentUser && (
              <FollowButton
                userId={member.id}
                isFollowing={isFollowing || false}
                onToggle={onFollowToggle}
                size="sm"
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
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
          <h1 className="text-4xl font-bold text-primary font-semibold mb-4">
            Members,
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            창의적인 개발자들과 연결되고, 함께 성장하는 커뮤니티
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {filteredMembers.length}명의 멤버
              </span>
            </div>
            {onlineCount !== undefined && (
              <OnlineCount count={onlineCount} size="sm" />
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="멤버 검색하기..." 
                className="pl-10 bg-muted/50 border-border hover:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* 필터 옵션 */}
              {Object.entries(FILTER_OPTIONS).map(([key, option]) => (
                <Button 
                  key={key}
                  variant={filterBy === option.value ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterBy(option.value as FilterOption)}
                  className={filterBy === option.value ? "bg-primary text-primary-foreground border-0" : ""}
                >
                  {option.label}
                </Button>
              ))}
              
              {/* 정렬 옵션 */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                    <SelectItem key={key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tech Tags Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">기술 스택으로 필터링:</p>
              {selectedTechTags.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTechTags([])}
                  className="h-6 px-2 text-xs"
                >
                  초기화
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {techTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant={selectedTechTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTechTags.includes(tag) 
                      ? "bg-primary text-primary-foreground border-0" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => handleTechTagToggle(tag)}
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
        ) : filteredMembers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                currentUser={user}
                onFollowToggle={handleFollowToggle}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredMembers.length > 0 && members.length >= 50 && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => fetchMembers()}
            >
              더 많은 멤버 보기
            </Button>
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {!loading && searchQuery.trim() && filteredMembers.length === 0 && members.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              "{searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedTechTags([]);
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Members;