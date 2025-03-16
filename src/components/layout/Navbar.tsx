import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Code, Search, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignInButton } from "../auth/SignInButton";
import { useAuth } from '@/store/useAuth';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFounders, setShowFounders] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const founders = [
    { id: 1, name: 'Raghava' },
    { id: 2, name: 'Deekshith' },
    { id: 3, name: 'Rajkumar' },
    { id: 4, name: 'Anji' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Study Modules', path: '/study', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'CodeDiplomate🚀🚀', path: '/code', icon: <Code className="w-4 h-4 mr-2" /> },
    { name: 'Search', path: '/search', icon: <Search className="w-4 h-4 mr-2" /> },
    { name: 'Study Groups', path: '/groups', icon: <Users className="w-4 h-4 mr-2" /> },
    { 
      name: 'Our Founders', 
      icon: <Users className="w-4 h-4 mr-2" />,
      onClick: () => setShowFounders(true)
    },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'py-3 bg-background/80 backdrop-blur-md border-b border-purple-500/20'
            : 'py-5 bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 group vibranium-button"
            >
              <div className="relative">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse-slow" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-sm animate-pulse-slow"></div>
              </div>
              <span className="text-base font-medium vibranium-text group-hover:from-purple-400 group-hover:to-purple-600 transition-all duration-300 tracking-wide">
                StudyBuddy
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                link.path ? (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/10 transition-colors duration-200 flex items-center"
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => {
                      link.onClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/10 transition-colors duration-200 flex items-center text-purple-400 hover:text-purple-300"
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </button>
                )
              ))}
              {!user && (
                <Button 
                  className="ml-4 vibranium-button"
                  onClick={() => navigate('/study')}
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Auth Button */}
            <div className="flex items-center gap-4">
              <SignInButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-purple-500/20 shadow-lg md:hidden transition-all duration-300 overflow-hidden',
            isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="px-4 py-2">
            {navLinks.map((link) => (
              link.path ? (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-3 px-4 text-sm font-medium hover:bg-purple-500/10 rounded-lg transition-colors duration-200 my-2 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && link.icon}
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => {
                    link.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 text-sm font-medium hover:bg-purple-500/10 rounded-lg transition-colors duration-200 my-2 flex items-center text-purple-400 hover:text-purple-300"
                >
                  {link.icon && link.icon}
                  {link.name}
                </button>
              )
            ))}
            {!user && (
              <Button 
                className="w-full my-2 vibranium-button"
                onClick={() => {
                  navigate('/study');
                  setIsMobileMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

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
    </>
  );
}
