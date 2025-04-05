import React from 'react';
import { componentStyles, containerSizes, padding } from '@/styles/responsive';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className={componentStyles.navbar.base}>
        <div className={cn(
          'container mx-auto',
          padding.page,
          containerSizes.xs,
          'sm:' + containerSizes.sm,
          'lg:' + containerSizes.lg,
          'xl:' + containerSizes.xl,
          '2xl:' + containerSizes['2xl']
        )}>
          <div className={componentStyles.navbar.container}>
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  StudyBuddy
                </span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className={componentStyles.navbar.menu}>
              <a href="/modules" className="text-sm font-medium hover:text-primary">Modules</a>
              <a href="/progress" className="text-sm font-medium hover:text-primary">Progress</a>
              <a href="/resources" className="text-sm font-medium hover:text-primary">Resources</a>
              <a href="/community" className="text-sm font-medium hover:text-primary">Community</a>
            </div>

            {/* Mobile Menu Button */}
            <button className="sm:hidden p-2 hover:bg-accent rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={componentStyles.navbar.mobileMenu} style={{ display: 'none' }}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-medium">Menu</span>
                <button className="p-2 hover:bg-accent rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-1 p-4">
                  <a href="/modules" className="block px-4 py-2 text-sm hover:bg-accent rounded-lg">Modules</a>
                  <a href="/progress" className="block px-4 py-2 text-sm hover:bg-accent rounded-lg">Progress</a>
                  <a href="/resources" className="block px-4 py-2 text-sm hover:bg-accent rounded-lg">Resources</a>
                  <a href="/community" className="block px-4 py-2 text-sm hover:bg-accent rounded-lg">Community</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn('flex-1', className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className={cn(
          'container mx-auto',
          padding.page,
          containerSizes.xs,
          'sm:' + containerSizes.sm,
          'lg:' + containerSizes.lg,
          'xl:' + containerSizes.xl,
          '2xl:' + containerSizes['2xl']
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">StudyBuddy</h3>
              <p className="text-sm text-muted-foreground">
                Your AI-powered learning companion for mastering any subject.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-primary">About Us</a></li>
                <li><a href="/contact" className="hover:text-primary">Contact</a></li>
                <li><a href="/faq" className="hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/blog" className="hover:text-primary">Blog</a></li>
                <li><a href="/guides" className="hover:text-primary">Study Guides</a></li>
                <li><a href="/tutorials" className="hover:text-primary">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/discord" className="hover:text-primary">Discord</a></li>
                <li><a href="/twitter" className="hover:text-primary">Twitter</a></li>
                <li><a href="/github" className="hover:text-primary">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 