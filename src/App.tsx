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
import { useEffect } from "react";
import "./App.css";
import "./styles/mobile.css";
import { AIBuddyAssistant } from "./components/AIBuddyAssistant";
import { AIPageListener } from "./components/AIPageListener";
import { MobileNav } from "./components/layout/MobileNav";
import { Meta } from "./components/layout/Meta";

// Add viewport meta tag at the top level
if (typeof document !== 'undefined') {
  // Check if viewport meta exists
  const existingViewport = document.querySelector('meta[name="viewport"]');
  if (!existingViewport) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
    document.head.appendChild(viewport);
  } else {
    // Update existing viewport
    existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover');
  }
}

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force background color
    document.documentElement.style.backgroundColor = "#1A1F2B";
    document.body.style.backgroundColor = "#1A1F2B";
    
    // Add class to manage safe areas on mobile devices with notches
    document.body.classList.add('safe-area-padding');
    
    // Add mobile touch feedback
    document.body.addEventListener('touchstart', function(){}, {passive: true});
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
                    margin: 0,
                    padding: 0,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <Navbar />
                    <AIPageListener />
                    <main className="pt-16 pb-20 md:pb-12 min-h-[calc(100vh-4rem)]">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/study" element={<Study />} />
                        <Route path="/code" element={<CodeDiploMate/>} />
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

// Calculate correct viewport height for mobile browsers
if (typeof window !== 'undefined') {
  // Fix for mobile viewport height issues with Safari and other mobile browsers
  const setVhVariable = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  // Set on initial load
  setVhVariable();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setVhVariable);
  window.addEventListener('orientationchange', setVhVariable);
}

export default App;
