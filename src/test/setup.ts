/**
 * Vitest 테스트 환경 셋업
 * 전역 테스트 설정 및 모킹
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Testing Library 매처 확장
expect.extend(matchers);

// 각 테스트 후 DOM 정리
afterEach(() => {
  cleanup();
});

// 전역 모킹 설정
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// IntersectionObserver 모킹
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// HTMLCanvasElement 모킹
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// HTMLCanvasElement.toDataURL 모킹
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

// URL.createObjectURL 모킹
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// fetch 모킹 (기본)
global.fetch = vi.fn();

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

// sessionStorage 모킹
global.sessionStorage = localStorageMock;

// location 모킹
delete (window as any).location;
window.location = {
  ...window.location,
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  protocol: 'http:',
} as any;

// console 모킹 (테스트 중 불필요한 로그 제거)
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// crypto 모킹 (Node.js 환경에서 필요)
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  },
});

// Performance API 모킹
global.performance = {
  ...performance,
  mark: vi.fn(),
  measure: vi.fn(),
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

// 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// 전역 테스트 헬퍼
export const createMockEvent = (type: string, properties = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  return event;
};

export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', size = 1024) => {
  return new File(['test content'], name, { type, lastModified: Date.now() });
};

export const mockComponent = (name: string) => {
  return vi.fn((props: any) => {
    return React.createElement('div', {
      'data-testid': name.toLowerCase(),
      ...props
    });
  });
};

// React 모킹 (필요시)
import React from 'react';
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    // 특정 훅이나 컴포넌트 모킹 가능
  };
});

// Framer Motion 모킹 (애니메이션 테스트 시 유용)
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => 
      React.createElement('div', { ref, ...props }, children)
    ),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => 
      React.createElement('span', { ref, ...props }, children)
    ),
    button: React.forwardRef(({ children, ...props }: any, ref: any) => 
      React.createElement('button', { ref, ...props }, children)
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({}),
  useMotionValue: (initial: any) => ({ get: () => initial, set: vi.fn() }),
}));

// React Router 모킹
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Supabase 모킹
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
    })),
  })),
}));

// Date 모킹 (시간 기반 테스트용)
export const mockDate = (isoDate: string) => {
  const mockDate = new Date(isoDate);
  vi.setSystemTime(mockDate);
  return mockDate;
};

// 테스트 완료 후 Date 리셋
afterEach(() => {
  vi.useRealTimers();
});