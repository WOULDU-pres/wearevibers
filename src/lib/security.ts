/**
 * 보안 유틸리티 함수들
 * XSS 방지, 입력값 검증, 보안 헤더 등
 */

/**
 * HTML 문자열을 안전하게 sanitize
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * XSS 방지를 위한 문자열 이스케이프
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};

/**
 * URL 유효성 검증
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // HTTP/HTTPS만 허용
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * 이메일 유효성 검증
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * 비밀번호 강도 검증
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const _errors: string[] = [];
  let score = 0;

  // 최소 길이
  if (password.length < 8) {
    errors.push('최소 8자 이상이어야 합니다');
  } else {
    score += 1;
  }

  // 대문자 포함
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다');
  } else {
    score += 1;
  }

  // 소문자 포함
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다');
  } else {
    score += 1;
  }

  // 숫자 포함
  if (!/\d/.test(password)) {
    errors.push('숫자를 포함해야 합니다');
  } else {
    score += 1;
  }

  // 특수문자 포함
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다');
  } else {
    score += 1;
  }

  // 일반적인 패턴 확인
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('일반적인 패턴은 사용할 수 없습니다');
    score = Math.max(0, score - 2);
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(5, score),
  };
};

/**
 * 사용자명 유효성 검증
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const _errors: string[] = [];

  // 길이 검증
  if (username.length < 3) {
    errors.push('최소 3자 이상이어야 합니다');
  }
  if (username.length > 20) {
    errors.push('최대 20자까지 가능합니다');
  }

  // 허용된 문자만 사용
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능합니다');
  }

  // 시작/끝 문자 검증
  if (/^[_-]|[_-]$/.test(username)) {
    errors.push('언더스코어나 하이픈으로 시작하거나 끝날 수 없습니다');
  }

  // 금지된 단어 검증
  const forbiddenWords = [
    'admin', 'administrator', 'root', 'system',
    'null', 'undefined', 'test', 'guest',
    'anonymous', 'user', 'default'
  ];
  
  if (forbiddenWords.some(word => username.toLowerCase().includes(word))) {
    errors.push('사용할 수 없는 단어가 포함되어 있습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 파일 업로드 보안 검증
 */
export const validateFileUpload = (file: File): {
  isValid: boolean;
  errors: string[];
} => {
  const _errors: string[] = [];

  // 파일 크기 제한 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('파일 크기는 10MB를 초과할 수 없습니다');
  }

  // 허용된 파일 타입
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('허용되지 않는 파일 형식입니다');
  }

  // 파일명 검증
  const filename = file.name;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    errors.push('파일명에 허용되지 않는 문자가 포함되어 있습니다');
  }

  // 파일 확장자 이중 검증
  const extension = filename.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  if (!extension || !allowedExtensions.includes(extension)) {
    errors.push('허용되지 않는 파일 확장자입니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * SQL 인젝션 방지를 위한 입력값 검증
 */
export const validateInput = (input: string): boolean => {
  // 기본적인 SQL 인젝션 패턴 검출
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /['";--]/,
    /\/\*.*\*\//,
    /<script/i,
    /// // //javascript:/i,
    /on\w+\s*=/i,
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * CSRF 토큰 생성
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Rate Limiting 클라이언트 사이드 검증
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requestTimes = this.requests.get(key) || [];
    
    // 시간 윈도우 밖의 요청들 제거
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // 새 요청 추가
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, times] of this.requests.entries()) {
      const validTimes = times.filter(time => now - time < 3600000); // 1시간
      if (validTimes.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimes);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// 정기적으로 rate limiter 정리
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 300000); // 5분마다
}

/**
 * 민감한 정보 마스킹
 */
export const maskSensitiveInfo = (text: string, type: 'email' | 'phone' | 'card'): string => {
  switch (type) {
    case 'email':
      return text.replace(/(.{2})[^@]*(@.*)/, '$1***$2');
    case 'phone':
      return text.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'card':
      return text.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
    default:
      return text;
  }
};

/**
 * 보안 로그 기록
 */
export const logSecurityEvent = (event: {
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity';
  userId?: string;
  details?: string;
  ip?: string;
}) => {
  // 프로덕션에서만 로그 기록
  if (process.env.NODE_ENV === 'production') {
    console.warn(`[SECURITY] ${event.type}:`, {
      timestamp: new Date().toISOString(),
      ...event,
    });

    // Sentry에 보안 이벤트 기록
    if (typeof window !== 'undefined' && (window as { Sentry?: { addBreadcrumb: (breadcrumb: unknown) => void; captureException: (error: Error, options?: unknown) => void } }).Sentry) {
      (window as { Sentry?: { addBreadcrumb: (breadcrumb: unknown) => void; captureException: (error: Error, options?: unknown) => void } }).Sentry.addBreadcrumb({
        message: `Security Event: ${event.type}`,
        level: 'info',
        category: 'security',
        data: event,
      });
    }
  }
};

/**
 * Content Security Policy 위반 리포터
 */
export const setupCSPReporting = () => {
  if (typeof window === 'undefined') return;

  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      documentURI: event.documentURI,
      lineNumber: event.lineNumber,
    });

    // Sentry에 CSP 위반 리포트
    if ((window as { Sentry?: { addBreadcrumb: (breadcrumb: unknown) => void; captureException: (error: Error, options?: unknown) => void } }).Sentry) {
      (window as { Sentry?: { addBreadcrumb: (breadcrumb: unknown) => void; captureException: (error: Error, options?: unknown) => void } }).Sentry.captureException(new Error('CSP Violation'), {
        extra: {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          lineNumber: event.lineNumber,
        },
      });
    }
  });
};