/**
 * 접근성(A11y) 최적화 유틸리티
 * WCAG 2.1 AA 준수를 위한 헬퍼 함수들
 */

// 색상 대비 계산 관련
interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): ColorRGB | null {
  const _result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 상대적 휘도 계산 (WCAG 공식)
 */
export function getLuminance(color: ColorRGB): number {
  const { r, g, b } = color;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 두 색상 간의 대비율 계산
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

/**
 * WCAG AA/AAA 기준 대비율 검사
 */
export function checkColorContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): {
  ratio: number;
  passes: boolean;
  level: string;
} {
  const ratio = getContrastRatio(foreground, background);
  
  const requirements = {
    'AA': isLargeText ? 3 : 4.5,
    'AAA': isLargeText ? 4.5 : 7
  };
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= requirements[level],
    level: `WCAG ${level}`
  };
}

// 키보드 네비게이션 관련
export interface FocusableElement extends HTMLElement {
  focus(): void;
}

/**
 * 포커스 가능한 요소들을 찾는 셀렉터
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary:first-child',
  'details'
].join(', ');

/**
 * 컨테이너 내의 포커스 가능한 요소들을 가져옴
 */
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const elements = container.querySelectorAll(FOCUSABLE_SELECTORS);
  return Array.from(elements).filter(
    element => !element.hasAttribute('disabled') && 
    isElementVisible(element as HTMLElement)
  ) as FocusableElement[];
}

/**
 * 요소가 시각적으로 보이는지 확인
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

/**
 * 포커스 트랩 클래스
 * 모달 등에서 포커스를 특정 영역에 가둠
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: FocusableElement[] = [];
  private firstFocusableElement: FocusableElement | null = null;
  private lastFocusableElement: FocusableElement | null = null;
  private previouslyFocusedElement: Element | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    // Tab 키 순환 처리
    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (this.focusableElements.length === 1) {
      event.preventDefault();
      this.firstFocusableElement?.focus();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab (역방향)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab (정방향)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };

  /**
   * 포커스 트랩 활성화
   */
  activate(): void {
    this.previouslyFocusedElement = document.activeElement;
    this.updateFocusableElements();
    
    // 첫 번째 포커스 가능한 요소에 포커스
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    } else {
      // 포커스 가능한 요소가 없으면 컨테이너에 포커스
      this.container.setAttribute('tabindex', '-1');
      this.container.focus();
    }
    
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * 포커스 트랩 비활성화
   */
  deactivate(): void {
    document.removeEventListener('keydown', this.handleKeydown);
    
    // 이전에 포커스되어 있던 요소로 포커스 복원
    if (this.previouslyFocusedElement && 'focus' in this.previouslyFocusedElement) {
      (this.previouslyFocusedElement as HTMLElement).focus();
    }
    
    // 임시로 추가한 tabindex 제거
    if (this.container.getAttribute('tabindex') === '-1') {
      this.container.removeAttribute('tabindex');
    }
  }
}

// 스크린 리더 관련
/**
 * 스크린 리더에게 메시지 전달
 */
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // 메시지 전달 후 요소 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * 스크린 리더 전용 텍스트 클래스
 */
export const SR_ONLY_CLASS = 'sr-only';

// Skip Link 관련
/**
 * Skip Link 생성 및 관리
 */
export function createSkipLink(
  targetId: string, 
  linkText: string = '본문으로 바로가기'
): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = linkText;
  
  // 포커스 시에만 보이도록 스타일 적용
  Object.assign(skipLink.style, {
    position: 'absolute',
    top: '-40px',
    left: '6px',
    background: '#000',
    color: '#fff',
    padding: '8px',
    textDecoration: 'none',
    borderRadius: '0 0 4px 4px',
    zIndex: '9999',
    transition: 'top 0.3s'
  });
  
  // 포커스 이벤트 핸들러
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  return skipLink;
}

// ARIA 속성 관리
/**
 * ARIA 라벨 설정 헬퍼
 */
export function setAriaLabel(element: HTMLElement, label: string): void {
  element.setAttribute('aria-label', label);
}

/**
 * ARIA 설명 설정 헬퍼
 */
export function setAriaDescription(
  element: HTMLElement, 
  descriptionId: string
): void {
  element.setAttribute('aria-describedby', descriptionId);
}

/**
 * ARIA live region 설정
 */
export function setAriaLive(
  element: HTMLElement, 
  level: 'off' | 'polite' | 'assertive'
): void {
  element.setAttribute('aria-live', level);
}

/**
 * 확장/축소 상태 설정
 */
export function setAriaExpanded(element: HTMLElement, expanded: boolean): void {
  element.setAttribute('aria-expanded', expanded.toString());
}

/**
 * 선택 상태 설정
 */
export function setAriaSelected(element: HTMLElement, selected: boolean): void {
  element.setAttribute('aria-selected', selected.toString());
}

/**
 * 체크 상태 설정
 */
export function setAriaChecked(
  element: HTMLElement, 
  checked: boolean | 'mixed'
): void {
  element.setAttribute('aria-checked', checked.toString());
}

// 폼 접근성
/**
 * 폼 필드와 라벨 연결
 */
export function associateFieldWithLabel(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  labelId: string
): void {
  field.setAttribute('aria-labelledby', labelId);
}

/**
 * 필수 필드 표시
 */
export function markFieldAsRequired(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  required: boolean = true
): void {
  field.setAttribute('aria-required', required.toString());
  if (required) {
    field.setAttribute('required', '');
  } else {
    field.removeAttribute('required');
  }
}

/**
 * 폼 에러 메시지 연결
 */
export function associateFieldWithError(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  errorId: string,
  hasError: boolean = true
): void {
  if (hasError) {
    field.setAttribute('aria-describedby', errorId);
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-describedby');
    field.setAttribute('aria-invalid', 'false');
  }
}

// 미디어 접근성
/**
 * 이미지 대체 텍스트 검증
 */
export function validateImageAlt(alt: string, purpose: 'decorative' | 'informative' | 'functional'): {
  isValid: boolean;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  
  if (purpose === 'decorative' && alt !== '') {
    suggestions.push('장식용 이미지는 빈 alt 속성을 사용하세요');
  }
  
  if (purpose !== 'decorative') {
    if (!alt || alt.trim() === '') {
      suggestions.push('의미있는 이미지에는 대체 텍스트가 필요합니다');
    }
    
    if (alt.length > 125) {
      suggestions.push('대체 텍스트는 125자 이하로 작성하는 것이 좋습니다');
    }
    
    if (alt.toLowerCase().includes('image of') || alt.toLowerCase().includes('picture of')) {
      suggestions.push('"image of", "picture of" 등의 불필요한 표현을 제거하세요');
    }
  }
  
  return {
    isValid: suggestions.length === 0,
    suggestions,
  };
}

// 반응형 접근성
/**
 * 터치 타겟 크기 검증 (최소 44x44px)
 */
export function validateTouchTargetSize(element: HTMLElement): {
  isValid: boolean;
  width: number;
  height: number;
  suggestions: string[];
} {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // WCAG 권장 최소 크기
  
  const suggestions: string[] = [];
  
  if (rect.width < minSize) {
    suggestions.push(`터치 타겟 너비가 ${minSize}px 미만입니다 (현재: ${Math.round(rect.width)}px)`);
  }
  
  if (rect.height < minSize) {
    suggestions.push(`터치 타겟 높이가 ${minSize}px 미만입니다 (현재: ${Math.round(rect.height)}px)`);
  }
  
  return {
    isValid: suggestions.length === 0,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    suggestions,
  };
}

// 접근성 테스트 도구
/**
 * 페이지 접근성 기본 검사
 */
export async function performBasicA11yAudit(): Promise<{
  images: { element: HTMLImageElement; issues: string[] }[];
  headings: { level: number; text: string; issues: string[] }[];
  links: { element: HTMLAnchorElement; issues: string[] }[];
  buttons: { element: HTMLButtonElement; issues: string[] }[];
  forms: { element: HTMLInputElement; issues: string[] }[];
  colorContrast: { foreground: string; background: string; ratio: number; passes: boolean }[];
}> {
  const results = {
    images: [] as { element: HTMLImageElement; issues: string[] }[],
    headings: [] as { level: number; text: string; issues: string[] }[],
    links: [] as { element: HTMLAnchorElement; issues: string[] }[],
    buttons: [] as { element: HTMLButtonElement; issues: string[] }[],
    forms: [] as { element: HTMLInputElement; issues: string[] }[],
    colorContrast: [] as { foreground: string; background: string; ratio: number; passes: boolean }[]
  };
  
  // 이미지 검사
  document.querySelectorAll('img').forEach(img => {
    const issues: string[] = [];
    const alt = img.getAttribute('alt');
    
    if (alt === null) {
      issues.push('alt 속성이 없습니다');
    }
    
    results.images.push({ element: img, issues });
  });
  
  // 헤딩 검사
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    const issues: string[] = [];
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent || '';
    
    if (!text.trim()) {
      issues.push('빈 헤딩입니다');
    }
    
    results.headings.push({ level, text, issues });
  });
  
  // 링크 검사
  document.querySelectorAll('a').forEach(link => {
    const issues: string[] = [];
    const text = link.textContent || '';
    const href = link.getAttribute('href');
    
    if (!text.trim() && !link.getAttribute('aria-label')) {
      issues.push('링크 텍스트가 없습니다');
    }
    
    if (href && href.startsWith('// // //javascript:')) {
      issues.push('JavaScript 링크는 접근성에 좋지 않습니다');
    }
    
    results.links.push({ element: link, issues });
  });
  
  // 버튼 검사
  document.querySelectorAll('button').forEach(button => {
    const issues: string[] = [];
    const text = button.textContent || '';
    
    if (!text.trim() && !button.getAttribute('aria-label')) {
      issues.push('버튼 텍스트가 없습니다');
    }
    
    const touchTarget = validateTouchTargetSize(button);
    if (!touchTarget.isValid) {
      issues.push(...touchTarget.suggestions);
    }
    
    results.buttons.push({ element: button, issues });
  });
  
  return results;
}

export default {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  checkColorContrast,
  getFocusableElements,
  FocusTrap,
  announceToScreenReader,
  createSkipLink,
  setAriaLabel,
  setAriaDescription,
  setAriaLive,
  setAriaExpanded,
  setAriaSelected,
  setAriaChecked,
  associateFieldWithLabel,
  markFieldAsRequired,
  associateFieldWithError,
  validateImageAlt,
  validateTouchTargetSize,
  performBasicA11yAudit,
};