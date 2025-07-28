import { Github, Twitter, Instagram, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src={logoImg} alt="WeAreVibers" className="w-8 h-8" />
              <span className="text-lg font-bold text-primary font-semibold">
                WeAreVibers
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              개발자의 감성과 창작 과정을 공유하는 커뮤니티 플랫폼
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                <Github className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/showcase" className="text-muted-foreground hover:text-primary transition-colors">Showcase</a></li>
              <li><a href="/lounge" className="text-muted-foreground hover:text-primary transition-colors">Vibe Lounge</a></li>
              <li><a href="/tips" className="text-muted-foreground hover:text-primary transition-colors">Vibe Tips</a></li>
              <li><a href="/members" className="text-muted-foreground hover:text-primary transition-colors">Members</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="text-muted-foreground hover:text-primary transition-colors">도움말</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">문의하기</a></li>
              <li><a href="/feedback" className="text-muted-foreground hover:text-primary transition-colors">피드백</a></li>
              <li><a href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">커뮤니티 가이드</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">이용약관</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">개인정보처리방침</a></li>
              <li><a href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">쿠키 정책</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 WeAreVibers. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Made with ❤️ by the Vibers community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;