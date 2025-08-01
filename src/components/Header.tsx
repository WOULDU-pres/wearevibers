import { Bell, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import GlobalSearch from "@/components/GlobalSearch";
import MobileMenu from "@/components/MobileMenu";
import NotificationCenter from "@/components/NotificationCenter";
import logoImg from "@/assets/logo.png";

const Header = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    console.log("🚀 Logout button clicked - handleSignOut called");
    try {
      console.log("🔄 Calling signOut function...");
      const { error } = await signOut();
      console.log("📊 SignOut result:", { error });

      if (error) {
        console.error("❌ SignOut failed:", error);
        toast.error("로그아웃에 실패했습니다.");
      } else {
        console.log("✅ SignOut successful, navigating to home");
        toast.success("로그아웃되었습니다.");
        navigate("/");
      }
    } catch (err) {
      console.error("💥 Logout exception:", err);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center space-x-3">
            <MobileMenu />

            <Link to="/" className="flex items-center space-x-2">
              <img src={logoImg} alt="WeAreVibers" className="w-8 h-8" />
              <span className="text-xl font-bold text-black font-semibold">
                WeAreVibers
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Showcase
            </Link>
            <Link
              to="/lounge"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Lounge
            </Link>
            <Link
              to="/tips"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Tips
            </Link>
            <Link
              to="/members"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Members
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <GlobalSearch
              variant="desktop"
              placeholder="Search projects, tips, users..."
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <GlobalSearch variant="mobile" />
            
            {/* Notification Center - 로그인한 사용자만 표시 */}
            {user && (
              <div className="hidden lg:block">
                <NotificationCenter />
              </div>
            )}

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
                    onClick={() => navigate("/profile")}
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
                    onClick={() => navigate("/login")}
                    className="hidden md:flex"
                  >
                    Sign In
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
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
