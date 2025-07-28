import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  RotateCcw,
  Settings,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface FilterOptions {
  techStack: string[];
  difficulty: number[];
  category: string[];
  dateRange: [Date | null, Date | null];
  sortBy: 'newest' | 'popular' | 'trending' | 'relevance';
  contentTypes: ('projects' | 'tips' | 'users')[];
  techStackOperator: 'AND' | 'OR';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  className?: string;
}

const techTags = [
  "React", "TypeScript", "Node.js", "Python", "Vue.js", "Angular",
  "Next.js", "Express", "MongoDB", "PostgreSQL", "Docker", "AWS",
  "Tailwind CSS", "JavaScript", "Java", "C++", "Go", "Rust"
];

const categories = [
  { value: "productivity", label: "생산성" },
  { value: "css-tricks", label: "CSS 트릭" },
  { value: "git-flow", label: "Git 워크플로우" },
  { value: "ui-ux", label: "UI/UX" },
  { value: "backend", label: "백엔드" },
  { value: "frontend", label: "프론트엔드" },
  { value: "mobile", label: "모바일" },
  { value: "ai", label: "AI/ML" },
  { value: "design", label: "디자인" }
];

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "trending", label: "트렌딩" },
  { value: "relevance", label: "관련도순" }
];

const contentTypeOptions = [
  { value: "projects", label: "프로젝트" },
  { value: "tips", label: "팁" },
  { value: "users", label: "사용자" }
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(filters.dateRange[0] || undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.dateRange[1] || undefined);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTechTag = (tag: string) => {
    const newTechStack = filters.techStack.includes(tag)
      ? filters.techStack.filter(t => t !== tag)
      : [...filters.techStack, tag];
    updateFilters({ techStack: newTechStack });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category];
    updateFilters({ category: newCategories });
  };

  const toggleContentType = (type: 'projects' | 'tips' | 'users') => {
    const newContentTypes = filters.contentTypes.includes(type)
      ? filters.contentTypes.filter(t => t !== type)
      : [...filters.contentTypes, type];
    updateFilters({ contentTypes: newContentTypes });
  };

  const handleDateRangeChange = () => {
    updateFilters({ 
      dateRange: [dateFrom || null, dateTo || null] 
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.techStack.length > 0) count++;
    if (filters.category.length > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    if (filters.contentTypes.length !== 3) count++;
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-medium">고급 필터</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                초기화
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Content Types */}
          <div>
            <Label className="text-sm font-medium mb-2 block">콘텐츠 타입</Label>
            <div className="flex flex-wrap gap-2">
              {contentTypeOptions.map((type) => (
                <Badge 
                  key={type.value}
                  variant={filters.contentTypes.includes(type.value as any) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.contentTypes.includes(type.value as any)
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => toggleContentType(type.value as any)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sort By */}
          <div>
            <Label className="text-sm font-medium mb-2 block">정렬 기준</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value: any) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tech Stack */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">기술 스택</Label>
              <div className="flex items-center gap-2">
                <Select 
                  value={filters.techStackOperator} 
                  onValueChange={(value: 'AND' | 'OR') => updateFilters({ techStackOperator: value })}
                >
                  <SelectTrigger className="w-16 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                {filters.techStack.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => updateFilters({ techStack: [] })}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {techTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant={filters.techStack.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.techStack.includes(tag)
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => toggleTechTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">카테고리</Label>
              {filters.category.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFilters({ category: [] })}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge 
                  key={category.value}
                  variant={filters.category.includes(category.value) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.category.includes(category.value)
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => toggleCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Difficulty Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">난이도 레벨</Label>
              {filters.difficulty.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFilters({ difficulty: [] })}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <Slider
                value={filters.difficulty.length > 0 ? filters.difficulty : [1, 5]}
                onValueChange={(value) => updateFilters({ difficulty: value })}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>초급 (1)</span>
                <span>중급 (3)</span>
                <span>고급 (5)</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">기간</Label>
              {(filters.dateRange[0] || filters.dateRange[1]) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    updateFilters({ dateRange: [null, null] });
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: ko }) : "시작일"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => {
                      setDateFrom(date);
                      handleDateRangeChange();
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: ko }) : "종료일"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => {
                      setDateTo(date);
                      handleDateRangeChange();
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};