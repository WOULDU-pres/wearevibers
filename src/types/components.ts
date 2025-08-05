import type { ReactNode } from "react";
import type { Profile } from "@/lib/supabase-types";

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Size variants commonly used across components
export type SizeVariant = "sm" | "md" | "lg" | "xl";
export type ComponentVariant = "default" | "outline" | "ghost" | "destructive";

// Avatar related types
export interface AvatarProps extends BaseComponentProps {
  src?: string | null;
  alt: string;
  fallbackText: string;
  size?: SizeVariant;
}

export interface EditableAvatarProps extends AvatarProps {
  userId?: string;
  editable?: boolean;
  onAvatarUpdate?: (url: string) => void;
}

// Profile related component props
export interface ProfileComponentProps extends BaseComponentProps {
  profile: Profile | null;
}

export interface ProfileHeaderProps extends ProfileComponentProps {
  isEditing: boolean;
  loading: boolean;
  onEditToggle: () => void;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

export interface ProfileStatsProps extends ProfileComponentProps {
  projectCount: number;
}

// Statistics and data display
export interface StatItem {
  label: string;
  value: number;
  icon?: ReactNode;
  color?: string;
}

export interface StatCardProps extends BaseComponentProps {
  title: string;
  stats: StatItem[];
  gradientColor?: string;
}

// Social links
export type SocialPlatform = 'github' | 'twitter' | 'linkedin' | 'website';

export interface SocialLink {
  type: SocialPlatform;
  url: string;
  label?: string;
}

export interface SocialLinksProps extends BaseComponentProps {
  links: SocialLink[];
  variant?: ComponentVariant;
  size?: SizeVariant;
}

// Form and input related
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Navigation and menu
export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export interface MobileMenuProps extends BaseComponentProps {
  items?: NavigationItem[];
}

// Loading and state management
export interface LoadingProps {
  loading: boolean;
  error?: string | null;
}

export interface AsyncComponentProps extends LoadingProps {
  retry?: () => void;
}

// Modal and dialog
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// Image optimization
export interface OptimizedImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
}

// File upload
export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFileSelect: (files: File | File[]) => void;
  disabled?: boolean;
}

// Protected routes
export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}