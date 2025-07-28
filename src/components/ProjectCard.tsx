import { Heart, ExternalLink, Github, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
}

const ProjectCard = ({ 
  title, 
  description, 
  image, 
  author, 
  vibes, 
  tags, 
  vibeEmoji,
  isVibed = false 
}: ProjectCardProps) => {
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
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white">
            <Github className="w-4 h-4" />
          </Button>
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
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
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
              <span className="text-sm">12</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;