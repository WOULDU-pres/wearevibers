import { Button } from "@/components/ui/button";
import { Github, Twitter, Globe, Linkedin } from "lucide-react";
import type { SocialLinksProps } from "@/types";

const socialIconMap = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  website: Globe,
};

const socialLabelMap = {
  github: "GitHub",
  twitter: "Twitter", 
  linkedin: "LinkedIn",
  website: "웹사이트",
};

export const SocialLinks = ({ 
  links, 
  variant = "outline", 
  size = "sm",
  className = "" 
}: SocialLinksProps) => {
  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link, index) => {
        const Icon = socialIconMap[link.type];
        const label = link.label || socialLabelMap[link.type];
        
        return (
          <Button 
            key={index}
            variant={variant} 
            size={size} 
            asChild
          >
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          </Button>
        );
      })}
    </div>
  );
};