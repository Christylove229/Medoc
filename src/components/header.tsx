import { Button } from "@/components/ui/button";
import { Pill, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isOnMissionPage = location.pathname === '/mission';
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    window.location.href = '/contact';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Pill className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">PharmaCity</span>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <a href="/" className="text-sm xl:text-base text-foreground hover:text-primary transition-colors">
              Accueil
            </a>
            {!isOnMissionPage && (
              <button 
                onClick={() => scrollToSection('comment-ca-marche')} 
                className="text-sm xl:text-base text-foreground hover:text-primary transition-colors"
              >
                Comment ça marche
              </button>
            )}
            <a href="/mission" className="text-sm xl:text-base text-foreground hover:text-primary transition-colors">
              Notre mission
            </a>
            <button 
              onClick={handleContactClick} 
              className="text-sm xl:text-base text-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Menu Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-border bg-white rounded-lg shadow-soft">
            <nav className="flex flex-col space-y-3 sm:space-y-4 text-left">
              <a href="/" className="text-base sm:text-lg text-foreground hover:text-primary transition-colors">
                Accueil
              </a>
              {!isOnMissionPage && (
                <button 
                  onClick={() => scrollToSection('comment-ca-marche')} 
                  className="text-base sm:text-lg text-foreground hover:text-primary transition-colors text-left"
                >
                  Comment ça marche
                </button>
              )}
              <a href="/mission" className="text-base sm:text-lg text-foreground hover:text-primary transition-colors">
                Notre mission
              </a>
              <button 
                onClick={handleContactClick} 
                className="text-base sm:text-lg text-foreground hover:text-primary transition-colors text-left"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;