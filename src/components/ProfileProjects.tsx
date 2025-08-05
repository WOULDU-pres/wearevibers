import { BlurFade } from "@/components/ui/blur-fade";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/ProjectCard";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/lib/supabase-types";

type Project = Tables<'projects'>;

interface ProfileProjectsProps {
  projects: Project[] | undefined;
  isLoading: boolean;
}

export const ProfileProjects = ({ projects, isLoading }: ProfileProjectsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">프로젝트를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <BlurFade delay={1.0} inView>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체 프로젝트</TabsTrigger>
          <TabsTrigger value="featured">추천 프로젝트</TabsTrigger>
          <TabsTrigger value="recent">최근 프로젝트</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <BlurFade key={project.id} delay={1.1 + index * 0.1} inView>
                  <ProjectCard project={project} />
                </BlurFade>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">아직 프로젝트가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                첫 번째 프로젝트를 만들어보세요!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="featured" className="mt-6">
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter(project => project.featured) // featured가 true인 프로젝트만
                .map((project, index) => (
                  <BlurFade key={project.id} delay={1.1 + index * 0.1} inView>
                    <ProjectCard project={project} />
                  </BlurFade>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">추천 프로젝트가 없습니다.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-6">
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 6) // 최근 6개만
                .map((project, index) => (
                  <BlurFade key={project.id} delay={1.1 + index * 0.1} inView>
                    <ProjectCard project={project} />
                  </BlurFade>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">최근 프로젝트가 없습니다.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BlurFade>
  );
};