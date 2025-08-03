import { Heart, ExternalGithub as _ExternalGithub, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShareButton from "@/components/ui/share-button";
import ShareModal from "@/components/ui/share-modal";
import { useShareProject } from "@/hooks/useShareProject";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
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
  vibeEmoji: string;
  isVibed?: boolean;
  githubUrl?: string;
  demoUrl?: string;
  commentCount?: number;
}

const ProjectCard = ({ 
  id,
  title, 
  description, 
  image, 
  author, 
  vibes, 
  tags, 
  vibeEmoji,
  isVibed = false,
  githubUrl,
  demoUrl,
  commentCount = 0
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const {
    isShareModalOpen,
    shareUrl,
    openShareModal,
    closeShareModal,
    handleCopyLink,
    handleDirectLink,
  } = useShareProject({ projectId: id, projectTitle: title });

  const handleViewDetails = () => {
    navigate(`/projects/${id}`);
  };
  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-vibe transition-all duration-300 hover:-translate-y-1 border border-border/50">
      {/* Project Image */}
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {demoUrl && (
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white" asChild>
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
          {githubUrl && (
            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white" asChild>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={author.avatar} />
            <AvatarFallback className="text-xs">{author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{author.name}</span>
          <span className="text-lg">{vibeEmoji}</span>
        </div>

        {/* Title & Description */}
        <h3 
          className="font-semibold text-card-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
          onClick={handleViewDetails}
        >
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center space-x-1 px-2 py-1 h-8 ${
                isVibed 
                  ? 'text-accent hover:text-accent/80' 
                  : 'text-muted-foreground hover:text-accent'
              } transition-colors`}
            >
              <Heart className={`w-4 h-4 ${isVibed ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{vibes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1 px-2 py-1 h-8 text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{commentCount}</span>
            </Button>
            
            <ShareButton onShare={openShareModal} />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewDetails}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View Details
          </Button>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
        projectId={id}
        projectTitle={title}
        shareUrl={shareUrl}
        onCopyLink={handleCopyLink}
        onDirectLink={handleDirectLink}
      />
    </div>
  );
};

export default ProjectCard;