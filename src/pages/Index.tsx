import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
import { SentryTestButton } from "@/components/SentryTestButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* 개발 환경에서만 Sentry 테스트 버튼 표시 */}
      {import.meta.env.DEV && (
        <div className="container mx-auto px-4 py-8">
          <SentryTestButton />
        </div>
      )}
      
      <ProjectGrid />
      <Footer />
    </div>
  );
};

export default Index;
