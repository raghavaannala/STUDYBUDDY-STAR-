import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Code, 
  Users, 
  MessageSquare,
  Gamepad, 
  FileText
} from 'lucide-react';
import { useDeviceDetect } from '@/hooks/useMediaQuery';

/**
 * Mobile bottom navigation component that's optimized for touch
 * Only shows on mobile devices, hidden on tablets and desktops
 */
export function MobileNav() {
  const location = useLocation();
  const { isMobile } = useDeviceDetect();
  
  // Don't render on non-mobile devices
  if (!isMobile) return null;
  
  // Navigation links with icons
  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Study",
      path: "/study",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "Code",
      path: "/code",
      icon: <Code className="w-5 h-5" />,
    },
    {
      name: "CodeBuddy",
      path: "/codebuddy",
      icon: <Code className="w-5 h-5" />,
    },
    {
      name: "Resume",
      path: "/resume",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Groups",
      path: "/groups",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: "Games",
      path: "/games",
      icon: <Gamepad className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`${isActive ? 'active' : ''}`}
            aria-label={link.name}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
} 