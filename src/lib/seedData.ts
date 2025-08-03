/**
 * WeAreVibers 시드 데이터 생성
 * 개발 및 테스트 환경에서 실제 동작 가능한 데이터를 생성
 */

import { supabase } from './supabase';
import type { Profile, Project, Tip, Post } from './supabase-types';

export interface SeedDataResult {
  success: boolean;
  message: string;
  data?: {
    profiles: number;
    projects: number;
    tips: number;
    posts: number;
  };
  errors?: string[];
}

/**
 * 샘플 프로필 데이터
 */
const sampleProfiles: Omit<Profile, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    username: 'devjohn',
    full_name: 'John Developer',
    bio: '풀스택 개발자입니다. React와 Node.js를 주로 사용합니다.',
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    github_url: 'https://github.com/devjohn',
    tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    is_online: true,
    project_count: 3,
    follower_count: 15,
    following_count: 8,
    website_url: null,
    twitter_url: null,
    linkedin_url: null,
  },
  {
    username: 'designsarah',
    full_name: 'Sarah Designer',
    bio: 'UI/UX 디자이너이자 프론트엔드 개발자입니다.',
    avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
    github_url: 'https://github.com/designsarah',
    tech_stack: ['Figma', 'React', 'CSS', 'JavaScript'],
    is_online: false,
    project_count: 5,
    follower_count: 28,
    following_count: 12,
    website_url: 'https://sarahdesign.com',
    twitter_url: null,
    linkedin_url: null,
  },
  {
    username: 'backendmike',
    full_name: 'Mike Backend',
    bio: '백엔드 아키텍처 전문가. 스케일러블한 시스템을 만듭니다.',
    avatar_url: 'https://avatars.githubusercontent.com/u/3?v=4',
    github_url: 'https://github.com/backendmike',
    tech_stack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    is_online: true,
    project_count: 7,
    follower_count: 42,
    following_count: 18,
    website_url: null,
    twitter_url: 'https://twitter.com/backendmike',
    linkedin_url: null,
  }
];

/**
 * 샘플 프로젝트 데이터
 */
const sampleProjects: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'WeatherApp Pro',
    description: '실시간 날씨 정보와 예보를 제공하는 모바일 우선 웹 애플리케이션입니다. OpenWeatherMap API를 사용하여 정확한 날씨 데이터를 제공합니다.',
    tech_stack: ['React', 'TypeScript', 'Tailwind CSS', 'OpenWeatherMap API'],
    difficulty_level: 2,
    status: 'published',
    github_url: 'https://github.com/devjohn/weatherapp-pro',
    demo_url: 'https://weatherapp-pro.vercel.app',
    figma_url: null,
    image_urls: ['https://picsum.photos/800/400?random=1'],
    vibe_count: 23,
    comment_count: 5,
  },
  {
    title: 'TaskMaster',
    description: '팀 협업을 위한 프로젝트 관리 도구입니다. 칸반 보드, 시간 추적, 팀 채팅 기능을 포함합니다.',
    tech_stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
    difficulty_level: 4,
    status: 'published',
    github_url: 'https://github.com/devjohn/taskmaster',
    demo_url: 'https://taskmaster.herokuapp.com',
    figma_url: 'https://figma.com/taskmaster-design',
    image_urls: ['https://picsum.photos/800/400?random=2', 'https://picsum.photos/800/400?random=3'],
    vibe_count: 45,
    comment_count: 12,
  },
  {
    title: 'E-Commerce Dashboard',
    description: '온라인 쇼핑몰 관리자를 위한 대시보드입니다. 주문 관리, 재고 추적, 매출 분석 기능을 제공합니다.',
    tech_stack: ['Vue.js', 'Python', 'FastAPI', 'PostgreSQL', 'Chart.js'],
    difficulty_level: 5,
    status: 'published',
    github_url: 'https://github.com/backendmike/ecommerce-dashboard',
    demo_url: 'https://ecommerce-dash.netlify.app',
    figma_url: null,
    image_urls: ['https://picsum.photos/800/400?random=4'],
    vibe_count: 67,
    comment_count: 18,
  },
  {
    title: 'Portfolio Website',
    description: '개발자를 위한 반응형 포트폴리오 웹사이트 템플릿입니다. 다크/라이트 모드를 지원합니다.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'GSAP'],
    difficulty_level: 1,
    status: 'published',
    github_url: 'https://github.com/designsarah/portfolio-template',
    demo_url: 'https://sarah-portfolio.netlify.app',
    figma_url: 'https://figma.com/portfolio-design',
    image_urls: ['https://picsum.photos/800/400?random=5', 'https://picsum.photos/800/400?random=6'],
    vibe_count: 34,
    comment_count: 8,
  },
  {
    title: 'Real-time Chat App',
    description: 'WebSocket을 사용한 실시간 채팅 애플리케이션입니다. 그룹 채팅, 파일 공유, 이모지 반응 기능을 지원합니다.',
    tech_stack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Cloudinary'],
    difficulty_level: 3,
    status: 'published',
    github_url: 'https://github.com/designsarah/realtime-chat',
    demo_url: 'https://realtime-chat-app.vercel.app',
    figma_url: null,
    image_urls: ['https://picsum.photos/800/400?random=7'],
    vibe_count: 56,
    comment_count: 15,
  }
];

/**
 * 샘플 팁 데이터
 */
const sampleTips: Omit<Tip, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'React Hooks 완벽 가이드',
    content: `# React Hooks 마스터하기

React Hooks는 함수형 컴포넌트에서 상태와 생명주기를 관리할 수 있게 해주는 강력한 기능입니다.

## 기본 Hooks

### useState
상태 관리의 기본입니다.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect
사이드 이펙트를 처리합니다.

\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## 고급 Hooks

### useCallback과 useMemo
성능 최적화를 위해 사용합니다.

### useContext
전역 상태 관리에 활용할 수 있습니다.`,
    category: 'Frontend',
    difficulty_level: 2,
    read_time: 8,
    status: 'published',
    vibe_count: 89,
    comment_count: 23,
    bookmark_count: 45,
  },
  {
    title: 'CSS Grid vs Flexbox: 언제 무엇을 사용할까?',
    content: `# CSS Grid vs Flexbox

두 레이아웃 시스템의 차이점과 사용 시기를 알아봅시다.

## Flexbox 사용 시기
- 1차원 레이아웃 (행 또는 열)
- 컴포넌트 내부 레이아웃
- 정렬과 분배

## CSS Grid 사용 시기
- 2차원 레이아웃 (행과 열)
- 페이지 전체 레이아웃
- 복잡한 그리드 시스템

## 실제 예시

\`\`\`css
/* Flexbox */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* CSS Grid */
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
}
\`\`\``,
    category: 'CSS',
    difficulty_level: 1,
    read_time: 5,
    status: 'published',
    vibe_count: 67,
    comment_count: 12,
    bookmark_count: 34,
  },
  {
    title: 'Node.js 성능 최적화 팁',
    content: `# Node.js 성능 최적화

백엔드 애플리케이션의 성능을 향상시키는 방법들을 살펴봅시다.

## 1. 비동기 처리 최적화

### Promise.all 사용
병렬 처리가 가능한 작업들은 Promise.all을 사용하세요.

\`\`\`javascript
// 나쁜 예
const user = await getUserById(id);
const posts = await getPostsByUserId(id);
const comments = await getCommentsByUserId(id);

// 좋은 예
const [user, posts, comments] = await Promise.all([
  getUserById(id),
  getPostsByUserId(id),
  getCommentsByUserId(id)
]);
\`\`\`

## 2. 데이터베이스 최적화

### 인덱스 활용
자주 조회되는 컬럼에는 인덱스를 설정하세요.

### 쿼리 최적화
N+1 문제를 피하고 필요한 데이터만 조회하세요.

## 3. 캐싱 전략

### Redis 활용
자주 접근하는 데이터는 Redis에 캐시하세요.

### HTTP 캐싱
적절한 캐시 헤더를 설정하세요.`,
    category: 'Backend',
    difficulty_level: 3,
    read_time: 12,
    status: 'published',
    vibe_count: 125,
    comment_count: 31,
    bookmark_count: 78,
  }
];

/**
 * 샘플 포스트 데이터
 */
const samplePosts: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: '새로운 프로젝트를 시작했어요!',
    content: `안녕하세요! 오늘부터 새로운 프로젝트를 시작하게 되었습니다.

실시간 협업 도구를 만들어보려고 하는데, React와 Socket.io를 사용할 예정입니다.

혹시 비슷한 프로젝트 경험이 있으신 분들은 조언 부탁드려요! 🙏`,
    category: 'project',
    vibe_count: 15,
    comment_count: 8,
    image_urls: null,
  },
  {
    title: 'TypeScript를 배우는 중인데...',
    content: `JavaScript에서 TypeScript로 넘어가는 중인데 생각보다 러닝커브가 있네요.

특히 제네릭 부분이 어려워서 계속 공부하고 있습니다.

좋은 TypeScript 학습 자료 추천해주세요!`,
    category: 'question',
    vibe_count: 23,
    comment_count: 15,
    image_urls: null,
  },
  {
    title: '첫 오픈소스 기여 성공! 🎉',
    content: `드디어 첫 오픈소스 기여에 성공했습니다!

작은 버그 수정이었지만 PR이 머지되었을 때의 그 기분이... 정말 최고였어요!

다음에는 더 큰 기여를 해보고 싶습니다. 

오픈소스 기여 경험담 들려주세요!`,
    category: 'achievement',
    vibe_count: 45,
    comment_count: 12,
    image_urls: ['https://picsum.photos/600/300?random=8'],
  }
];

/**
 * 시드 데이터 생성 메인 함수
 */
export async function createSeedData(): Promise<SeedDataResult> {
  try {
    console.warn('🌱 Starting seed data creation...');
    
    const errors: string[] = [];
    let profilesCreated = 0;
    let projectsCreated = 0;
    let tipsCreated = 0;
    let postsCreated = 0;

    // 1. 현재 인증된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        message: '시드 데이터 생성을 위해서는 로그인이 필요합니다.',
        errors: [authError?.message || 'No authenticated user']
      };
    }

    console.warn('👤 Current user:', user.id);

    // 2. 현재 사용자의 프로필 생성/업데이트
    const currentUserProfile = {
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'currentuser',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Current User',
      bio: '현재 로그인한 사용자입니다.',
      avatar_url: user.user_metadata?.avatar_url || null,
      tech_stack: ['React', 'TypeScript', 'Supabase'],
      is_online: true,
      project_count: 0,
      follower_count: 0,
      following_count: 0,
      github_url: null,
      website_url: null,
      twitter_url: null,
      linkedin_url: null,
    };

    // 현재 사용자 프로필 upsert
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(currentUserProfile, { onConflict: 'id' });

    if (profileError) {
      errors.push(`Current user profile creation failed: ${profileError.message}`);
    } else {
      profilesCreated++;
      console.warn('✅ Current user profile created/updated');
    }

    // 3. 샘플 사용자들을 위한 임시 사용자 ID 생성 (실제로는 Auth 사용자 생성 필요)
    // 개발 환경에서는 현재 사용자만 사용하여 데이터 생성
    
    // 4. 현재 사용자로 샘플 프로젝트 생성
    for (const project of sampleProjects) {
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
        });

      if (projectError) {
        errors.push(`Project creation failed: ${projectError.message}`);
      } else {
        projectsCreated++;
      }
    }

    // 5. 현재 사용자로 샘플 팁 생성
    for (const tip of sampleTips) {
      const { error: tipError } = await supabase
        .from('tips')
        .insert({
          ...tip,
          user_id: user.id,
        });

      if (tipError) {
        errors.push(`Tip creation failed: ${tipError.message}`);
      } else {
        tipsCreated++;
      }
    }

    // 6. 현재 사용자로 샘플 포스트 생성
    for (const post of samplePosts) {
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          ...post,
          user_id: user.id,
        });

      if (postError) {
        errors.push(`Post creation failed: ${postError.message}`);
      } else {
        postsCreated++;
      }
    }

    // 7. 프로필의 project_count 업데이트
    if (projectsCreated > 0) {
      await supabase
        .from('profiles')
        .update({ project_count: projectsCreated })
        .eq('id', user.id);
    }

    const success = errors.length === 0;
    
    console.warn('🎯 Seed data creation _result:', {
      success,
      profilesCreated,
      projectsCreated,
      tipsCreated,
      postsCreated,
      errorsCount: errors.length
    });

    return {
      success,
      message: success 
        ? '시드 데이터가 성공적으로 생성되었습니다!' 
        : '시드 데이터 생성 중 일부 오류가 발생했습니다.',
      data: {
        profiles: profilesCreated,
        projects: projectsCreated,
        tips: tipsCreated,
        posts: postsCreated,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('💥 Seed data creation failed:', error);
    return {
      success: false,
      message: '시드 데이터 생성 중 오류가 발생했습니다.',
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * 기존 시드 데이터 삭제 (개발용)
 */
export async function clearSeedData(): Promise<SeedDataResult> {
  try {
    console.warn('🧹 Clearing existing seed data...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        message: '데이터 삭제를 위해서는 로그인이 필요합니다.',
      };
    }

    // 현재 사용자의 데이터만 삭제
    await Promise.all([
      supabase.from('posts').delete().eq('user_id', user.id),
      supabase.from('tips').delete().eq('user_id', user.id),
      supabase.from('projects').delete().eq('user_id', user.id),
    ]);

    console.warn('✅ Seed data cleared successfully');
    
    return {
      success: true,
      message: '기존 시드 데이터가 삭제되었습니다.',
    };

  } catch (error) {
    console.error('💥 Clear seed data failed:', error);
    return {
      success: false,
      message: '데이터 삭제 중 오류가 발생했습니다.',
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * 데이터베이스 상태 확인
 */
export async function checkDatabaseStatus() {
  try {
    const [profilesResult, projectsResult, tipsResult, postsResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('tips').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
    ]);

    return {
      profiles: profilesResult.count || 0,
      projects: projectsResult.count || 0,
      tips: tipsResult.count || 0,
      posts: postsResult.count || 0,
    };
  } catch (error) {
    console.error('Database status check failed:', error);
    return {
      profiles: 0,
      projects: 0,
      tips: 0,
      posts: 0,
    };
  }
}