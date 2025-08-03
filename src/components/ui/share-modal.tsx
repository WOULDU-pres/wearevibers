import { useState } from "react";
import { Copy, ExternalCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  shareUrl: string;
  onCopyLink: () => void;
  onDirectLink: () => void;
}

const ShareModal = ({ 
  isOpen, 
  onClose, 
  projectId,
  projectTitle, 
  shareUrl, 
  onCopy,
  onDirectLink,
}: ShareModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("링크가 클립보드에 복사되었습니다!");
      onCopyLink();
      
      // 3초 후 복사 상태 리셋
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setIsCopied(true);
        toast.success("링크가 클립보드에 복사되었습니다!");
        onCopyLink();
        
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      } catch (fallbackError) {
        toast.error("링크 복사에 실패했습니다. 수동으로 복사해주세요.");
      }
      
      document.body.removeChild(textArea);
    }
  };

  const handleDirectLink = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    onDirectLink();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 공유</DialogTitle>
          <DialogDescription>
            "{projectTitle}" 프로젝트를 다른 사람들과 공유하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 공유 링크 표시 */}
          <div className="space-y-2">
            <Label htmlFor="share-url">공유 링크</Label>
            <div className="flex space-x-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className={isCopied ? "bg-green-50 border-green-200" : ""}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 공유 옵션 */}
          <div className="space-y-2">
            <Label>공유 옵션</Label>
            <div className="flex space-x-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1"
                disabled={isCopied}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isCopied ? "복사됨!" : "링크 복사"}
              </Button>
              <Button
                onClick={handleDirectLink}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                새 탭에서 열기
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;