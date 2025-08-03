/**
 * SEO 최적화 유틸리티
 * 메타데이터, Open Graph, Twitter Card, 구조화 데이터 관리
 */

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

class SEOManager {
  private defaultConfig: Partial<SEOConfig> = {
    locale: 'ko_KR',
    type: 'website',
    image: '/og-image.jpg',
    keywords: ['WeAreVibers', '커뮤니티', '소셜', 'React', 'TypeScript']
  };

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // 기본 viewport 메타태그
    this.updateMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
    
    // 기본 charset
    this.updateMetaTag('charset', 'utf-8');
    
    // 기본 security headers
    this.updateMetaTag('X-Content-Type-Options', 'nosniff');
    this.updateMetaTag('X-Frame-Options', 'DENY');
    this.updateMetaTag('X-XSS-Protection', '1; mode=block');
    
    // Performance hints
    this.updateMetaTag('dns-prefetch', '//fonts.googleapis.com');
    this.updateMetaTag('preconnect', 'https://fonts.gstatic.com');
    
    // PWA 관련
    this.updateMetaTag('theme-color', '#6366f1');
    this.updateMetaTag('mobile-web-app-capable', 'yes');
    this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
    this.updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
  }

  /**
   * 페이지 SEO 설정 업데이트
   */
  updateSEO(config: SEOConfig): void {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    // Title 설정
    document.title = mergedConfig.title;
    
    // Meta description
    this.updateMetaTag('description', mergedConfig.description);
    
    // Keywords
    if (mergedConfig.keywords?.length) {
      this.updateMetaTag('keywords', mergedConfig.keywords.join(', '));
    }
    
    // Author
    if (mergedConfig.author) {
      this.updateMetaTag('author', mergedConfig.author);
    }
    
    // Robots
    const robotsContent = this.buildRobotsContent(mergedConfig);
    if (robotsContent) {
      this.updateMetaTag('robots', robotsContent);
    }
    
    // Canonical URL
    if (mergedConfig.canonical || mergedConfig.url) {
      this.updateLinkTag('canonical', mergedConfig.canonical || mergedConfig.url!);
    }
    
    // Open Graph
    this.updateOpenGraph(mergedConfig);
    
    // Twitter Card
    this.updateTwitterCard(mergedConfig);
    
    // Alternate languages
    if (mergedConfig.alternateLocales?.length) {
      this.updateAlternateLanguages(mergedConfig.alternateLocales, mergedConfig.url);
    }
  }

  /**
   * Open Graph 메타태그 업데이트
   */
  private updateOpenGraph(config: SEOConfig): void {
    this.updateMetaTag('og:title', config.title, 'property');
    this.updateMetaTag('og:description', config.description, 'property');
    this.updateMetaTag('og:type', config.type || 'website', 'property');
    
    if (config.url) {
      this.updateMetaTag('og:url', config.url, 'property');
    }
    
    if (config.image) {
      this.updateMetaTag('og:image', this.getAbsoluteUrl(config.image), 'property');
      this.updateMetaTag('og:image:width', '1200', 'property');
      this.updateMetaTag('og:image:height', '630', 'property');
      this.updateMetaTag('og:image:alt', config.title, 'property');
    }
    
    this.updateMetaTag('og:locale', config.locale || 'ko_KR', 'property');
    this.updateMetaTag('og:site_name', 'WeAreVibers', 'property');
    
    // Article specific
    if (config.type === 'article') {
      if (config.author) {
        this.updateMetaTag('article:author', config.author, 'property');
      }
      if (config.publishedTime) {
        this.updateMetaTag('article:published_time', config.publishedTime, 'property');
      }
      if (config.modifiedTime) {
        this.updateMetaTag('article:modified_time', config.modifiedTime, 'property');
      }
      if (config.section) {
        this.updateMetaTag('article:section', config.section, 'property');
      }
      if (config.tags?.length) {
        config.tags.forEach(tag => {
          this.updateMetaTag('article:tag', tag, 'property');
        });
      }
    }
  }

  /**
   * Twitter Card 메타태그 업데이트
   */
  private updateTwitterCard(config: SEOConfig): void {
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', config.title);
    this.updateMetaTag('twitter:description', config.description);
    
    if (config.image) {
      this.updateMetaTag('twitter:image', this.getAbsoluteUrl(config.image));
      this.updateMetaTag('twitter:image:alt', config.title);
    }
    
    // Twitter 사이트 계정 (환경변수에서 가져오기)
    const twitterSite = import.meta.env.VITE_TWITTER_SITE;
    if (twitterSite) {
      this.updateMetaTag('twitter:site', twitterSite);
    }
  }

  /**
   * 구조화 데이터 추가
   */
  addStructuredData(data: StructuredData): void {
    // 기존 구조화 데이터 스크립트 제거
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // 새 구조화 데이터 스크립트 추가
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * 웹사이트 구조화 데이터 생성
   */
  generateWebsiteStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'WeAreVibers',
      description: '활기찬 커뮤니티를 위한 소셜 플랫폼',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        tar_get: `${window.location.origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: 'WeAreVibers',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      }
    };
  }

  /**
   * 조직 구조화 데이터 생성
   */
  generateOrganizationStructuredData(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'WeAreVibers',
      description: '활기찬 커뮤니티를 위한 소셜 플랫폼',
      url: window.location.origin,
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/logo.png`,
        width: 200,
        height: 200
      },
      sameAs: [
        // 소셜 미디어 링크들
      ]
    };
  }

  /**
   * 기사/포스트 구조화 데이터 생성
   */
  generateArticleStructuredData(config: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    image?: string;
    url: string;
  }): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.title,
      description: config.description,
      image: config.image ? this.getAbsoluteUrl(config.image) : undefined,
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime || config.publishedTime,
      author: {
        '@type': 'Person',
        name: config.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'WeAreVibers',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      },
      url: config.url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': config.url
      }
    };
  }

  /**
   * robots 메타태그 내용 구성
   */
  private buildRobotsContent(config: SEOConfig): string {
    const directives: string[] = [];
    
    if (config.noindex) {
      directives.push('noindex');
    } else {
      directives.push('index');
    }
    
    if (config.nofollow) {
      directives.push('nofollow');
    } else {
      directives.push('follow');
    }
    
    // 추가 지시사항
    directives.push('max-snippet:-1');
    directives.push('max-image-preview:large');
    directives.push('max-video-preview:-1');
    
    return directives.join(', ');
  }

  /**
   * 대체 언어 링크 추가
   */
  private updateAlternateLanguages(locales: string[], baseUrl?: string): void {
    if (!baseUrl) return;
    
    // 기존 alternate 링크 제거
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
      link.remove();
    });
    
    // 새 alternate 링크 추가
    locales.forEach(locale => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = locale;
      link.href = `${baseUrl}?lang=${locale}`;
      document.head.appendChild(link);
    });
  }

  /**
   * 메타태그 업데이트 헬퍼
   */
  private updateMetaTag(name: string, content: string, type: 'name' | 'property' = 'name'): void {
    let meta = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(type, name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  /**
   * 링크태그 업데이트 헬퍼
   */
  private updateLinkTag(rel: string, href: string): void {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    
    link.href = href;
  }

  /**
   * 절대 URL 생성
   */
  private getAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    
    const baseUrl = window.location.origin;
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }

  /**
   * 페이지 로드 시간 preload 최적화
   */
  addPreloadLinks(resources: { href: string; as: string; type?: string; crossorigin?: string }[]): void {
    resources.forEach(resource => {
      // 기존 preload 링크 확인
      const existingPreload = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
      if (existingPreload) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * DNS prefetch 추가
   */
  addDnsPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      // 기존 dns-prefetch 확인
      const existingPrefetch = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
      if (existingPrefetch) return;
      
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// 싱글톤 인스턴스
export const seoManager = new SEOManager();

// React Hook for SEO

import { useLocation } from 'react-router-dom';

export const useSEO = (config: SEOConfig) => {
  const location = useLocation();
  
  useEffect(() => {
    const fullConfig = {
      ...config,
      url: config.url || `${window.location.origin}${location.pathname}${location.search}`
    };
    
    seoManager.updateSEO(fullConfig);
    
    // 웹사이트 구조화 데이터 추가 (홈페이지인 경우)
    if (location.pathname === '/') {
      seoManager.addStructuredData(seoManager.generateWebsiteStructuredData());
    }
    
    // 페이지 특정 preload 리소스 추가
    if (config.image) {
      seoManager.addPreloadLinks([
        { href: config.image, as: 'image' }
      ]);
    }
  }, [config, location]);
};

// 페이지별 SEO 설정 템플릿
export const SEO_TEMPLATES = {
  home: {
    title: 'WeAreVibers - 활기찬 커뮤니티 플랫폼',
    description: '창의적이고 활기찬 사람들이 모이는 소셜 커뮤니티 플랫폼입니다. 팁 공유, 프로젝트 협업, 네트워킹을 통해 함께 성장해보세요.',
    keywords: ['WeAreVibers', '커뮤니티', '소셜', '네트워킹', '팁 공유', '프로젝트'],
    type: 'website' as const
  },
  
  tips: {
    title: 'Tips - WeAreVibers',
    description: '개발, 디자인, 비즈니스 등 다양한 분야의 유용한 팁과 노하우를 공유하고 배워보세요.',
    keywords: ['팁', '노하우', '개발', '디자인', '비즈니스'],
    type: 'website' as const
  },
  
  lounge: {
    title: 'Lounge - WeAreVibers',
    description: '자유롭게 소통하고 네트워킹할 수 있는 라운지 공간입니다.',
    keywords: ['라운지', '소통', '네트워킹', '커뮤니티'],
    type: 'website' as const
  },
  
  profile: {
    title: 'Profile - WeAreVibers',
    description: '나의 프로필을 관리하고 활동 내역을 확인해보세요.',
    keywords: ['프로필', '마이페이지', '활동'],
    type: 'profile' as const
  }
} as const;

export default SEOManager;