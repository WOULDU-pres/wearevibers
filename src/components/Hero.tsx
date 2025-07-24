import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-vibe-purple rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-vibe-coral rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-vibe-purple rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-vibe-coral rounded-full animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 bg-gradient-vibe/10 px-4 py-2 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Share Your Creative Journey</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-vibe bg-clip-text text-transparent">
            Code Your Vibe
          </span>
          <br />
          <span className="text-foreground">Share Your Story</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          WeAreVibers는 단순한 포트폴리오가 아닌, 
          <br className="hidden md:block" />
          개발자의 감성과 창작 과정을 공유하는 커뮤니티입니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-vibe hover:scale-105 transition-all duration-300 shadow-vibe px-8 py-6 text-lg font-semibold"
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
            <div className="text-3xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">Creative Projects</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">856</div>
            <div className="text-sm text-muted-foreground">Active Vibers</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">12,394</div>
            <div className="text-sm text-muted-foreground">Vibes Shared</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;