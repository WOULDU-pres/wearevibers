import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ShareButton from "@/components/ui/share-button";
import ShareModal from "@/components/ui/share-modal";
import { useShareProject } from "@/hooks/useShareProject";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: Record<string, unknown>;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0 w-full h-full"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium text-neutral-50">
          {card.title}
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

type ProjectCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  vibes: number;
  tags: string[];
  vibeEmoji?: string;
  isVibed?: boolean;
};

const ProjectFocusCard = React.memo(
  ({
    project,
    index,
    hovered,
    setHovered,
  }: {
    project: ProjectCard;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    const navigate = useNavigate();
    const {
      isShareModalOpen,
      shareUrl,
      openShareModal,
      closeShareModal,
      handleCopyLink,
      handleDirectLink,
    } = useShareProject({ projectId: project.id, projectTitle: project.title });

    const handleProjectClick = (e: React.MouseEvent) => {
      // 공유 버튼 클릭 시에는 프로젝트 페이지로 이동하지 않음
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      navigate(`/projects/${project.id}`);
    };

    return (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onClick={handleProjectClick}
        className={cn(
          "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer",
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
        )}
      >
        <img
          src={project.image}
          alt={project.title}
          className="object-cover absolute inset-0 w-full h-full"
        />
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex flex-col justify-end p-6 transition-opacity duration-300",
            hovered === index ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-white space-y-2">
            <h3 className="text-xl md:text-2xl font-bold leading-tight">
              {project.title}
            </h3>
            <p className="text-sm md:text-base text-gray-200 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <img
                  src={project.author.avatar}
                  alt={project.author.name}
                  className="w-6 h-6 rounded-full border border-white/30"
                />
                <span className="text-sm font-medium">{project.author.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-lg">{project.vibeEmoji || '💖'}</span>
                  <span className="text-sm font-medium">{project.vibes}</span>
                </div>
                <ShareButton 
                  onShare={openShareModal}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/20 h-8 px-2"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          projectId={project.id}
          projectTitle={project.title}
          shareUrl={shareUrl}
          onCopyLink={handleCopyLink}
          onDirectLink={handleDirectLink}
        />
      </div>
    );
  }
);

ProjectFocusCard.displayName = "ProjectFocusCard";

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

export function ProjectFocusCards({ projects }: { projects: ProjectCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
      {projects.map((project, index) => (
        <ProjectFocusCard
          key={project.id}
          project={project}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
