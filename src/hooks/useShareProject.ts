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

export const useShareProject = ({ projectId, projectTitle }: UseShareProjectProps) => {
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
      
      // TODO: API 엔드포인트 구현 후 실제 호출
      // const response = await fetch(`/api/projects/${projectId}/share`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...shareData,
      //     userAgent: navigator.userAgent,
      //     referrer: document.referrer,
      //   }),
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
      //   setShareCount(data.shareCount);
      // }

      // 임시로 로컬에서 카운트 증가
      setShareCount(prev => prev + 1);
      
      console.log('Share tracked:', shareData);
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
  }, [trackShare]);

  // 직접 링크 열기 핸들러
  const handleDirectLink = useCallback(() => {
    trackShare({
      projectId,
      shareType: 'direct_link',
    });
  }, [trackShare]);

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