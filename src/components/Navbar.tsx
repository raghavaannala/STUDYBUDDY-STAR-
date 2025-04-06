import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LogIn, Users, Code, BookOpen, Gamepad, FileText, Sparkles, Menu, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Vibranium animation styles
const navbarStyles = `
  @keyframes shimmerGradient {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes vibraniumPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  @keyframes vibraniumShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const Navbar = () => {
  const { user, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation links
  const navLinks = [
    { name: 'Study Groups', path: '/groups', icon: <Users className="h-4 w-4" /> },
    { name: 'CodeDiploMate', path: '/code', icon: <Code className="h-4 w-4" /> },
    { name: 'CodeBuddy', path: '/codebuddy', icon: <Code className="h-4 w-4" /> },
    { name: 'Study Modules', path: '/study', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Coding Games', path: '/games', icon: <Gamepad className="h-4 w-4" /> },
    { name: 'ResumeBuddy', path: '/resume', icon: <FileText className="h-4 w-4" /> },
  ];

  // Track scroll for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navbarStyles }} />
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/90 backdrop-blur-md border-b border-purple-500/20 shadow-lg shadow-purple-500/10' 
          : 'bg-transparent border-b border-purple-500/10'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Link to="/" className="flex items-center gap-2">
                <div className="text-2xl font-bold" style={{ 
                  background: 'linear-gradient(90deg, #9333EA, #FFD700, #9333EA)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmerGradient 3s linear infinite'
                }}>
                  <span className="inline-flex items-center">
                    <Sparkles className="h-5 w-5 mr-1 text-yellow-400" />
                    Study Buddy
                  </span>
                </div>
              </Link>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/0 via-yellow-400/50 to-purple-500/0 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(link.path)}
                className={`relative px-3 h-9 text-xs font-medium hover:text-purple-200 transition-all duration-300 group ${
                  location.pathname === link.path 
                    ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-purple-200'
                    : 'text-slate-200 hover:bg-purple-500/10'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {location.pathname === link.path && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/30 via-yellow-400/50 to-purple-500/30"></div>
                )}
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/0 via-yellow-400/50 to-purple-500/0 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Button>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative text-purple-200 hover:text-purple-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Authentication Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative group overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-70 group-hover:opacity-100 blur transition-all duration-500"></div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/groups')}
                    className="relative px-4 py-2 bg-slate-900 text-purple-200 border-purple-500/30 rounded-full flex items-center gap-2 group-hover:bg-slate-800 group-hover:text-white transition-all duration-300"
                  >
                    <Users className="h-4 w-4" />
                    <span>My Groups</span>
                    {/* Animated shine effect on hover */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></div>
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-purple-200 hover:text-purple-100 hover:bg-purple-500/10 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="relative group overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full opacity-70 group-hover:opacity-100 animate-pulse-slow"></div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSignIn}
                  className="relative bg-gradient-to-r from-purple-600 to-pink-500 border-none rounded-full flex items-center gap-2 group-hover:from-purple-500 group-hover:to-pink-400 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in with Google</span>
                  {/* Animated shine effect on hover */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></div>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute w-full bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20 shadow-lg transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto p-4 space-y-3">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(link.path)}
                className={`w-full justify-start relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-purple-200'
                    : 'text-slate-200 hover:bg-purple-500/10 hover:text-purple-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {location.pathname === link.path && (
                  <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/30 via-yellow-400/50 to-purple-500/30"></div>
                )}
              </Button>
            ))}
            
            {/* Mobile Authentication */}
            <div className="pt-2 border-t border-purple-500/20">
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 mt-2 bg-slate-800/80 text-purple-200 border-purple-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSignIn}
                  className="w-full flex items-center gap-2 mt-2 bg-gradient-to-r from-purple-600 to-pink-500"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in with Google</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16 w-full"></div>  {/* Spacer to account for fixed navbar */}
    </>
  );
};

export default Navbar; 