import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <div className="page-transition-container">
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
