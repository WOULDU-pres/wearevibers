import { useState, useCallback } from "react";

interface ShareTrackingData {
  projectId: string;
  shareType: 'copy_link' | 'direct_link';
  userAgent?: string;
  referrer?: string;
}

interface UseShareProjectProps {
  projectId: string;
  projectTitle: string;
}

export const useShareProject = ({ projectId, _projectTitle }: UseShareProjectProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 공유 URL 생성
  const generateShareUrl = useCallback((projectId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/projects/${projectId}?shared=true`;
  }, []);

  // 공유 추적 API 호출 (향후 구현 예정)
  const trackShare = useCallback(async (shareData: ShareTrackingData) => {
    try {
      setIsLoading(true);
      
      // Supabase를 통한 프로젝트 공유 구현
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError || !projectData) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      // 공유 URL 생성 (현재 도메인 기반)
      const shareUrl = `${window.location.origin}/projects/${projectId}`;
      
      // Web Share API 지원 확인
      if (navigator.share) {
        await navigator.share({
          title: projectData.title,
          text: projectData.description,
          url: shareUrl,
        });
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(shareUrl);
      }

      // 공유 활동 기록 (선택적)
      const { error: insertError } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          platform: shareData.platform,
          shared_at: new Date().toISOString(),
          user_id: shareData.userId || null
        });

      if (insertError) {
        console.warn('공유 기록 저장 실패:', insertError.message);
      }

      // 공유 카운트 업데이트
      setShareCount(prev => prev + 1);
      
      console.warn('Share tracked:', shareData);
    } catch (error) {
      console.error('Failed to track share:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 공유 모달 열기
  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  // 공유 모달 닫기
  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  // 링크 복사 핸들러
  const handleCopyLink = useCallback(() => {
    trackShare({
      projectId,
      shareType: 'copy_link',
    });
  }, [trackShare, projectId]);

  // 직접 링크 열기 핸들러
  const handleDirectLink = useCallback(() => {
    trackShare({
      projectId,
      shareType: 'direct_link',
    });
  }, [trackShare, projectId]);

  const shareUrl = generateShareUrl(projectId);

  return {
    // State
    isShareModalOpen,
    shareCount,
    isLoading,
    shareUrl,
    
    // Actions
    openShareModal,
    closeShareModal,
    handleCopyLink,
    handleDirectLink,
  };
};

export default useShareProject;