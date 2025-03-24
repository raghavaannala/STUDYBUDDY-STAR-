import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Gamepad, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Code,
  Timer,
  Puzzle,
  Zap,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudyGroup {
  id: string;
  privateId: string;
  name: string;
  interest: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
}

interface InterestGroup {
  id: string;
  label: string;
  icon: React.ElementType;
}

const interestGroups: InterestGroup[] = [
  { id: 'programming', label: 'Programming', icon: Code },
  { id: 'math', label: 'Mathematics', icon: Brain },
];

// Define available games
const codingGames = [
  {
    id: 'memory',
    name: 'Memory Game',
    icon: Brain,
    path: '/games#memory',
    available: true
  },
  {
    id: 'quiz',
    name: 'Coding Quiz',
    icon: Code,
    path: '/games#quiz',
    available: true
  },
  {
    id: 'challenge',
    name: 'Code Challenge',
    icon: Puzzle,
    path: '/games#challenge',
    available: true
  },
  {
    id: 'race',
    name: 'Algorithm Race',
    icon: Timer,
    path: '/games#race',
    available: true
  },
  {
    id: 'tetris',
    name: 'Code Tetris',
    icon: Gamepad,
    path: '/games#tetris',
    available: true
  },
  {
    id: 'snake',
    name: 'Code Snake',
    icon: Zap,
    path: '/games#snake',
    available: true
  }
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeInterest, setActiveInterest] = useState<string | null>('programming');
  const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);
  const navigate = useNavigate();

  // Load user's study groups from localStorage or API
  useEffect(() => {
    const loadUserGroups = () => {
      const savedGroups = localStorage.getItem('userStudyGroups');
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        console.log('Loaded groups:', parsedGroups);
        // Convert date strings back to Date objects
        const groupsWithDates = parsedGroups.map((group: StudyGroup) => ({
          ...group,
          createdAt: new Date(group.createdAt)
        }));
        console.log('Groups with dates:', groupsWithDates);
        setUserGroups(groupsWithDates);
      }
    };

    loadUserGroups();
    // Listen for group updates
    window.addEventListener('studyGroupsUpdated', loadUserGroups);
    return () => window.removeEventListener('studyGroupsUpdated', loadUserGroups);
  }, []);

  useEffect(() => {
    console.log('Active interest:', activeInterest);
    console.log('All groups:', userGroups);
    console.log('Filtered groups:', filteredGroups);
  }, [activeInterest, userGroups]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleGameClick = (game: typeof codingGames[0]) => {
    navigate(game.path);
    // Force tab switch by triggering click on the corresponding tab
    setTimeout(() => {
      const tabElement = document.querySelector(`[data-value="${game.id}"]`) as HTMLElement;
      if (tabElement) {
        tabElement.click();
      }
    }, 100);
  };

  const filteredGroups = activeInterest 
    ? userGroups.filter(group => group.interest.toLowerCase() === activeInterest.toLowerCase())
    : userGroups;

  return (
    <div className={cn(
      "h-screen fixed left-0 top-0 z-40 pt-16 flex flex-col glass shadow-lg transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <div className="mb-6 mt-2">
            <h2 className="text-lg font-semibold mb-2">Study Hub</h2>
            <p className="text-xs text-muted-foreground">Connect with others & learn together</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center mb-2">
            {collapsed ? (
              <Users className="h-5 w-5 mx-auto" />
            ) : (
              <h3 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Study Groups
              </h3>
            )}
          </div>

          {!collapsed && (
            <>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {interestGroups.map((interest) => (
                  <Button
                    key={interest.id}
                    variant={activeInterest === interest.id ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs justify-start"
                    onClick={() => setActiveInterest(interest.id)}
                  >
                    <interest.icon className="h-3 w-3 mr-1" />
                    {interest.label}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mb-3 text-xs"
                onClick={() => navigate('/groups/create')}
              >
                Create New Group
              </Button>
            </>
          )}

          <div className="space-y-1">
            {!collapsed ? (
              filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <Button
                    key={group.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-9"
                    onClick={() => navigate('/groups')}
                  >
                    <div className="truncate flex items-center">
                      <span className="flex-1">{group.name}</span>
                      <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-1.5">
                        {group.members.length}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No groups yet. Create one!
                </p>
              )
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full mx-auto block"
                onClick={() => navigate('/groups')}
              >
                <Users className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            {collapsed ? (
              <Gamepad className="h-5 w-5 mx-auto" />
            ) : (
              <h3 className="text-sm font-medium flex items-center">
                <Gamepad className="h-4 w-4 mr-2" />
                Coding Games
              </h3>
            )}
          </div>

          <div className="space-y-1">
            {codingGames.map((game) => (
              <Button
                key={game.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-9",
                  collapsed && "w-10 h-10 rounded-full mx-auto"
                )}
                onClick={() => handleGameClick(game)}
              >
                {collapsed ? (
                  <game.icon className="h-5 w-5" />
                ) : (
                  <div className="flex items-center">
                    <game.icon className="h-4 w-4 mr-2" />
                    {game.name}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-border flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

