// useSecurity.tsx - 보안 시스템 React 훅
// EPIC-04: 보안 및 안정성 - STORY-015

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type {
  Report,
  UserBlock,
  SecurityLog,
  CreateReportParams,
  ProcessReportParams,
  BlockUserParams,
  UnblockUserParams,
  ReportListResponse,
  BlockListResponse,
  ReportStatsResponse,
  SecurityMetrics
} from '@/types/security';

// ========================================
// 신고 관련 훅
// ========================================

/**
 * 신고 목록 조회
 */
export function useReports(options?: {
  status?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['reports', options],
    queryFn: async (): Promise<ReportListResponse> => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(id, username, avatar_url),
          resolver:profiles!resolved_by(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.content_type) {
        query = query.eq('content_type', options.content_type);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(`신고 목록 조회 실패: ${error.message}`);
      }

      return {
        reports: data || [],
        total_count: count || 0
      };
    },
    staleTime: 30000, // 30초간 캐시
  });
}

/**
 * 신고 제출
 */
export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateReportParams): Promise<Report> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_content_id: params.reported_content_id,
          content_type: params.content_type,
          reason: params.reason,
          description: params.description || null,
          status: 'pending'
        })
        .select(`
          *,
          reporter:profiles!reporter_id(id, username, avatar_url)
        `)
        .single();

      if (error) {
        throw new Error(`신고 제출 실패: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // 신고 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      
      toast({
        title: "신고 완료",
        description: "신고가 정상적으로 접수되었습니다. 검토 후 조치하겠습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "신고 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * 신고 처리 (관리자용)
 */
export function useProcessReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: ProcessReportParams): Promise<Report> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase
        .from('reports')
        .update({
          status: params.new_status,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
          resolution_note: params.resolution_note || null
        })
        .eq('id', params.report_id)
        .select(`
          *,
          reporter:profiles!reporter_id(id, username, avatar_url),
          resolver:profiles!resolved_by(id, username, avatar_url)
        `)
        .single();

      if (error) {
        throw new Error(`신고 처리 실패: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      
      toast({
        title: "신고 처리 완료",
        description: "신고가 성공적으로 처리되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "신고 처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * 신고 통계 조회
 */
export function useReportStats() {
  return useQuery({
    queryKey: ['report-stats'],
    queryFn: async (): Promise<ReportStatsResponse> => {
      const { data, error } = await supabase
        .from('reports')
        .select('status');

      if (error) {
        throw new Error(`신고 통계 조회 실패: ${error.message}`);
      }

      const stats = {
        total_reports: data.length,
        pending_reports: data.filter(r => r.status === 'pending').length,
        resolved_reports: data.filter(r => r.status === 'resolved').length,
        dismissed_reports: data.filter(r => r.status === 'dismissed').length,
      };

      return stats;
    },
    staleTime: 60000, // 1분간 캐시
  });
}

// ========================================
// 차단 관련 훅
// ========================================

/**
 * 차단 목록 조회
 */
export function useBlocks(options?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['blocks', options],
    queryFn: async (): Promise<BlockListResponse> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      let query = supabase
        .from('user_blocks')
        .select(`
          *,
          blocked_user:profiles!blocked_id(id, username, avatar_url, full_name)
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(`차단 목록 조회 실패: ${error.message}`);
      }

      return {
        blocks: data || [],
        total_count: count || 0
      };
    },
    staleTime: 30000, // 30초간 캐시
  });
}

/**
 * 사용자 차단
 */
export function useBlockUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: BlockUserParams): Promise<UserBlock> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 자기 자신을 차단하는 것 방지
      if (user.id === params.blocked_user_id) {
        throw new Error('자기 자신을 차단할 수 없습니다.');
      }

      const { data, error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: params.blocked_user_id,
          reason: params.reason || null
        })
        .select(`
          *,
          blocked_user:profiles!blocked_id(id, username, avatar_url, full_name)
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // unique constraint violation
          throw new Error('이미 차단된 사용자입니다.');
        }
        throw new Error(`사용자 차단 실패: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      
      // 차단된 사용자 관련 콘텐츠 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      
      toast({
        title: "차단 완료",
        description: `${data.blocked_user?.username || '사용자'}님을 차단했습니다.`,
      });
    },
    onError: (error) => {
      toast({
        title: "차단 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * 사용자 차단 해제
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UnblockUserParams): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', params.blocked_user_id);

      if (error) {
        throw new Error(`차단 해제 실패: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      
      // 차단 해제된 사용자 관련 콘텐츠 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      
      toast({
        title: "차단 해제 완료",
        description: "사용자 차단이 해제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "차단 해제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * 사용자 차단 상태 확인
 */
export function useIsUserBlocked(userId: string) {
  return useQuery({
    queryKey: ['is-blocked', userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('차단 상태 확인 오류:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!userId,
    staleTime: 300000, // 5분간 캐시
  });
}

// ========================================
// 보안 로그 및 메트릭 관련 훅
// ========================================

/**
 * 보안 로그 조회 (관리자용)
 */
export function useSecurityLogs(options?: {
  event_type?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['security-logs', options],
    queryFn: async (): Promise<SecurityLog[]> => {
      let query = supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.event_type) {
        query = query.eq('event_type', options.event_type);
      }
      if (options?.severity) {
        query = query.eq('severity', options.severity);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`보안 로그 조회 실패: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 60000, // 1분간 캐시
  });
}

/**
 * 보안 메트릭 조회 (관리자용)
 */
export function useSecurityMetrics() {
  return useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      // 일일/주간/월간 신고 수 계산
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [dailyReports, weeklyReports, monthlyReports] = await Promise.all([
        supabase
          .from('reports')
          .select('id', { count: 'exact' })
          .gte('created_at', oneDayAgo.toISOString()),
        supabase
          .from('reports')
          .select('id', { count: 'exact' })
          .gte('created_at', oneWeekAgo.toISOString()),
        supabase
          .from('reports')
          .select('id', { count: 'exact' })
          .gte('created_at', oneMonthAgo.toISOString()),
      ]);

      return {
        daily_reports: dailyReports.count || 0,
        weekly_reports: weeklyReports.count || 0,
        monthly_reports: monthlyReports.count || 0,
        spam_detection_rate: 0.85, // TODO: 실제 스팸 감지율 계산
        average_resolution_time: 24, // TODO: 실제 평균 해결 시간 계산
        block_effectiveness: 0.92, // TODO: 실제 차단 효과율 계산
      };
    },
    staleTime: 300000, // 5분간 캐시
  });
}