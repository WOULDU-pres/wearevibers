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
  { name: "전체", value: "all", icon: Layout },
  { name: "프론트엔드", value: "frontend", icon: Code },
  { name: "백엔드", value: "backend", icon: Globe },
  { name: "모바일", value: "mobile", icon: Smartphone },
  { name: "디자인", value: "design", icon: Palette },
  { name: "AI/ML", value: "ai", icon: Brain },
];

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "React Code Editor",
    description: "스타트업에서 개발팀이 2주간 야근하며 만든 코드 에디터. VS Code보다 가벼우면서도 필수 기능은 모두 포함하려 했던 도전적인 프로젝트입니다. 특히 실시간 콜라보레이션 기능 구현에서 WebSocket 최적화가 핵심이었습니다.",
    image: project1,
    author: {
      name: "김준혁",
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
    description: "UX 디자이너에서 개발자로 전향한 후 첫 개인 프로젝트. 사용자가 정말 필요한 기능만 남기고 모든 걸 덜어냈습니다. 애니메이션 하나하나가 사용성을 고려한 결과물이며, 앱스토어 리뷰에서 '직관적'이라는 평가를 많이 받았습니다.",
    image: project2,
    author: {
      name: "이서현",
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
    description: "대기업 인턴십 중 만든 실시간 매출 대시보드. 기획자들이 '숫자만 봐서는 모르겠다'며 요청한 프로젝트였는데, D3.js로 인터랙티브한 차트를 만들어 데이터 스토리텔링에 성공했습니다. 이 프로젝트 덕분에 정직원 제안을 받았어요.",
    image: project3,
    author: {
      name: "박성민",
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
    description: "친구와 함께 창업한 온라인 쇼핑몰 프로젝트. 기존 솔루션들은 너무 복잡하다고 생각해서 직접 만들었습니다. 특히 모바일 결제 플로우를 3단계로 줄이는 데 성공해서 전환율이 기존 대비 40% 향상되었어요. 현재 월 매출 천만원 돌파!",
    image: project4,
    author: {
      name: "최은지",
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
    description: "ChatGPT가 나오기 전부터 만들어온 개인 AI 어시스턴트. 처음엔 단순한 챗봇이었는데, 점점 발전시켜서 이제는 컨텍스트를 기억하고 개인화된 답변을 해줍니다. OpenAI API 최적화로 응답 속도를 2초에서 0.5초로 단축한 게 가장 뿌듯해요.",
    image: project1,
    author: {
      name: "정현우",
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
    description: "디자인과 개발을 함께 하는 프리랜서로 활동하며 만든 포트폴리오. 클라이언트들이 '이런 사이트는 처음 봤다'며 놀라는 반응을 보고 싶어서 GSAP로 과감한 애니메이션을 시도했습니다. 덕분에 의뢰가 3배 늘었어요.",
    image: project2,
    author: {
      name: "윤채영",
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
    description: "사이드 프로젝트가 갑자기 유명해져서 급하게 확장한 백엔드. 처음엔 단순한 Express 서버였는데, 사용자가 10만명을 넘으면서 Redis 캐싱과 로드밸런싱을 도입했습니다. 새벽 3시에 서버 다운되는 경험을 겪고 난 후 모니터링의 중요성을 뼈저리게 느꼈어요.",
    image: project3,
    author: {
      name: "김도현",
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
    description: "대학원 연구실에서 시작한 반려동물 품종 분류 모델. 처음엔 60% 정확도로 시작했는데, 데이터 증강과 전이학습으로 95%까지 끌어올렸습니다. 이 모델로 스타트업에 취업했고, 현재는 실제 반려동물 앱에서 월 100만건 이상 사용되고 있어요.",
    image: project4,
    author: {
      name: "박준영",
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
  const _getCategoryCount = (category: string) => {
    if (category === "all") return mockProjects.length;
    return mockProjects.filter(project => project.category === category).length;
  };

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            최신 <span className="text-primary font-semibold">프로젝트</span>
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
          <button className="bg-secondary border border-primary/20 text-primary px-8 py-3 rounded-lg font-medium hover:border-primary hover:shadow-soft transition-all duration-300">
            더 많은 프로젝트 보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;