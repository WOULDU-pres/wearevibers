import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  /**
   * Desktop: inline search in header
   * Mobile: fullscreen overlay
   */
  variant?: "desktop" | "mobile";
}

interface SearchResult {
  id: string;
  type: "project" | "tip" | "user" | "post";
  title: string;
  description?: string;
  url: string;
  metadata?: {
    author?: string;
    tags?: string[];
    category?: string;
  };
}

// Mock search results - replace with actual search hook
const mockSearchResults = (query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  return [
    {
      id: "1",
      type: "project",
      title: "React Dashboard with TypeScript",
      description: "A modern admin dashboard built with React, TypeScript, and Tailwind CSS",
      url: "/projects/1",
      metadata: {
        author: "johndoe",
        tags: ["React", "TypeScript", "Dashboard"]
      }
    },
    {
      id: "2", 
      type: "tip",
      title: "CSS Grid vs Flexbox: When to Use Each",
      description: "Complete guide to choosing between CSS Grid and Flexbox",
      url: "/tips/2",
      metadata: {
        author: "janedoe",
        category: "css-tricks"
      }
    },
    {
      id: "3",
      type: "user",
      title: "John Doe",
      description: "Full-stack developer specializing in React and Node.js",
      url: "/members/johndoe",
      metadata: {
        tags: ["React", "Node.js", "Full-stack"]
      }
    }
  ].filter(result => 
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description?.toLowerCase().includes(query.toLowerCase())
  );
};

export default function GlobalSearch({ 
  className, 
  placeholder = "Search projects, tips, users...",
  variant = "desktop"
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Perform search with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      const searchResults = mockSearchResults(query);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery("");
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project': return '🚀';
      case 'tip': return '💡';
      case 'user': return '👤';
      case 'post': return '📝';
      default: return '📄';
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'project': return '프로젝트';
      case 'tip': return '팁';
      case 'user': return '사용자';
      case 'post': return '게시글';
      default: return '콘텐츠';
    }
  };

  if (variant === "mobile") {
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("lg:hidden hover:bg-accent", className)}
          onClick={() => setIsOpen(true)}
          aria-label="검색 열기"
        >
          <Search className="w-5 h-5" />
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 gap-0">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10 h-12 text-base bg-muted/50 border-0 focus-visible:ring-1"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">검색 중...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">{getResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {result.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getResultTypeLabel(result.type)}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.metadata?.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.metadata.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() && !isSearching ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleSearch()}
                  >
                    고급 검색 페이지로 이동
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-primary mb-2">
                    무엇을 찾고 계신가요?
                  </p>
                  <p className="text-muted-foreground text-sm">
                    프로젝트, 팁, 사용자를 검색해보세요
                  </p>
                </div>
              )}

              {query.trim() && (
                <>
                  <Separator className="my-4" />
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/50 hover:border-primary hover:bg-primary/10"
                    onClick={() => handleSearch()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    "{query}" 전체 검색
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop variant
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 bg-muted/50 border-border/50 focus:border-primary/50 focus-visible:ring-1"
        />
      </div>

      {/* Desktop dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">검색 중...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground truncate">
                          {result.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {getResultTypeLabel(result.type)}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <>
                  <Separator className="my-2" />
                  <button
                    onClick={() => handleSearch()}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 text-primary">
                      <Search className="w-4 h-4" />
                      <span className="text-sm font-medium">"{query}" 전체 검색</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          ) : query.trim() && !isSearching ? (
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">검색 결과가 없습니다.</p>
              <Button size="sm" variant="outline" onClick={() => handleSearch()}>
                고급 검색
              </Button>
            </div>
          ) : (
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-muted-foreground">
                프로젝트, 팁, 사용자를 검색해보세요
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}