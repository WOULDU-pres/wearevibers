import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  onShare: () => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline" | "secondary";
  className?: string;
}

const ShareButton = ({ 
  onShare, 
  disabled = false, 
  size = "sm", 
  variant = "ghost",
  className = ""
}: ShareButtonProps) => {
  return (
    <Button 
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onShare}
      className={`flex items-center space-x-1 px-2 py-1 h-8 text-muted-foreground hover:text-primary transition-colors ${className}`}
      aria-label="프로젝트 공유"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm">공유</span>
    </Button>
  );
};

export default ShareButton;