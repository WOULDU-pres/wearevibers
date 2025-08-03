// sanitization.ts - 입력 새니타이제이션 유틸리티
// EPIC-04: 보안 및 안정성 - STORY-016

import DOMPurify from 'dompurify';

/**
 * HTML 새니타이제이션 설정
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'span', 'div'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'blockquote': ['cite'],
  'code': ['class'],
  'pre': ['class'],
  'span': ['class'],
  'div': ['class']
};

// DOMPurify 기본 설정
const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR: Object.values(ALLOWED_ATTRIBUTES).flat(),
  ALLOW_DATA_ATTR: false,
  FORBID_SCRIPT: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link', 'meta', 'style'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', '// // //javascript:'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * 기본 HTML 새니타이제이션
 * @param input - 새니타이제이션할 HTML 문자열
 * @returns 새니타이즈된 HTML 문자열
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, PURIFY_CONFIG);
}

/**
 * 엄격한 텍스트 새니타이제이션 (HTML 태그 완전 제거)
 * @param input - 새니타이제이션할 문자열
 * @returns HTML 태그가 제거된 순수 텍스트
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML 태그 완전 제거
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * URL 새니타이제이션
 * @param input - 검증할 URL
 * @returns 안전한 URL 또는 빈 문자열
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  try {
    const url = new URL(input);
    
    // 허용된 프로토콜만 통과
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(url.protocol)) {
      return '';
    }

    // // // //javascript: 스킴 차단
    if (url.protocol === '// // //javascript:') {
      return '';
    }

    return url.toString();
  } catch {
    // URL이 유효하지 않으면 빈 문자열 반환
    return '';
  }
}

/**
 * 파일명 새니타이제이션
 * @param filename - 새니타이제이션할 파일명
 * @returns 안전한 파일명
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[<>:"/\\|?*]/g, '') // 위험한 문자 제거
    .replace(/[^\w\s.-]/g, '') // 안전한 문자만 허용
    .replace(/^\.+/, '') // 시작 부분의 점 제거
    .replace(/\.+$/, '') // 끝 부분의 점 제거
    .replace(/\s+/g, '_') // 공백을 언더스코어로 변경
    .substring(0, 255); // 길이 제한
}

/**
 * 사용자명 새니타이제이션
 * @param username - 새니타이제이션할 사용자명
 * @returns 안전한 사용자명
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  return username
    .replace(/[<>:"/\\|?*@#$%^&*()+={}[\];',"]/g, '') // 특수문자 제거
    .replace(/[^\w\s.-]/g, '') // 안전한 문자만 허용
    .replace(/\s+/g, '_') // 공백을 언더스코어로 변경
    .toLowerCase()
    .substring(0, 50); // 길이 제한
}

/**
 * SQL 인젝션 방지를 위한 문자열 새니타이제이션
 * @param input - 새니타이제이션할 문자열
 * @returns 안전한 문자열
 */
export function sanitizeSqlString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''") // 작은따옴표 이스케이프
    .replace(/;/g, '') // 세미콜론 제거
    .replace(/--/g, '') // SQL 주석 제거
    .replace(/\/\*/g, '') // 블록 주석 시작 제거
    .replace(/\*\//g, '') // 블록 주석 끝 제거
    .replace(/xp_/gi, '') // 확장 프로시저 제거
    .replace(/sp_/gi, '') // 시스템 프로시저 제거
    .substring(0, 1000); // 길이 제한
}

/**
 * 마크다운 콘텐츠 새니타이제이션
 * @param input - 새니타이제이션할 마크다운 문자열
 * @returns 안전한 마크다운 문자열
 */
export function sanitizeMarkdown(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // 마크다운에서 허용할 HTML 태그들
  const markdownConfig = {
    ...PURIFY_CONFIG,
    ALLOWED_TAGS: [
      ...ALLOWED_TAGS,
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'del', 'ins', 'mark', 'sub', 'sup'
    ]
  };

  return DOMPurify.sanitize(input, markdownConfig);
}

/**
 * 검색 쿼리 새니타이제이션
 * @param query - 새니타이제이션할 검색 쿼리
 * @returns 안전한 검색 쿼리
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .replace(/[<>:"/\\|?*]/g, '') // 위험한 문자 제거
    .replace(/[^\w\s.-]/g, '') // 안전한 문자만 허용
    .replace(/[(){}[\]]/g, '') // 특수 검색 문자 제거
    .replace(/[+\-=!]/g, '') // 검색 연산자 제거
    .replace(/\s+/g, ' ') // 연속 공백을 단일 공백으로
    .trim()
    .substring(0, 100); // 길이 제한
}

/**
 * 배치 새니타이제이션 (객체의 모든 문자열 속성을 새니타이제이션)
 * @param obj - 새니타이제이션할 객체
 * @param sanitizer - 사용할 새니타이제이션 함수 (기본: sanitizeText)
 * @returns 새니타이즈된 객체
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  sanitizer: (input: string) => string = sanitizeText
): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizer(value) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizer(item) : item
      ) as T[Extract<keyof T, string>];
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(
        value as Record<string, unknown>, 
        sanitizer,
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * 콘텐츠 타입별 새니타이제이션
 */
export const contentSanitizers = {
  post: sanitizeMarkdown,
  tip: sanitizeMarkdown,
  comment: sanitizeHtml,
  bio: sanitizeHtml,
  title: sanitizeText,
  username: sanitizeUsername,
  url: sanitizeUrl,
  filename: sanitizeFilename,
  search: sanitizeSearchQuery,
} as const;

/**
 * XSS 공격 패턴 감지
 * @param input - 검사할 문자열
 * @returns 위험한 패턴이 감지되면 true
 */
export function detectXSSPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /// // //javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * 컨텐츠 보안 정책 (CSP) 헤더 설정을 위한 nonce 생성
 * @returns 32바이트 랜덤 nonce
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}