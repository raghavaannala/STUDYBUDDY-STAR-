import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Code, Users, User, Settings, LogOut, Home, MessageSquare, Gamepad, FileText, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center",
        isActive 
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.menu-container') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    console.log('Menu toggle clicked, current state:', isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log('Menu state after toggle:', !isMenuOpen);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-4 w-4" />
    },
    {
      name: "Study",
      path: "/study",
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      name: "CodeDiploMate",
      path: "/code",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "CodeBuddy",
      path: "/codebuddy",
      icon: <Code className="h-4 w-4" />
    },
    {
      name: "ResumeBuddy",
      path: "/resume",
      icon: <FileText className="h-4 w-4" />
    },
    {
      name: "Groups",
      path: "/groups",
      icon: <Users className="h-4 w-4" />
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      name: "Games",
      path: "/games",
      icon: <Gamepad className="h-4 w-4" />
    }
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          isScrolled 
            ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-700/50" 
            : "bg-slate-900/80 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <div className="relative w-8 h-8 text-yellow-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-full h-full"
                >
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-yellow-500 bg-clip-text text-transparent">
                {isMobile ? 'SB' : 'StudyBuddy'}
              </span>
            </button>

            {/* Desktop Navigation Menu - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
              {navLinks.map((link, index) => (
                <NavbarLink
                  key={index}
                  to={link.path}
                  isActive={location.pathname === link.path}
                  className="flex items-center space-x-1.5 px-3 py-2"
                >
                  {link.icon}
                  <span className="text-sm">{link.name}</span>
                </NavbarLink>
              ))}
            </div>

            {/* Right side - AI Indicator, User Menu & Hamburger */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* AI Assistant Indicator - Show on larger screens */}
              <div className="hidden xl:flex items-center">
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs",
                  isAIActive 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isAIActive ? 'bg-green-400' : 'bg-red-400'
                  )}></div>
                  <span>AI {isAIActive ? 'Active' : 'Disabled'}</span>
                </div>
              </div>

              {/* User Menu - Desktop only */}
              <div className="hidden md:flex items-center">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                          <AvatarFallback className="bg-blue-600 text-white">
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
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                    onClick={() => navigate('/signin')}
                  >
                    Sign In
                  </Button>
                )}
              </div>

              {/* Hamburger menu button - Now for all screen sizes */}
              <button 
                onClick={toggleMenu} 
                className="menu-button p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Simple Lightweight Menu */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 shadow-lg">
          <div className="max-w-md mx-auto p-4 space-y-3">
            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {/* AI Status */}
            <div className="border-t border-slate-700 pt-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${
                isAIActive 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isAIActive ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span>AI {isAIActive ? 'Active' : 'Disabled'}</span>
              </div>
            </div>

            {/* User Section */}
            {user ? (
              <div className="border-t border-slate-700 pt-3 space-y-2">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-white">{user.displayName}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => {
                    toggleAI();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg"
                >
                  <Bot className="h-4 w-4" />
                  <span>Toggle AI</span>
                </button>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-700 pt-3">
                <button
                  onClick={() => {
                    navigate('/signin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
