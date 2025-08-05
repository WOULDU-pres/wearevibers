import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditableAvatarProps } from "@/types";

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32",
  xl: "w-40 h-40"
};

const buttonSizeMap = {
  sm: "w-6 h-6",
  md: "w-7 h-7",
  lg: "w-8 h-8", 
  xl: "w-10 h-10"
};

export const ProfileAvatar = ({
  src,
  alt,
  fallbackText,
  userId,
  size = "lg",
  editable = false,
  onAvatarUpdate,
  className
}: EditableAvatarProps) => {
  const { uploadProfileImage } = useFileUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    if (!userId || !editable) return;

    try {
      setUploading(true);
      const avatarUrl = await uploadProfileImage(file, userId);
      
      if (avatarUrl) {
        onAvatarUpdate?.(avatarUrl);
        toast.success("프로필 이미지가 업데이트되었습니다!");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("프로필 이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <div className={cn("relative group", className)}>
        <Avatar className={cn(sizeMap[size], "border-4 border-background")}>
          <AvatarImage src={src || ""} alt={alt} />
          <AvatarFallback className="text-2xl font-semibold">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        
        {editable && (
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              buttonSizeMap[size],
              "absolute bottom-1 right-1 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={() => setIsDialogOpen(true)}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {editable && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>프로필 이미지 변경</DialogTitle>
            </DialogHeader>
            <FileUpload
              onFileSelect={handleAvatarUpload}
              accept="image/*"
              maxSize={5}
              className="mt-4"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};