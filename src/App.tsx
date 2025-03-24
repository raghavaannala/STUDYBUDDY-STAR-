import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import Index from "./pages/Index";
import Study from "./pages/Study";
import CodeDiploMate from "./pages/CodeDiploMate";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Games from "./components/games/Games";
import Groups from "./pages/Groups";
import { gameRoutes } from "./routes/game-routes";
import { Chat } from './components/Chat';
import ChatPage from "./pages/ChatPage";
import { CollaborateGroup } from './components/CollaborateGroup';
import Profile from "@/components/auth/Profile";
import Settings from "./components/auth/Settings";
import SignIn from '@/pages/SignIn';
import { TestGroups } from './components/TestGroups';
import FirebaseTest from './components/FirebaseTest';
import FirestoreTest from './components/FirestoreTest';
import { useEffect } from "react";
import "./App.css";
import { AIBuddyAssistant } from "./components/AIBuddyAssistant";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force background color
    document.documentElement.style.backgroundColor = "#1A1F2B";
    document.body.style.backgroundColor = "#1A1F2B";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <div className="page-transition-container full-width-container" style={{ 
              backgroundColor: "#1e293b", 
              minHeight: "100vh",
              width: "100%",
              margin: 0,
              padding: 0,
              overflow: "hidden"
            }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/study" element={<Study />} />
                <Route path="/code" element={<CodeDiploMate/>} />
                <Route path="/search" element={<Search />} />
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
              <AIBuddyAssistant />
            </div>
          </Router>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
