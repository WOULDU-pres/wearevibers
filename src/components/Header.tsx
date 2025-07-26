import { Search, Bell, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImg from "@/assets/logo.png";

const Header = () => {
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
              <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Showcase
              </a>
              <a href="/lounge" className="text-muted-foreground hover:text-primary transition-colors">
                Lounge
              </a>
              <a href="/tips" className="text-muted-foreground hover:text-primary transition-colors">
                Tips
              </a>
              <a href="/members" className="text-muted-foreground hover:text-primary transition-colors">
                Members
              </a>
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
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="hidden md:flex"
              >
                Sign In
              </Button>
              
              <Button 
                size="sm"
                onClick={() => window.location.href = '/signup'}
                className="bg-gradient-vibe hover:opacity-90 text-white border-0"
              >
                Sign Up
              </Button>
              
              {/* User Profile Button (will be shown when logged in) */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-muted hidden"
                onClick={() => window.location.href = '/profile'}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;