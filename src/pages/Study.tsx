
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskGroups from '@/components/study/TaskGroups';
import StudyModules from '@/components/study/StudyModules';
import SimplePomodoroTimer from '@/components/study/SimplePomodoroTimer';
import SimpleStudyAnalytics from '@/components/study/SimpleStudyAnalytics';
import { Button } from '@/components/ui/button';
import { Plus, Clock, BarChart3 } from 'lucide-react';
import FadeIn from '@/components/animations/FadeIn';

// Define interest categories
const interests = [
  { id: 'programming', label: 'Programming' },
  { id: 'math', label: 'Mathematics' },
  { id: 'science', label: 'Science' },
  { id: 'language', label: 'Languages' },
  { id: 'other', label: 'Other Interests' },
];

const Study = () => {
  const [activeTab, setActiveTab] = useState('modules');
  
  // Force a re-render when the component mounts
  useEffect(() => {
    // This should help with any loading issues
    const timer = setTimeout(() => {
      setActiveTab(activeTab);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
      
      <main className="flex-grow pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="glass rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">Study Dashboard</h1>
                <p className="text-white/80">Organize your learning journey and track your progress</p>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button variant="default" size="sm" className="btn-hover pulse-animation">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FadeIn delay={0.1}>
                <div className="col-span-1">
                  <h2 className="text-xl font-bold mb-4 text-white">Pomodoro Timer</h2>
                  <SimplePomodoroTimer />
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <div className="col-span-1">
                  <h2 className="text-xl font-bold mb-4 text-white">Study Analytics</h2>
                  <SimpleStudyAnalytics />
                </div>
              </FadeIn>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-white/20">
                <TabsTrigger value="modules" className="text-white data-[state=active]:bg-white/30">Study Modules</TabsTrigger>
                <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-white/30">Task Groups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="modules" className="animate-fade-in">
                <FadeIn delay={0.1}>
                  <StudyModules />
                </FadeIn>
              </TabsContent>
              
              <TabsContent value="tasks" className="animate-fade-in">
                <div className="space-y-8">
                  {interests.map((interest, index) => (
                    <FadeIn key={interest.id} delay={0.1 * (index + 1)}>
                      <TaskGroups 
                        key={interest.id} 
                        interest={interest} 
                      />
                    </FadeIn>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Study;
