import type { ReportReasonOption } from '@/types/security';

/**
 * 신고 사유 옵션
 * ReportDialog 컴포넌트에서 사용되는 신고 사유 목록
 */
export const REPORT_REASON_OPTIONS: ReportReasonOption[] = [
  {
    value: 'spam',
    label: '스팸/도배',
    description: '반복적이거나 무의미한 내용의 게시물'
  },
  {
    value: 'harassment',
    label: '괴롭힘/욕설',
    description: '타인을 모독하거나 괴롭히는 내용'
  },
  {
    value: 'hate_speech',
    label: '혐오 발언',
    description: '특정 집단에 대한 차별이나 혐오 표현'
  },
  {
    value: 'inappropriate_content',
    label: '부적절한 콘텐츠',
    description: '음란물이나 폭력적인 내용'
  },
  {
    value: 'copyright_violation',
    label: '저작권 침해',
    description: '타인의 저작물을 무단으로 사용한 내용'
  },
  {
    value: 'misinformation',
    label: '잘못된 정보',
    description: '허위 사실이나 오해를 불러일으키는 내용'
  },
  {
    value: 'other',
    label: '기타',
    description: '위에 해당하지 않는 기타 문제'
  }
];