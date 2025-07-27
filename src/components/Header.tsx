import { Search, Bell, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const Header = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        toast.error('로그아웃에 실패했습니다.');
      } else {
        toast.success('로그아웃되었습니다.');
        navigate('/');
      }
    } catch (err) {
      console.error('Logout exception:', err);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <img src={logoImg} alt="WeAreVibers" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
                WeAreVibers
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Showcase
              </Link>
              <Link to="/lounge" className="text-muted-foreground hover:text-primary transition-colors">
                Lounge
              </Link>
              <Link to="/tips" className="text-muted-foreground hover:text-primary transition-colors">
                Tips
              </Link>
              <Link to="/members" className="text-muted-foreground hover:text-primary transition-colors">
                Members
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search projects, tips, vibes..." 
                className="pl-10 bg-muted/50 border-border hover:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <Search className="w-5 h-5 lg:hidden" />
              <Bell className="w-5 h-5 hidden lg:block" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center space-x-2 border-primary/20 hover:border-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4" />
              <span>Share</span>
            </Button>
            
            {/* Login/Profile Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                // Authenticated user actions
                <>
                  <span className="hidden md:block text-sm text-muted-foreground">
                    안녕하세요, {profile?.username || user.email}님
                  </span>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-muted"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-muted"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                // Guest user actions
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="hidden md:flex"
                  >
                    Sign In
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-vibe hover:opacity-90 text-white border-0"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;