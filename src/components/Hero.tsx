import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { useAuthStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "@/components/GlobalSearch";

const Hero = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleShareProject = () => {
    if (user) {
      // 로그인된 사용자는 바로 프로젝트 생성 페이지로
      navigate('/projects/create');
    } else {
      // 비로그인 사용자는 로그인 페이지로 (리다이렉트 파라미터 포함)
      navigate('/login?redirect=/projects/create');
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
      {/* RetroGrid Background */}
      <RetroGrid
        className="absolute inset-0"
        opacity={1.0}
        cellSize={50}
        angle={65}
        lightLineColor="hsl(var(--vibe-purple) / 0.3)"
        darkLineColor="hsl(var(--vibe-purple) / 0.5)"
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
            <span
              className={cn(
                "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
              )}
              style={{
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            ✨
            <AnimatedGradientText className="text-sm font-medium">
              Share Your Creative Journey
            </AnimatedGradientText>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {/* <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#9c40ff] via-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent font-bold tracking-tighter"> */}
          <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#9c40ff] via-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent font-bold tracking-tighter">
            Code Your Vibe
          </span>
          <br />
          <span className="pointer-events-none z-10 whitespace-pre-wrap text-black font-bold tracking-tighter">
            Share Your Story
          </span>
          <br />
          <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#4ecdc4] via-[#45b7d1] to-[#9c40ff] bg-clip-text text-transparent font-bold tracking-tighter">
            We Are Vibers
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          WeAreVibers는 단순한 포트폴리오가 아닌,
          <br className="hidden md:block" />
          개발자의 감성과 창작 과정을 공유하는 커뮤니티입니다.
        </p>

        {/* 모바일 검색 바 */}
        <div className="w-full max-w-md mx-auto mb-8 lg:hidden">
          <div className="relative">
            <GlobalSearch
              variant="desktop"
              placeholder="프로젝트, 팁, 사용자 검색..."
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-vibe px-8 py-6 text-lg font-semibold text-primary-foreground"
            onClick={handleShareProject}
          >
            <span>프로젝트 공유하기</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-primary/30 hover:border-primary hover:bg-primary/5 px-8 py-6 text-lg font-medium"
          >
            커뮤니티 둘러보기
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">베타 테스트</div>
            <div className="text-sm text-muted-foreground">
              현재 상태
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">커뮤니티</div>
            <div className="text-sm text-muted-foreground">성장 중</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">곧 공개</div>
            <div className="text-sm text-muted-foreground">정식 출시</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
