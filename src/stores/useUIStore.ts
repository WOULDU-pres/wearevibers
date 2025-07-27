import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UIState {
  // 카테고리 & 필터링
  activeCategory: string;
  sortBy: 'newest' | 'popular' | 'comments';
  searchQuery: string;
  
  // 탭 & 모달
  activeTab: string;
  
  // 파일 업로드 상태
  uploading: boolean;
  uploadProgress: number;
  uploadComplete: boolean;
  
  // 기타 UI 상태
  copied: boolean;
  estimatedReadTime: number;
  
  // Actions
  setActiveCategory: (category: string) => void;
  setSortBy: (sort: 'newest' | 'popular' | 'comments') => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setUploadComplete: (complete: boolean) => void;
  setCopied: (copied: boolean) => void;
  setEstimatedReadTime: (time: number) => void;
  resetUploadState: () => void;
  resetUIState: () => void;
}

const initialState = {
  activeCategory: 'all',
  sortBy: 'newest' as const,
  searchQuery: '',
  activeTab: 'edit',
  uploading: false,
  uploadProgress: 0,
  uploadComplete: false,
  copied: false,
  estimatedReadTime: 5,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setActiveCategory: (category: string) =>
        set({ activeCategory: category }, false, 'setActiveCategory'),
      
      setSortBy: (sort: 'newest' | 'popular' | 'comments') =>
        set({ sortBy: sort }, false, 'setSortBy'),
      
      setSearchQuery: (query: string) =>
        set({ searchQuery: query }, false, 'setSearchQuery'),
      
      setActiveTab: (tab: string) =>
        set({ activeTab: tab }, false, 'setActiveTab'),
      
      setUploading: (uploading: boolean) =>
        set({ uploading }, false, 'setUploading'),
      
      setUploadProgress: (progress: number) =>
        set({ uploadProgress: progress }, false, 'setUploadProgress'),
      
      setUploadComplete: (complete: boolean) =>
        set({ uploadComplete: complete }, false, 'setUploadComplete'),
      
      setCopied: (copied: boolean) =>
        set({ copied }, false, 'setCopied'),
      
      setEstimatedReadTime: (time: number) =>
        set({ estimatedReadTime: time }, false, 'setEstimatedReadTime'),
      
      resetUploadState: () =>
        set(
          {
            uploading: false,
            uploadProgress: 0,
            uploadComplete: false,
          },
          false,
          'resetUploadState'
        ),
      
      resetUIState: () =>
        set({ ...initialState }, false, 'resetUIState'),
    }),
    {
      name: 'ui-store',
    }
  )
);