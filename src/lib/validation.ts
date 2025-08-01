// validation.ts - Zod 스키마 유효성 검사
// EPIC-04: 보안 및 안정성 - STORY-016

import { z } from 'zod';
import { detectXSSPatterns } from './sanitization';

// 공통 유효성 검사 규칙
const commonValidators = {
  // XSS 패턴 감지 커스텀 검증
  noXSS: (message = 'XSS 공격 패턴이 감지되었습니다') =>
    z.string().refine(
      (val) => !detectXSSPatterns(val),
      { message }
    ),

  // 안전한 URL 검증
  safeUrl: z.string().url('올바른 URL 형식이 아닙니다').refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'HTTP 또는 HTTPS URL만 허용됩니다' }
  ),

  // 사용자명 검증
  username: z.string()
    .min(2, '사용자명은 최소 2자 이상이어야 합니다')
    .max(50, '사용자명은 최대 50자까지 가능합니다')
    .regex(/^[a-zA-Z0-9_-]+$/, '사용자명은 영문자, 숫자, _, - 만 사용 가능합니다')
    .refine(
      (val) => !detectXSSPatterns(val),
      { message: '사용자명에 유효하지 않은 문자가 포함되어 있습니다' }
    ),

  // 이메일 검증
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .max(255, '이메일은 최대 255자까지 가능합니다')
    .refine(
      (val) => !detectXSSPatterns(val),
      { message: '이메일에 유효하지 않은 문자가 포함되어 있습니다' }
    ),

  // 비밀번호 검증
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(128, '비밀번호는 최대 128자까지 가능합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다'
    ),

  // 제목 검증
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 최대 200자까지 가능합니다')
    .refine(
      (val) => !detectXSSPatterns(val),
      { message: '제목에 유효하지 않은 문자가 포함되어 있습니다' }
    ),

  // 내용 검증
  content: z.string()
    .min(1, '내용을 입력해주세요')
    .max(10000, '내용은 최대 10,000자까지 가능합니다')
    .refine(
      (val) => !detectXSSPatterns(val),
      { message: '내용에 유효하지 않은 문자가 포함되어 있습니다' }
    ),

  // 짧은 텍스트 검증
  shortText: z.string()
    .max(500, '텍스트는 최대 500자까지 가능합니다')
    .refine(
      (val) => !detectXSSPatterns(val),
      { message: '텍스트에 유효하지 않은 문자가 포함되어 있습니다' }
    ),
};

// 프로필 관련 검증 스키마
export const profileSchemas = {
  // 프로필 업데이트
  updateProfile: z.object({
    username: commonValidators.username.optional(),
    full_name: z.string()
      .max(100, '이름은 최대 100자까지 가능합니다')
      .refine(
        (val) => !val || !detectXSSPatterns(val),
        { message: '이름에 유효하지 않은 문자가 포함되어 있습니다' }
      )
      .optional(),
    bio: z.string()
      .max(500, '자기소개는 최대 500자까지 가능합니다')
      .refine(
        (val) => !val || !detectXSSPatterns(val),
        { message: '자기소개에 유효하지 않은 문자가 포함되어 있습니다' }
      )
      .optional(),
    website_url: commonValidators.safeUrl.optional().or(z.literal('')),
    github_url: commonValidators.safeUrl.optional().or(z.literal('')),
    linkedin_url: commonValidators.safeUrl.optional().or(z.literal('')),
    twitter_url: commonValidators.safeUrl.optional().or(z.literal('')),
    tech_stack: z.array(z.string().max(50)).max(20).optional(),
  }),

  // 사용자명 변경
  changeUsername: z.object({
    username: commonValidators.username,
  }),
};

// 포스트 관련 검증 스키마
export const postSchemas = {
  // 포스트 생성
  createPost: z.object({
    title: commonValidators.title,
    content: commonValidators.content,
    category: z.enum([
      'desk-setup',
      'coding-playlist', 
      'ide-theme',
      'productivity-tools',
      'career-advice',
      'general'
    ]).default('general'),
    image_urls: z.array(commonValidators.safeUrl).max(10).optional(),
  }),

  // 포스트 업데이트
  updatePost: z.object({
    title: commonValidators.title.optional(),
    content: commonValidators.content.optional(),
    category: z.enum([
      'desk-setup',
      'coding-playlist',
      'ide-theme', 
      'productivity-tools',
      'career-advice',
      'general'
    ]).optional(),
    image_urls: z.array(commonValidators.safeUrl).max(10).optional(),
  }),
};

// 팁 관련 검증 스키마
export const tipSchemas = {
  // 팁 생성
  createTip: z.object({
    title: commonValidators.title,
    content: commonValidators.content,
    category: z.enum([
      'productivity',
      'css-tricks',
      'git-flow', 
      'ui-ux',
      'performance',
      'security',
      'general'
    ]).default('general'),
    difficulty_level: z.number().int().min(1).max(5).default(1),
    read_time: z.number().int().min(1).max(120).optional(),
  }),

  // 팁 업데이트
  updateTip: z.object({
    title: commonValidators.title.optional(),
    content: commonValidators.content.optional(),
    category: z.enum([
      'productivity',
      'css-tricks',
      'git-flow',
      'ui-ux', 
      'performance',
      'security',
      'general'
    ]).optional(),
    difficulty_level: z.number().int().min(1).max(5).optional(),
    read_time: z.number().int().min(1).max(120).optional(),
  }),
};

// 프로젝트 관련 검증 스키마
export const projectSchemas = {
  // 프로젝트 생성
  createProject: z.object({
    title: commonValidators.title,
    description: commonValidators.content,
    tech_stack: z.array(z.string().max(50)).min(1, '최소 1개의 기술 스택을 선택해주세요').max(20),
    github_url: commonValidators.safeUrl.optional().or(z.literal('')),
    demo_url: commonValidators.safeUrl.optional().or(z.literal('')),
    figma_url: commonValidators.safeUrl.optional().or(z.literal('')),
    difficulty_level: z.number().int().min(1).max(5).default(1),
    status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']).default('planning'),
    image_urls: z.array(commonValidators.safeUrl).max(10).optional(),
  }),

  // 프로젝트 업데이트
  updateProject: z.object({
    title: commonValidators.title.optional(),
    description: commonValidators.content.optional(),
    tech_stack: z.array(z.string().max(50)).max(20).optional(),
    github_url: commonValidators.safeUrl.optional().or(z.literal('')),
    demo_url: commonValidators.safeUrl.optional().or(z.literal('')),
    figma_url: commonValidators.safeUrl.optional().or(z.literal('')),
    difficulty_level: z.number().int().min(1).max(5).optional(),
    status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']).optional(),
    image_urls: z.array(commonValidators.safeUrl).max(10).optional(),
  }),
};

// 댓글 관련 검증 스키마
export const commentSchemas = {
  // 댓글 생성
  createComment: z.object({
    content: z.string()
      .min(1, '댓글 내용을 입력해주세요')
      .max(1000, '댓글은 최대 1,000자까지 가능합니다')
      .refine(
        (val) => !detectXSSPatterns(val),
        { message: '댓글에 유효하지 않은 문자가 포함되어 있습니다' }
      ),
    content_id: z.string().uuid('올바른 컨텐츠 ID가 아닙니다'),
    content_type: z.enum(['post', 'tip', 'project']),
    parent_id: z.string().uuid().optional(),
  }),

  // 댓글 업데이트
  updateComment: z.object({
    content: z.string()
      .min(1, '댓글 내용을 입력해주세요')
      .max(1000, '댓글은 최대 1,000자까지 가능합니다')
      .refine(
        (val) => !detectXSSPatterns(val),
        { message: '댓글에 유효하지 않은 문자가 포함되어 있습니다' }
      ),
  }),
};

// 신고 관련 검증 스키마
export const reportSchemas = {
  // 신고 생성
  createReport: z.object({
    reported_content_id: z.string().uuid('올바른 컨텐츠 ID가 아닙니다'),
    content_type: z.enum(['post', 'tip', 'comment', 'profile']),
    reason: z.enum([
      'spam',
      'harassment', 
      'hate_speech',
      'inappropriate_content',
      'copyright_violation',
      'misinformation',
      'other'
    ]),
    description: z.string()
      .max(500, '신고 사유는 최대 500자까지 가능합니다')
      .refine(
        (val) => !val || !detectXSSPatterns(val),
        { message: '신고 사유에 유효하지 않은 문자가 포함되어 있습니다' }
      )
      .optional(),
  }),

  // 신고 처리
  processReport: z.object({
    report_id: z.string().uuid('올바른 신고 ID가 아닙니다'),
    new_status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']),
    resolution_note: z.string()
      .max(1000, '처리 사유는 최대 1,000자까지 가능합니다')
      .refine(
        (val) => !val || !detectXSSPatterns(val),
        { message: '처리 사유에 유효하지 않은 문자가 포함되어 있습니다' }
      )
      .optional(),
  }),
};

// 사용자 차단 관련 검증 스키마
export const blockSchemas = {
  // 사용자 차단
  blockUser: z.object({
    blocked_user_id: z.string().uuid('올바른 사용자 ID가 아닙니다'),
    reason: z.string()
      .max(200, '차단 사유는 최대 200자까지 가능합니다')
      .refine(
        (val) => !val || !detectXSSPatterns(val),
        { message: '차단 사유에 유효하지 않은 문자가 포함되어 있습니다' }
      )
      .optional(),
  }),

  // 사용자 차단 해제
  unblockUser: z.object({
    blocked_user_id: z.string().uuid('올바른 사용자 ID가 아닙니다'),
  }),
};

// 검색 관련 검증 스키마
export const searchSchemas = {
  // 검색 쿼리
  searchQuery: z.object({
    query: z.string()
      .min(1, '검색어를 입력해주세요')
      .max(100, '검색어는 최대 100자까지 가능합니다')
      .refine(
        (val) => !detectXSSPatterns(val),
        { message: '검색어에 유효하지 않은 문자가 포함되어 있습니다' }
      ),
    category: z.string().optional(),
    sort_by: z.enum(['newest', 'popular', 'trending']).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
};

// 파일 업로드 관련 검증 스키마
export const uploadSchemas = {
  // 파일 업로드
  fileUpload: z.object({
    filename: z.string()
      .min(1, '파일명을 입력해주세요')
      .max(255, '파일명은 최대 255자까지 가능합니다')
      .refine(
        (filename) => {
          // 안전한 파일 확장자만 허용
          const allowedExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.webp', // 이미지
            '.pdf', '.doc', '.docx', '.txt', '.md', // 문서
            '.zip', '.rar', '.7z' // 압축파일
          ];
          const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
          return allowedExtensions.includes(ext);
        },
        { message: '허용되지 않는 파일 형식입니다' }
      )
      .refine(
        (val) => !detectXSSPatterns(val),
        { message: '파일명에 유효하지 않은 문자가 포함되어 있습니다' }
      ),
    file_size: z.number().int().max(50 * 1024 * 1024, '파일 크기는 50MB를 초과할 수 없습니다'),
  }),
};

// 알림 관련 검증 스키마
export const notificationSchemas = {
  // 알림 읽음 처리
  markAsRead: z.object({
    notification_ids: z.array(z.string().uuid()).max(100),
  }),
};

// 모든 스키마를 하나의 객체로 내보내기
export const validationSchemas = {
  profile: profileSchemas,
  post: postSchemas,
  tip: tipSchemas,
  project: projectSchemas,
  comment: commentSchemas,
  report: reportSchemas,
  block: blockSchemas,
  search: searchSchemas,
  upload: uploadSchemas,
  notification: notificationSchemas,
};

// 타입 추론을 위한 타입 정의
export type ProfileUpdateInput = z.infer<typeof profileSchemas.updateProfile>;
export type PostCreateInput = z.infer<typeof postSchemas.createPost>;
export type TipCreateInput = z.infer<typeof tipSchemas.createTip>;
export type ProjectCreateInput = z.infer<typeof projectSchemas.createProject>;
export type CommentCreateInput = z.infer<typeof commentSchemas.createComment>;
export type ReportCreateInput = z.infer<typeof reportSchemas.createReport>;
export type BlockUserInput = z.infer<typeof blockSchemas.blockUser>;
export type SearchQueryInput = z.infer<typeof searchSchemas.searchQuery>;