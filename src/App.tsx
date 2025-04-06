import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIAwareProvider } from "@/contexts/AIAwareContext";
import { ThemeProvider } from "@mui/material/styles";
import { HelmetProvider } from "react-helmet-async";
import muiTheme from "./themes/muiTheme";
import Navbar from "./components/layout/Navbar";
import Index from "./pages/Index";
import Study from "./pages/Study";
import CodeDiploMate from "./pages/CodeDiploMate";
import CodeBuddy from "./pages/CodeBuddy";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Games from "./pages/Games";
import Groups from "./pages/Groups";
import Resume from "./pages/Resume";
import { gameRoutes } from "./routes/game-routes";
import { Chat } from './components/Chat';
import ChatPage from "./pages/ChatPage";
import { CollaborateGroup } from './components/CollaborateGroup';
import Profile from "@/components/auth/Profile";
import Settings from "@/components/auth/Settings";
import SignIn from '@/pages/SignIn';
import { TestGroups } from './components/TestGroups';
import FirebaseTest from './components/FirebaseTest';
import FirestoreTest from './components/FirestoreTest';
import React, { useEffect, lazy, Suspense, Component, ReactNode, ErrorInfo } from "react";
import "./App.css";
import "./styles/mobile.css";
import { AIBuddyAssistant } from "./components/AIBuddyAssistant";
import { AIPageListener } from "./components/AIPageListener";
import { MobileNav } from "./components/layout/MobileNav";
import { Meta } from "./components/layout/Meta";

// Lazy load CodeBuddy for better error handling
const LazyCodeBuddy = lazy(() => import('./pages/CodeBuddy'));

// Add viewport meta tag at the top level
if (typeof document !== 'undefined') {
  // Check if viewport meta exists
  const existingViewport = document.querySelector('meta[name="viewport"]');
  if (!existingViewport) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(viewport);
  } else {
    // Update existing viewport
    existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
}

const queryClient = new QueryClient();

// Define the ErrorBoundary props and state types
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple error boundary component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Component Error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
          <p className="text-gray-300 mb-6">There was an error loading this page.</p>
          <pre className="bg-gray-800 p-4 rounded text-sm text-gray-400 mb-6 overflow-auto max-h-[200px]">
            {this.state.error?.toString()}
          </pre>
          <button 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    // Force background color
    document.documentElement.style.backgroundColor = "#1A1F2B";
    document.body.style.backgroundColor = "#1A1F2B";
    
    // Add class to manage safe areas on mobile devices with notches
    document.body.classList.add('safe-area-padding');
    
    // Add mobile touch feedback
    document.body.addEventListener('touchstart', function(){}, {passive: true});
    
    // Fix for iOS Safari 100vh issue
    const setVhVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set on initial load
    setVhVariable();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVhVariable);
    window.addEventListener('orientationchange', setVhVariable);
    
    return () => {
      window.removeEventListener('resize', setVhVariable);
      window.removeEventListener('orientationchange', setVhVariable);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AIAwareProvider>
          <ThemeProvider theme={muiTheme}>
            <HelmetProvider>
              <TooltipProvider>
                <Router>
                  <Meta />
                  <div className="page-transition-container full-width-container" style={{ 
                    backgroundColor: "#1e293b", 
                    minHeight: "calc(var(--vh, 1vh) * 100)",
                    width: "100%",
                    maxWidth: "100vw",
                    margin: 0,
                    padding: 0,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <Navbar />
                    <AIPageListener />
                    <main className="pt-16 pb-20 md:pb-12 min-h-[calc(var(--vh, 1vh) * 100 - 4rem)] overflow-x-hidden">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/study" element={<Study />} />
                        <Route path="/code" element={<CodeDiploMate/>} />
                        <Route path="/codebuddy" element={
                          <ErrorBoundary>
                            <Suspense fallback={
                              <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400">Loading CodeBuddy page...</p>
                              </div>
                            }>
                              <LazyCodeBuddy />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="/search" element={<Search />} />
                        <Route path="/resume" element={<Resume />} />
                        {gameRoutes}
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/create" element={<Groups />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/collaborate" element={<CollaborateGroup />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/test-groups" element={<TestGroups />} />
                        <Route path="/firebase-test" element={<FirebaseTest />} />
                        <Route path="/firestore-test" element={<FirestoreTest />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <AIBuddyAssistant />
                    <MobileNav />
                  </div>
                </Router>
                <Toaster />
              </TooltipProvider>
            </HelmetProvider>
          </ThemeProvider>
        </AIAwareProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
