import { ProjectFocusCards } from "./ui/focus-cards";
import { NavBar } from "./ui/tubelight-navbar";
import { Code, Palette, Smartphone, Brain, Layout, Globe } from "lucide-react";
import { useUIStore } from "@/stores";
import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";
import project4 from "@/assets/project4.jpg";

// Project categories for navigation
const projectCategories = [
  { name: "All", value: "all", icon: Layout },
  { name: "Frontend", value: "frontend", icon: Code },
  { name: "Backend", value: "backend", icon: Globe },
  { name: "Mobile", value: "mobile", icon: Smartphone },
  { name: "Design", value: "design", icon: Palette },
  { name: "AI/ML", value: "ai", icon: Brain },
];

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "React Code Editor",
    description: "깔끔하고 현대적인 코드 에디터 인터페이스. 구문 강조와 테마 지원이 특징입니다.",
    image: project1,
    author: {
      name: "김민준",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 124,
    tags: ["React", "TypeScript", "Monaco Editor"],
    vibeEmoji: "🚀",
    isVibed: true,
    category: "frontend"
  },
  {
    id: "2",
    title: "Minimalist Mobile App",
    description: "사용자 경험을 중시한 미니멀 디자인의 모바일 앱. 부드러운 애니메이션이 인상적입니다.",
    image: project2,
    author: {
      name: "이서연",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 89,
    tags: ["React Native", "Design", "UX/UI"],
    vibeEmoji: "✨",
    category: "mobile"
  },
  {
    id: "3",
    title: "Data Visualization Dashboard",
    description: "복잡한 데이터를 직관적으로 보여주는 대시보드. 인터랙티브 차트와 실시간 업데이트 지원.",
    image: project3,
    author: {
      name: "박지훈",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 156,
    tags: ["D3.js", "Chart.js", "Analytics"],
    vibeEmoji: "📊",
    category: "frontend"
  },
  {
    id: "4",
    title: "Modern E-commerce UI",
    description: "트렌디한 전자상거래 사이트 디자인. 사용자 친화적인 상품 탐색과 결제 플로우.",
    image: project4,
    author: {
      name: "최유진",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 203,
    tags: ["Next.js", "E-commerce", "Stripe"],
    vibeEmoji: "🛍️",
    isVibed: true,
    category: "design"
  },
  {
    id: "5",
    title: "AI Chat Interface",
    description: "자연스러운 대화형 AI 인터페이스. 실시간 응답과 컨텍스트 인식이 특징입니다.",
    image: project1,
    author: {
      name: "정하늘",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 78,
    tags: ["AI", "Chat", "WebSocket"],
    vibeEmoji: "🤖",
    category: "ai"
  },
  {
    id: "6",
    title: "Creative Portfolio Site",
    description: "아티스트를 위한 창의적인 포트폴리오 사이트. 독특한 레이아웃과 인터랙션.",
    image: project2,
    author: {
      name: "윤소희",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 91,
    tags: ["Portfolio", "GSAP", "Creative"],
    vibeEmoji: "🎨",
    category: "design"
  },
  {
    id: "7",
    title: "Node.js API Server",
    description: "확장 가능한 RESTful API 서버. 마이크로서비스 아키텍처와 Redis 캐싱 적용.",
    image: project3,
    author: {
      name: "김백엔드",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 142,
    tags: ["Node.js", "Express", "Redis"],
    vibeEmoji: "⚡",
    category: "backend"
  },
  {
    id: "8",
    title: "ML Image Classifier",
    description: "딥러닝 기반 이미지 분류 모델. TensorFlow와 CNN을 활용한 정확도 95% 달성.",
    image: project4,
    author: {
      name: "박AI",
      avatar: "/api/placeholder/40/40"
    },
    vibes: 187,
    tags: ["TensorFlow", "CNN", "Python"],
    vibeEmoji: "🧠",
    category: "ai"
  }
];

const ProjectGrid = () => {
  const { activeCategory, setActiveCategory } = useUIStore();

  // Filter projects based on active category
  const filteredProjects = activeCategory === "all" 
    ? mockProjects 
    : mockProjects.filter(project => project.category === activeCategory);

  // Get category count for stats
  const getCategoryCount = (category: string) => {
    if (category === "all") return mockProjects.length;
    return mockProjects.filter(project => project.category === category).length;
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest <span className="bg-gradient-vibe bg-clip-text text-transparent">Vibes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            커뮤니티 멤버들이 공유한 최신 프로젝트들을 둘러보고 영감을 받아보세요
          </p>
        </div>

        {/* Tubelight Navigation */}
        <NavBar
          items={projectCategories}
          activeItem={activeCategory}
          onItemChange={setActiveCategory}
          className="mb-16 sm:mb-12"
        />

        {/* Category Stats */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            {activeCategory === "all" ? "전체" : projectCategories.find(cat => cat.value === activeCategory)?.name} 
            {" "}분야 프로젝트 <span className="font-medium text-primary">{filteredProjects.length}개</span>
          </p>
        </div>

        {/* Focus Cards Grid */}
        <ProjectFocusCards projects={filteredProjects} />

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-soft border border-primary/20 text-primary px-8 py-3 rounded-lg font-medium hover:border-primary hover:shadow-soft transition-all duration-300">
            더 많은 프로젝트 보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;