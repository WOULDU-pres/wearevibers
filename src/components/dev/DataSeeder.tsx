/**
 * 개발용 데이터 시딩 컴포넌트
 * 개발 환경에서만 표시되며, 시드 데이터 생성/삭제 기능 제공
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Loader2, Database, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  createSeedData, 
  clearSeedData, 
  checkDatabaseStatus,
  type SeedDataResult 
} from '@/lib/seedData';

interface DatabaseStats {
  profiles: number;
  projects: number;
  tips: number;
  posts: number;
}

export function DataSeeder() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats>({
    profiles: 0,
    projects: 0,
    tips: 0,
    posts: 0,
  });
  const [lastResult, setLastResult] = useState<SeedDataResult | null>(null);

  // 개발 환경에서만 표시
  if (import.meta.env.PROD) {
    return null;
  }

  const loadStats = async () => {
    try {
      const newStats = await checkDatabaseStatus();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  // useEffect(() => {
  //   loadStats();
  // }, []);

  const handleCreateSeedData = async () => {
    setIsLoading(true);
    setLastResult(null);
    
    try {
      const _result = await createSeedData();
      setLastResult(_result);
      
      if (result.success) {
        toast.success(result.message);
        await loadStats(); // 통계 새로고침
      } else {
        toast.error(result.message);
        console.error('Seed data creation errors:', result.errors);
      }
    } catch (error) {
      toast.error('시드 데이터 생성 중 오류가 발생했습니다.');
      console.error('Seed data creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSeedData = async () => {
    if (!console.warn("CONFIRM:",'정말로 기존 시드 데이터를 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setLastResult(null);
    
    try {
      const _result = await clearSeedData();
      setLastResult(_result);
      
      if (result.success) {
        toast.success(result.message);
        await loadStats(); // 통계 새로고침
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('데이터 삭제 중 오류가 발생했습니다.');
      console.error('Clear data failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRecords = stats.profiles + stats.projects + stats.tips + stats.posts;
  const isEmpty = totalRecords === 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          개발용 데이터 시더
          <Badge variant="outline">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 현재 데이터베이스 상태 */}
        <div>
          <h3 className="text-sm font-medium mb-3">현재 데이터베이스 상태</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.profiles}</div>
              <div className="text-sm text-muted-foreground">프로필</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.projects}</div>
              <div className="text-sm text-muted-foreground">프로젝트</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.tips}</div>
              <div className="text-sm text-muted-foreground">팁</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.posts}</div>
              <div className="text-sm text-muted-foreground">포스트</div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              총 {totalRecords}개 레코드
              {isEmpty && " (데이터베이스가 비어있음)"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateSeedData}
            disabled={isLoading}
            className="flex-1"
            variant={isEmpty ? "default" : "outline"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            시드 데이터 생성
          </Button>
          
          {!isEmpty && (
            <Button
              onClick={handleClearSeedData}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              데이터 삭제
            </Button>
          )}
        </div>

        {/* 결과 표시 */}
        {lastResult && (
          <div className={`p-4 rounded-lg ${
            lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${
              lastResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {lastResult.message}
            </div>
            
            {lastResult.data && (
              <div className="mt-2 text-sm text-muted-foreground">
                생성됨: 프로필 {lastResult.data.profiles}개, 프로젝트 {lastResult.data.projects}개, 
                팁 {lastResult.data.tips}개, 포스트 {lastResult.data.posts}개
              </div>
            )}
            
            {lastResult.errors && lastResult.errors.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium text-red-800">오류:</div>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {lastResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 도움말 */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
          <strong>💡 도움말:</strong><br />
          • 시드 데이터는 현재 로그인한 사용자로 생성됩니다<br />
          • 프로젝트 5개, 팁 3개, 포스트 3개가 생성됩니다<br />
          • 기존 데이터를 삭제하고 새로 생성할 수 있습니다<br />
          • 이 컴포넌트는 개발 환경에서만 표시됩니다
        </div>
      </CardContent>
    </Card>
  );
}