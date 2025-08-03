import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, MessageSquare, Lightbulbs, LogOut, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

interface MobileMenuProps {
  className?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Showcase", icon: Home },
  { href: "/lounge", label: "Lounge", icon: MessageSquare },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/members", label: "Members", icon: Users },
];

export default function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        toast.error('로그아웃에 실패했습니다.');
      } else {
        toast.success('로그아웃되었습니다.');
        setIsOpen(false);
        navigate('/');
      }
    } catch (err) {
      console.error('Logout exception:', err);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`md:hidden hover:bg-accent ${className}`}
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={logoImg} alt="WeAreVibers" className="w-8 h-8" />
                <SheetTitle className="text-xl font-bold text-primary">
                  WeAreVibers
                </SheetTitle>
              </div>
            </div>
          </SheetHeader>

          <Separator />

          {/* User Section */}
          {user && (
            <>
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username} />
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {profile?.username?.slice(0, 2) || profile?.full_name?.slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {profile?.full_name || profile?.username || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{profile?.username || user.email}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Navigation */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={`w-full justify-start px-3 py-2 h-12 ${
                      isActive 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    onClick={() => handleNavigation(item.href)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Quick Actions
              </p>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  className="w-full justify-start px-3 py-2 h-12 border-primary/20 hover:border-primary hover:bg-primary/10"
                  onClick={() => handleNavigation('/tips/create')}
                >
                  <Plus className="w-5 h-5 mr-3" />
                  <span className="font-medium">Share Content</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 pt-0">
            <Separator className="mb-4" />
            <div className="space-y-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 h-12"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span className="font-medium">Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleNavigation('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                    onClick={() => handleNavigation('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}