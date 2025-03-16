import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Brain, Timer, Zap, Heart, Star, Code, Users, Target, Sparkles, Puzzle, Gamepad } from 'lucide-react';
import GlassMorphCard from '@/components/ui/GlassMorphCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Todo from '@/components/Todo';
import MemoryGame from '@/components/games/MemoryGame';
import CodingChallenge from '@/components/games/CodingChallenge';
import Quiz from '@/components/games/Quiz';
import AlgorithmRace from '@/components/games/AlgorithmRace';
import CodeTetris from '@/components/games/CodeTetris';
import CodeSnake from '@/components/games/CodeSnake';

const Games = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('todo');
  
  // Handle hash-based navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveTab(hash);
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/games#${value}`, { replace: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col dark">
      <Navbar />
      <Sidebar />
      
      <main className="flex-grow pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent animate-gradient">
              Interactive Learning Games
            </h1>
            <p className="text-lg text-muted-foreground">
              Enhance your coding skills through{' '}
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                interactive challenges
              </span>{' '}
              and games
            </p>
          </motion.div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 w-full mb-8">
              <TabsTrigger value="todo" className="btn-hover" data-value="todo">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Task Manager
                </span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="btn-hover" data-value="memory">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Memory Game
                </span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="btn-hover" data-value="quiz">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Coding Quiz
                </span>
              </TabsTrigger>
              <TabsTrigger value="challenge" className="btn-hover" data-value="challenge">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  Code Challenge
                </span>
              </TabsTrigger>
              <TabsTrigger value="race" className="btn-hover" data-value="race">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Algorithm Race
                </span>
              </TabsTrigger>
              <TabsTrigger value="tetris" className="btn-hover" data-value="tetris">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Gamepad className="h-4 w-4" />
                  Code Tetris
                </span>
              </TabsTrigger>
              <TabsTrigger value="snake" className="btn-hover" data-value="snake">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Code Snake
                </span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="btn-hover" data-value="leaderboard">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </span>
              </TabsTrigger>
            </TabsList>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="todo">
                <div className="glass p-6 rounded-lg">
                  <Todo />
                </div>
              </TabsContent>
              
              <TabsContent value="memory">
                <div className="glass p-6 rounded-lg">
                  <MemoryGame />
                </div>
              </TabsContent>
              
              <TabsContent value="quiz">
                <div className="glass p-6 rounded-lg">
                  <Quiz />
                </div>
              </TabsContent>

              <TabsContent value="challenge">
                <div className="glass p-6 rounded-lg">
                  <CodingChallenge />
                </div>
              </TabsContent>

              <TabsContent value="race">
                <div className="glass p-6 rounded-lg">
                  <AlgorithmRace />
                </div>
              </TabsContent>

              <TabsContent value="tetris">
                <div className="glass p-6 rounded-lg">
                  <CodeTetris />
                </div>
              </TabsContent>

              <TabsContent value="snake">
                <div className="glass p-6 rounded-lg">
                  <CodeSnake />
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <div className="glass p-6 rounded-lg">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        Global Leaderboard
                      </h2>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Your Rank: #42
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      {[
                        { rank: 1, name: "CodeMaster", points: 2500, games: 150 },
                        { rank: 2, name: "AlgoWizard", points: 2350, games: 142 },
                        { rank: 3, name: "ByteNinja", points: 2200, games: 138 },
                      ].map((player) => (
                        <div key={player.rank} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center font-bold">
                              {player.rank}
                            </div>
                            <div>
                              <h3 className="font-semibold">{player.name}</h3>
                              <p className="text-sm text-muted-foreground">Games Played: {player.games}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-bold">{player.points}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Games; 