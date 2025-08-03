import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { AdvancedFilters, FilterOptions } from '@/components/AdvancedFilters';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search as SearchIcon, 
  Filter, 
  Grid3X3, 
  List, 
  Users, 
  Lightbulb, 
  FolderOpen,
  Heart,
  Eye,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const defaultFilters: FilterOptions = {
  techStack: [],
  difficulty: [],
  category: [],
  dateRange: [null, null],
  sortBy: 'relevance',
  contentTypes: ['projects', 'tips', 'users'],
  techStackOperator: 'OR'
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'tips' | 'users'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { data: searchResults, isLoading, error } = useGlobalSearch({
    query,
    filters: {
      ...filters,
      contentTypes: activeTab === 'all' ? filters.contentTypes : [activeTab]
    }
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
    }
  }, [searchParams, query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
  };

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return searchResults.projects.length + searchResults.tips.length + searchResults.users.length;
  };

  const getTabCounts = () => {
    if (!searchResults) return { projects: 0, tips: 0, users: 0 };
    return {
      projects: searchResults.projects.length,
      tips: searchResults.tips.length,
      users: searchResults.users.length
    };
  };

  const ProjectCard = ({ project }: { project: Record<string, unknown> }) => (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
              <SearchHighlight 
                text={project.title} 
                searchTerm={query}
                className="font-semibold"
              />
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>by {project.profiles?.full_name || project.profiles?.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: ko })}</span>
            </div>
          </div>
          <Badge variant="outline" className="ml-2">
            <FolderOpen className="w-3 h-3 mr-1" />
            프로젝트
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <SearchSnippet 
          content={project.description || ''} 
          searchTerm={query}
          maxLength={150}
          className="text-muted-foreground mb-4"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {project.vibe_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.view_count || 0}
            </span>
          </div>
          <Button variant="outline" size="sm">
            자세히 보기 <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TipCard = ({ tip }: { tip: Record<string, unknown> }) => (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
              <SearchHighlight 
                text={tip.title} 
                searchTerm={query}
                className="font-semibold"
              />
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>by {tip.profiles?.full_name || tip.profiles?.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(tip.created_at), { addSuffix: true, locale: ko })}</span>
            </div>
          </div>
          <Badge variant="outline" className="ml-2">
            <Lightbulb className="w-3 h-3 mr-1" />
            팁
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <SearchSnippet 
          content={tip.content || ''} 
          searchTerm={query}
          maxLength={150}
          className="text-muted-foreground mb-4"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {tip.vibe_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tip.view_count || 0}
            </span>
          </div>
          <Button variant="outline" size="sm">
            자세히 보기 <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: Record<string, unknown> }) => (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar_url || ''} alt={user.username} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {(user.full_name || user.username)?.slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">
                <SearchHighlight 
                  text={user.full_name || user.username} 
                  searchTerm={query}
                />
              </h3>
              <Badge variant="outline" className="ml-2">
                <Users className="w-3 h-3 mr-1" />
                사용자
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              <SearchSnippet 
                content={user.bio || '자기소개가 없습니다.'} 
                searchTerm={query}
                maxLength={100}
              />
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{user.project_count || 0} 프로젝트</span>
              <span>{user.follower_count || 0} 팔로워</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ko })} 가입
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">
            프로필 보기 <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SearchSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
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
        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
        <p className="text-muted-foreground mb-6">
          "{query}"에 대한 검색 결과를 찾을 수 없습니다.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 검색어의 철자를 확인해보세요</p>
          <p>• 더 일반적인 검색어를 사용해보세요</p>
          <p>• 필터를 재설정해보세요</p>
        </div>
      </CardContent>
    </Card>
  );

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary font-semibold mb-4">
            검색 결과
          </h1>
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="프로젝트, 팁, 사용자 검색..."
            className="max-w-2xl"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  {query && (
                    <>
                      "<SearchHighlight text={query} searchTerm={query} />"에 대한 검색 결과
                    </>
                  )}
                </h2>
                {searchResults && (
                  <Badge variant="secondary">
                    총 {getTotalResults()}개
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  전체 ({getTotalResults()})
                </TabsTrigger>
                <TabsTrigger value="projects">
                  프로젝트 ({tabCounts.projects})
                </TabsTrigger>
                <TabsTrigger value="tips">
                  팁 ({tabCounts.tips})
                </TabsTrigger>
                <TabsTrigger value="users">
                  사용자 ({tabCounts.users})
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {isLoading ? (
                  <SearchSkeleton />
                ) : error ? (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-6 text-center">
                      <p className="text-destructive">검색 중 오류가 발생했습니다.</p>
                    </CardContent>
                  </Card>
                ) : !query ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur">
                    <CardContent className="p-12 text-center">
                      <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">검색어를 입력해주세요</h3>
                      <p className="text-muted-foreground">
                        프로젝트, 팁, 사용자를 검색할 수 있습니다.
                      </p>
                    </CardContent>
                  </Card>
                ) : getTotalResults() === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <TabsContent value="all" className="space-y-6">
                      {searchResults?.projects.slice(0, 3).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                      {searchResults?.tips.slice(0, 3).map((tip) => (
                        <TipCard key={tip.id} tip={tip} />
                      ))}
                      {searchResults?.users.slice(0, 3).map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6">
                      {searchResults?.projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </TabsContent>

                    <TabsContent value="tips" className="space-y-6">
                      {searchResults?.tips.map((tip) => (
                        <TipCard key={tip.id} tip={tip} />
                      ))}
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                      {searchResults?.users.map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;