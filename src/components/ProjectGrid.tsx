import ProjectCard from "./ProjectCard";
import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";
import project4 from "@/assets/project4.jpg";

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
    isVibed: true
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
    vibeEmoji: "✨"
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
    vibeEmoji: "📊"
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
    isVibed: true
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
    vibeEmoji: "🤖"
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
    vibeEmoji: "🎨"
  }
];

const ProjectGrid = () => {
  return (
    <section className="py-16 px-4">
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["All", "Frontend", "Backend", "Mobile", "Design", "AI/ML"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === "All"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {mockProjects.map((project) => (
            <div key={project.id} className="break-inside-avoid">
              <ProjectCard {...project} />
            </div>
          ))}
        </div>

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