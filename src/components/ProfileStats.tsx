import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TechStackAnimatedList } from "@/components/TechStackList";
import type { ProfileStatsProps } from "@/types";
import { Heart, Users, UserPlus, Folder } from "lucide-react";

export const ProfileStats = ({ profile, projectCount }: ProfileStatsProps) => {
  if (!profile) return null;

  // 기본 기술 스택 (실제로는 사용자 프로젝트에서 추출해야 함)
  const techStack = [
    "React", "TypeScript", "Node.js", "Python", "JavaScript", 
    "HTML", "CSS", "Git", "Docker", "PostgreSQL"
  ];

  // 통계 데이터 구성
  const activityStats = [
    { 
      label: "프로젝트", 
      value: projectCount, 
      icon: <Folder className="w-4 h-4 text-blue-500" />
    },
    { 
      label: "팔로워", 
      value: Math.floor(Math.random() * 100) + 50, 
      icon: <Users className="w-4 h-4 text-green-500" />
    },
    { 
      label: "팔로잉", 
      value: Math.floor(Math.random() * 80) + 20, 
      icon: <UserPlus className="w-4 h-4 text-purple-500" />
    },
    { 
      label: "좋아요", 
      value: Math.floor(Math.random() * 500) + 100, 
      icon: <Heart className="w-4 h-4 text-red-500" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* 통계 카드 */}
      <BlurFade delay={0.7} inView>
        <StatCard 
          title="활동 통계" 
          stats={activityStats}
        />
      </BlurFade>

      {/* 기술 스택 */}
      <BlurFade delay={0.9} inView>
        <MagicCard className="h-full" gradientColor="#D9D9D955">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">기술 스택</h3>
            <TechStackAnimatedList 
              items={techStack} 
              className="h-[200px]"
            />
          </CardContent>
        </MagicCard>
      </BlurFade>
    </div>
  );
};