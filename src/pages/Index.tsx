import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
// import { SentryTestButton } from "@/components/SentryTestButton"; // Sentry 테스트 버튼 (개발용)
import { DataSeeder } from "@/components/dev/DataSeeder";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      {/* 개발 환경에서만 Sentry 테스트 버튼 및 데이터 시더 표시 */}
      {import.meta.env.DEV && (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* <SentryTestButton /> */}
          
          {/* RLS 문제 해결을 위한 시드 데이터 생성 도구 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold text-yellow-800">
                데이터베이스가 비어있어서 RLS 타임아웃이 발생하고 있습니다
              </h2>
            </div>
            <p className="text-yellow-700 mb-4">
              프로젝트 목록, 팁, 포스트 등이 표시되지 않는 이유는 데이터베이스에 실제 데이터가 없기 때문입니다.
              아래 도구를 사용해서 테스트용 데이터를 생성해주세요.
            </p>
            <DataSeeder />
          </div>
        </div>
      )}
      
      {/* 프로덕션에서는 경고 메시지만 표시 */}
      {import.meta.env.PROD && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-700">
              아직 프로젝트가 등록되지 않았습니다. 첫 번째 프로젝트를 등록해보세요!
            </p>
          </div>
        </div>
      )}

      <ProjectGrid />
      <Footer />
    </div>
  );
};

export default Index;
