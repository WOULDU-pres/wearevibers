import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { authAwareRetry } from '@/lib/authErrorHandler';

export interface UserStats {
  projectCount: number;
  tipCount: number;
  postCount: number;
  commentCount: number;
  followerCount: number;
  followingCount: number;
  totalVibes: number;
  totalVibesReceived: number;
  totalVibesGiven: number;
  joinDate: string;
  lastActiveDate?: string;
  activityScore: number;
}

// 사용자의 종합 활동 통계 조회
export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async (): Promise<UserStats> => {
      if (!userId) throw new Error('User ID is required');

      // 병렬로 모든 통계 데이터 조회
      const [
        profileData,
        projectsData,
        tipsData,
        postsData,
        commentsData,
        vibesGivenData,
        vibesReceivedData,
      ] = await Promise.all([
        // 프로필 정보 (팔로워/팔로잉 수, 가입일 등)
        supabase
          .from('profiles')
          .select('follower_count, following_count, created_at, last_seen_at')
          .eq('id', userId)
          .single(),

        // 프로젝트 수와 받은 좋아요 수
        supabase
          .from('projects')
          .select('id, vibe_count')
          .eq('user_id', userId),

        // 팁 수와 받은 좋아요 수
        supabase
          .from('tips')
          .select('id, vibe_count')
          .eq('user_id', userId),

        // 포스트 수와 받은 좋아요 수
        supabase
          .from('posts')
          .select('id, vibe_count')
          .eq('user_id', userId),

        // 댓글 수와 받은 좋아요 수
        supabase
          .from('comments')
          .select('id, vibe_count')
          .eq('user_id', userId),

        // 사용자가 준 좋아요 수
        supabase
          .from('vibes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),

        // 사용자가 받은 총 좋아요 수 (모든 콘텐츠 유형)
        Promise.all([
          supabase
            .from('vibes')
            .select('id', { count: 'exact', head: true })
            .in('content_id', 
              supabase.from('projects').select('id').eq('user_id', userId)
            )
            .eq('content_type', 'project'),
          supabase
            .from('vibes')
            .select('id', { count: 'exact', head: true })
            .in('content_id', 
              supabase.from('tips').select('id').eq('user_id', userId)
            )
            .eq('content_type', 'tip'),
          supabase
            .from('vibes')
            .select('id', { count: 'exact', head: true })
            .in('content_id', 
              supabase.from('posts').select('id').eq('user_id', userId)
            )
            .eq('content_type', 'post'),
          supabase
            .from('vibes')
            .select('id', { count: 'exact', head: true })
            .in('content_id', 
              supabase.from('comments').select('id').eq('user_id', userId)
            )
            .eq('content_type', 'comment'),
        ]),
      ]);

      // 에러 체크
      if (profileData.error) throw profileData.error;
      if (projectsData.error) throw projectsData.error;
      if (tipsData.error) throw tipsData.error;
      if (postsData.error) throw postsData.error;
      if (commentsData.error) throw commentsData.error;
      if (vibesGivenData.error) throw vibesGivenData.error;

      // 통계 계산
      const projectCount = projectsData.data?.length || 0;
      const tipCount = tipsData.data?.length || 0;
      const postCount = postsData.data?.length || 0;
      const commentCount = commentsData.data?.length || 0;

      // 받은 좋아요 수 계산
      const totalVibesReceived = vibesReceivedData.reduce((total, result) => {
        if (result.error) return total;
        return total + (result.count || 0);
      }, 0);

      // 콘텐츠별 좋아요 수 합계 (추가 검증용)
      const projectVibes = projectsData.data?.reduce((sum, project) => sum + (project.vibe_count || 0), 0) || 0;
      const tipVibes = tipsData.data?.reduce((sum, tip) => sum + (tip.vibe_count || 0), 0) || 0;
      const postVibes = postsData.data?.reduce((sum, post) => sum + (post.vibe_count || 0), 0) || 0;
      const commentVibes = commentsData.data?.reduce((sum, comment) => sum + (comment.vibe_count || 0), 0) || 0;
      
      const totalVibes = projectVibes + tipVibes + postVibes + commentVibes;

      // 활동 점수 계산 (가중치 적용)
      const activityScore = calculateActivityScore({
        projectCount,
        tipCount,
        postCount,
        commentCount,
        followerCount: profileData.data?.follower_count || 0,
        totalVibesReceived,
        totalVibesGiven: vibesGivenData.count || 0,
      });

      return {
        projectCount,
        tipCount,
        postCount,
        commentCount,
        followerCount: profileData.data?.follower_count || 0,
        followingCount: profileData.data?.following_count || 0,
        totalVibes,
        totalVibesReceived,
        totalVibesGiven: vibesGivenData.count || 0,
        joinDate: profileData.data?.created_at || '',
        lastActiveDate: profileData.data?.last_seen_at || undefined,
        activityScore,
      };
    },
    enabled: !!userId,
    retry: authAwareRetry,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });
};

// 활동 점수 계산 함수
const calculateActivityScore = (stats: {
  projectCount: number;
  tipCount: number;
  postCount: number;
  commentCount: number;
  followerCount: number;
  totalVibesReceived: number;
  totalVibesGiven: number;
}) => {
  const {
    projectCount,
    tipCount,
    postCount,
    commentCount,
    followerCount,
    totalVibesReceived,
    totalVibesGiven,
  } = stats;

  // 가중치 설정
  const weights = {
    project: 10,     // 프로젝트가 가장 높은 가중치
    tip: 5,          // 팁 작성
    post: 3,         // 포스트 작성
    comment: 1,      // 댓글 작성
    follower: 2,     // 팔로워 수
    vibesReceived: 0.5, // 받은 좋아요
    vibesGiven: 0.2,    // 준 좋아요
  };

  const score = 
    projectCount * weights.project +
    tipCount * weights.tip +
    postCount * weights.post +
    commentCount * weights.comment +
    followerCount * weights.follower +
    totalVibesReceived * weights.vibesReceived +
    totalVibesGiven * weights.vibesGiven;

  return Math.round(score);
};

// 사용자의 월별 활동 통계
export const useUserMonthlyStats = (userId: string, months: number = 6) => {
  return useQuery({
    queryKey: ['user-monthly-stats', userId, months],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - months);

      const [projectsData, tipsData, postsData, commentsData] = await Promise.all([
        supabase
          .from('projects')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', monthsAgo.toISOString()),

        supabase
          .from('tips')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', monthsAgo.toISOString()),

        supabase
          .from('posts')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', monthsAgo.toISOString()),

        supabase
          .from('comments')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', monthsAgo.toISOString()),
      ]);

      // 에러 체크
      if (projectsData.error) throw projectsData.error;
      if (tipsData.error) throw tipsData.error;
      if (postsData.error) throw postsData.error;
      if (commentsData.error) throw commentsData.error;

      // 월별 데이터 그룹화
      const monthlyData = Array.from({ length: months }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        return {
          month: monthKey,
          monthName: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
          projects: 0,
          tips: 0,
          posts: 0,
          comments: 0,
          total: 0,
        };
      }).reverse();

      // 데이터 집계
      const allData = [
        ...projectsData.data?.map(item => ({ ...item, type: 'project' })) || [],
        ...tipsData.data?.map(item => ({ ...item, type: 'tip' })) || [],
        ...postsData.data?.map(item => ({ ...item, type: 'post' })) || [],
        ...commentsData.data?.map(item => ({ ...item, type: 'comment' })) || [],
      ];

      allData.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthData = monthlyData.find(m => m.month === monthKey);
        
        if (monthData) {
          monthData[item.type as keyof typeof monthData]++;
          monthData.total++;
        }
      });

      return monthlyData;
    },
    enabled: !!userId,
    retry: authAwareRetry,
    staleTime: 10 * 60 * 1000, // 10분간 캐시
  });
};

// 최근 활동 조회
export const useRecentActivity = (userId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activity', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const [projectsData, tipsData, postsData, commentsData] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),

        supabase
          .from('tips')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),

        supabase
          .from('posts')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),

        supabase
          .from('comments')
          .select('id, content, created_at, content_type, content_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
      ]);

      // 에러 체크
      if (projectsData.error) throw projectsData.error;
      if (tipsData.error) throw tipsData.error;
      if (postsData.error) throw postsData.error;
      if (commentsData.error) throw commentsData.error;

      // 모든 활동을 하나의 배열로 합치고 날짜순 정렬
      const allActivities = [
        ...projectsData.data?.map(item => ({ ...item, type: 'project' as const })) || [],
        ...tipsData.data?.map(item => ({ ...item, type: 'tip' as const })) || [],
        ...postsData.data?.map(item => ({ ...item, type: 'post' as const })) || [],
        ...commentsData.data?.map(item => ({ ...item, type: 'comment' as const })) || [],
      ];

      return allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    },
    enabled: !!userId,
    retry: authAwareRetry,
    staleTime: 2 * 60 * 1000, // 2분간 캐시
  });
};

// 커뮤니티 랭킹에서의 사용자 위치
export const useUserRanking = (userId: string) => {
  return useQuery({
    queryKey: ['user-ranking', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      // 전체 사용자 중에서 현재 사용자의 랭킹 조회
      const [followerRank, projectRank, vibeRank] = await Promise.all([
        // 팔로워 수 랭킹
        supabase
          .from('profiles')
          .select('follower_count')
          .order('follower_count', { ascending: false }),

        // 프로젝트 수 랭킹
        supabase
          .from('profiles')
          .select('project_count')
          .order('project_count', { ascending: false }),

        // 받은 좋아요 수 랭킹 (복잡한 쿼리이므로 간단히 처리)
        supabase
          .from('profiles')
          .select('id, follower_count, project_count')
          .order('follower_count', { ascending: false })
          .limit(1000), // 상위 1000명만 조회하여 성능 최적화
      ]);

      if (followerRank.error) throw followerRank.error;
      if (projectRank.error) throw projectRank.error;
      if (vibeRank.error) throw vibeRank.error;

      // 사용자 랭킹 계산
      const followerRanking = followerRank.data.findIndex(user => user.follower_count !== null) + 1;
      const projectRanking = projectRank.data.findIndex(user => user.project_count !== null) + 1;

      return {
        followerRanking: followerRanking || null,
        projectRanking: projectRanking || null,
        totalUsers: followerRank.data.length,
      };
    },
    enabled: !!userId,
    retry: authAwareRetry,
    staleTime: 30 * 60 * 1000, // 30분간 캐시
  });
};