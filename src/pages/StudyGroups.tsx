import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudyGroupDialog } from '@/components/StudyGroupDialog';
import { 
  Users, 
  Search, 
  Plus, 
  Code, 
  Brain, 
  GraduationCap, 
  BookOpen,
  Clock,
  Calendar
} from 'lucide-react';
import GlassMorphCard from '@/components/ui/GlassMorphCard';

interface StudyGroup {
  id: string;
  name: string;
  interest: string;
  members: number;
  description: string;
  lastActive: string;
  upcomingSession?: string;
}

const studyGroups: StudyGroup[] = [
  { 
    id: 'prog1', 
    name: 'JS Wizards', 
    interest: 'programming', 
    members: 24, 
    description: 'Weekly sessions on advanced JavaScript concepts, libraries, and frameworks.',
    lastActive: '2 hours ago',
    upcomingSession: 'March 15, 2025 - React Hooks Deep Dive'
  },
  { 
    id: 'prog2', 
    name: 'Python Masters', 
    interest: 'programming', 
    members: 18, 
    description: 'Python programming group focused on data science, machine learning, and automation.',
    lastActive: '1 day ago',
    upcomingSession: 'March 12, 2025 - Pandas & Data Analysis'
  },
  { 
    id: 'math1', 
    name: 'Math Enthusiasts', 
    interest: 'math', 
    members: 15, 
    description: 'Discussion and problem-solving sessions covering calculus, algebra, and statistics.',
    lastActive: '3 days ago'
  },
  { 
    id: 'sci1', 
    name: 'Physics Geeks', 
    interest: 'science', 
    members: 12, 
    description: 'Study group dedicated to physics concepts, problem-solving, and applications.',
    lastActive: '5 days ago',
    upcomingSession: 'March 20, 2025 - Quantum Mechanics Basics'
  },
  { 
    id: 'lang1', 
    name: 'Language Lovers', 
    interest: 'language', 
    members: 9, 
    description: 'Multilingual group focused on language learning techniques and practice sessions.',
    lastActive: '1 week ago'
  },
  { 
    id: 'prog3', 
    name: 'Web Developers', 
    interest: 'programming', 
    members: 21, 
    description: 'Front-end and back-end web development discussions, code reviews, and projects.',
    lastActive: '2 days ago',
    upcomingSession: 'March 14, 2025 - Building APIs with Node.js'
  },
  { 
    id: 'math2', 
    name: 'Stats Group', 
    interest: 'math', 
    members: 8, 
    description: 'Focused on statistical methods, probability theory, and data analysis.',
    lastActive: '4 days ago'
  },
];

const interestGroups = [
  { id: 'all', label: 'All Groups', icon: Users },
  { id: 'programming', label: 'Programming', icon: Code },
  { id: 'math', label: 'Mathematics', icon: Brain },
  { id: 'science', label: 'Science', icon: GraduationCap },
  { id: 'language', label: 'Languages', icon: BookOpen },
];

const StudyGroups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInterest, setActiveInterest] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const filteredGroups = studyGroups
    .filter(group => 
      activeInterest === 'all' || group.interest === activeInterest
    )
    .filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Sidebar />
      
      <main className="flex-grow pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
              <p className="text-muted-foreground">Connect with others who share your interests</p>
            </div>
            <Button className="mt-4 md:mt-0" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs 
                value={activeInterest} 
                onValueChange={setActiveInterest}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-5">
                  {interestGroups.map((interest) => (
                    <TabsTrigger 
                      key={interest.id} 
                      value={interest.id}
                      className="flex items-center gap-1"
                    >
                      <interest.icon className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">{interest.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GlassMorphCard key={group.id} className="h-full flex flex-col">
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-medium">{group.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {group.members}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {group.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-2" />
                      Last active: {group.lastActive}
                    </div>
                    
                    {group.upcomingSession && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2" />
                        {group.upcomingSession}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-grow">
                      Join Group
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </GlassMorphCard>
              ))}
            </div>
          ) : (
            <GlassMorphCard className="text-center p-8">
              <h3 className="text-xl font-medium mb-2">No matching groups found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search query or create a new group.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Group
              </Button>
            </GlassMorphCard>
          )}
        </div>
      </main>
      
      <StudyGroupDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
      
      <Footer />
    </div>
  );
};

export default StudyGroups;
