import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  ArrowUpRight,
  History,
  Lightbulb
} from 'lucide-react';
import { useSearchSuggestions, getSearchHistory, addToSearchHistory, clearSearchHistory } from '@/hooks/useGlobalSearch';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력하세요...",
  className = '',
  showHistory = true,
  showSuggestions = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounceLocal(value, 300);
  const { data: suggestions = [] } = useSearchSuggestions(debouncedQuery);

  // Popular search terms (mock data - 실제로는 API에서 가져올 수 있음)
  const popularSearches = [
    "React", "TypeScript", "Next.js", "Tailwind CSS", 
    "Node.js", "Python", "Vue.js", "MongoDB"
  ];

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSearch(value.trim());
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query.trim());
      setSearchHistory(getSearchHistory());
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    handleSearch(suggestion);
  };

  const handleHistoryItemClick = (historyItem: string) => {
    onChange(historyItem);
    handleSearch(historyItem);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const removeHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  const hasContent = searchHistory.length > 0 || suggestions.length > 0 || popularSearches.length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4 bg-muted/50 border-border hover:border-primary/50 transition-colors"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && hasContent && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full z-50 border-border/50 bg-card/95 backdrop-blur shadow-lg"
        >
          <CardContent className="p-2 max-h-80 overflow-y-auto">
            {/* Search History */}
            {showHistory && searchHistory.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <History className="w-3 h-3" />
                    최근 검색
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    전체 삭제
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryItemClick(item)}
                      className="flex items-center justify-between px-2 py-1.5 text-sm hover:bg-muted/50 rounded cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => removeHistoryItem(item, e)}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </div>
            )}

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1 mb-2 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="w-3 h-3" />
                  검색 제안
                </div>
                <div className="space-y-1">
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted/50 rounded cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate">{suggestion}</span>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground ml-auto" />
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </div>
            )}

            {/* Popular Searches */}
            {!value && popularSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 py-1 mb-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  인기 검색어
                </div>
                <div className="flex flex-wrap gap-1 px-2">
                  {popularSearches.map((term) => (
                    <Badge
                      key={term}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Simple debounce hook implementation if not available
const useDebounceLocal = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};