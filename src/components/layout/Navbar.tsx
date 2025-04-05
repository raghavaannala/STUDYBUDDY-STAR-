import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Code, Search, Sparkles, Users, User, Settings, LogOut, Home, MessageSquare, Gamepad, FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignInButton } from "@/components/auth/SignInButton";
import { auth } from '@/config/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import ProfileDialog from '@/components/auth/ProfileDialog';
import { useAIAware } from '@/contexts/AIAwareContext';
import { useDeviceDetect } from '@/hooks/useMediaQuery';

const NavbarLink = ({ 
  children, 
  to, 
  isActive, 
  onClick, 
  className = "" 
}: { 
  children: React.ReactNode; 
  to: string; 
  isActive?: boolean; 
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/10 transition-colors duration-200 flex items-center ${isActive ? 'bg-purple-500/10 text-purple-300' : 'text-gray-300'} ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFounders, setShowFounders] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { isAIActive, toggleAI } = useAIAware();
  const { isMobile } = useDeviceDetect();

  const founders = [
    { id: 1, name: 'Raghava' },
    { id: 2, name: 'Deekshith' },
    { id: 3, name: 'Vikas' },
    { id: 4, name: 'Rajkumar' },
    { id: 5, name: 'Anji' }
  ];

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add mouse tracking for sparkle effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    // Create sparkle effect on click
    const handleClick = (e: MouseEvent) => {
      // Create pulse ring
      const ring = document.createElement('div');
      ring.className = 'pulse-ring';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 4000);

      // Create sparkles
      for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${e.clientX + (Math.random() - 0.5) * 100}px`;
        sparkle.style.top = `${e.clientY + (Math.random() - 0.5) * 100}px`;
        sparkle.style.setProperty('--float-duration', `${10 + Math.random() * 10}s`);
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 15000);
      }
    };

    // Create energy lines periodically
    const createEnergyLine = () => {
      const line = document.createElement('div');
      line.className = 'energy-line';
      line.style.top = `${Math.random() * 100}%`;
      document.body.appendChild(line);
      setTimeout(() => line.remove(), 3000);
    };

    const energyInterval = setInterval(createEnergyLine, 2000);

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearInterval(energyInterval);
    };
  }, []);

  // Debug mobile menu functionality
  const toggleMobileMenu = () => {
    console.log("Mobile menu toggled, current state:", isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-4 w-4 mr-2" />
    },
    {
      name: "Study",
      path: "/study",
      icon: <BookOpen className="h-4 w-4 mr-2" />
    },
    {
      name: "CodeDiploMate",
      path: "/code",
      icon: <Code className="h-4 w-4 mr-2" />
    },
    {
      name: "CodeBuddy",
      path: "/codebuddy",
      icon: <Code className="h-4 w-4 mr-2" />
    },
    {
      name: "ResumeBuddy",
      path: "/resume",
      icon: <FileText className="h-4 w-4 mr-2" />
    },
    {
      name: "Groups",
      path: "/groups",
      icon: <Users className="h-4 w-4 mr-2" />
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="h-4 w-4 mr-2" />
    },
    {
      name: "Games",
      path: "/games",
      icon: <Gamepad className="h-4 w-4 mr-2" />
    }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full ${isScrolled ? "shadow-md" : ""}`}
        style={{ 
          backgroundColor: "#1e293b", 
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(89, 142, 243, 0.1)" : "none",
          padding: isScrolled ? "0.5rem 0" : "0.75rem 0",
          margin: 0,
          width: "100%"
        }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between" style={{ backgroundColor: "#1e293b" }}>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2"
          >
            <div className="relative w-8 h-8 md:w-10 md:h-10 text-yellow-500">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-full h-full text-yellow-500 animate-pulse-slow"
              >
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`${isMobile ? 'block text-lg' : 'hidden md:block'}`}>
              <span 
                className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-blue-400 to-yellow-500 bg-clip-text text-transparent"
              >
                {isMobile ? 'SB' : 'StudyBuddy'}
              </span>
            </div>
          </button>

          {/* AI Assistant Indicator - Only show on larger screens */}
          <div className="hidden lg:flex items-center mr-3">
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${isAIActive 
              ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30' 
              : 'bg-slate-800/80 border border-slate-700/50'}`}>
              <div className={`w-2 h-2 rounded-full ${isAIActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-xs ${isAIActive ? 'text-purple-200' : 'text-slate-400'}`}>
                AI {isAIActive ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Desktop menu - Hide on mobile */}
          <div className="hidden md:flex items-center space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-slate-800/30 px-2" style={{ maxWidth: 'calc(100vw - 400px)' }}>
            {navLinks.map((link, index) => (
              <NavbarLink 
                key={index}
                to={link.path}
                isActive={location.pathname === link.path}
                onClick={() => {}}
                className="whitespace-nowrap"
              >
                <span className="flex items-center">
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </span>
              </NavbarLink>
            ))}
          </div>

          {/* Mobile menu button - Bigger touch target */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="p-3 text-gray-400 hover:text-white focus:outline-none rounded-full active:bg-slate-800/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* User profile or login button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full"
                    onClick={() => console.log('User menu clicked')}
                  >
                    <Avatar className="h-10 w-10 rounded-full border-2 hover:border-yellow-400 transition-all duration-300">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-yellow-500 text-background">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleAI}>
                      <Bot className="mr-2 h-4 w-4" />
                      <span>AI Assistant: {isAIActive ? 'On' : 'Off'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline"
                className="text-white bg-transparent border border-yellow-500 hover:bg-yellow-500 hover:text-black"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed top-[60px] left-0 right-0 w-full bg-slate-900/95 backdrop-blur-lg md:hidden transition-all duration-300 overflow-hidden z-50 shadow-lg border-t border-purple-500/20',
          isMobileMenuOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        )}
        style={{ backgroundColor: "rgba(30, 41, 59, 0.95)" }}
      >
        <div className="px-4 py-4 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col space-y-3">
            {/* Only show most important navigation items on mobile */}
            {navLinks.slice(0, 4).map((link, index) => (
              <NavbarLink 
                key={index}
                to={link.path}
                isActive={location.pathname === link.path}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="py-4 px-5 bg-slate-800/50 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 text-lg"
              >
                <span className="flex items-center">
                  {link.icon}
                  <span className="ml-3 font-medium">{link.name}</span>
                </span>
              </NavbarLink>
            ))}
            {user ? (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-yellow-500">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-yellow-500 text-background">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-white">{user.displayName}</span>
                    <span className="text-xs text-gray-400">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 mt-4">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="justify-start py-4 text-base"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span>Profile</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="justify-start py-4 text-base"
                    onClick={() => {
                      navigate('/settings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="justify-start py-4 text-base"
                    onClick={() => {
                      toggleAI();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bot className="mr-3 h-5 w-5" />
                    <span>AI Assistant: {isAIActive ? 'On' : 'Off'}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="justify-start py-4 text-base text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline"
                size="lg"
                className="mt-6 w-full text-white bg-transparent border border-yellow-500 hover:bg-yellow-500 hover:text-black py-6 text-lg"
                onClick={() => {
                  navigate('/signin');
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Founders Dialog */}
      <Dialog open={showFounders} onOpenChange={setShowFounders}>
        <DialogContent className="vibranium-card border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4 flex items-center gap-2 vibranium-text">
              <Users className="w-6 h-6" />
              Our Founders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {founders.map((founder) => (
              <div 
                key={founder.id}
                className="p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <p className="text-lg">
                  {founder.id}. {founder.name}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showProfileDialog && (
        <ProfileDialog 
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
        />
      )}
    </>
  );
}
