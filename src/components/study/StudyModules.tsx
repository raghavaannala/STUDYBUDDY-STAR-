import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Code, BookOpen, BookCheck, Brain, Search, Badge, Star, Clock, UserCheck, Zap, Filter, Award, ArrowLeft, CheckCircle, FileText, Play, PauseCircle, Bookmark, Share2 } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  subcategory: string;
  estimatedTime: string;
  completionRate: number;
  popularity: number;
  tags: string[];
  code?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

// Add interfaces for tracking progress and assessment
interface ModuleProgress {
  completedSections: number[];
  timeSpent: number;
  lastAccessed: Date;
  notes: { [key: string]: string };
  assessmentAnswers: { [key: string]: string };
  practiceProgress: { [key: string]: boolean };
}

interface Assessment {
  id: string;
  questionType: 'multiple-choice' | 'practical';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

// Add new interfaces for resources
interface StudyNote {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

interface PracticeExercise {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  solution: string;
  completed: boolean;
}

interface ReferenceItem {
  id: string;
  title: string;
  type: 'documentation' | 'tutorial' | 'example' | 'video';
  url: string;
  description: string;
}

const modules: Module[] = [
  // Programming Modules
  {
    id: 'python-1',
    title: 'Python Fundamentals',
    description: 'Master Python basics including variables, data types, control flow and functions.',
    difficulty: 'Beginner',
    category: 'programming',
    subcategory: 'Python',
    estimatedTime: '4 hours',
    completionRate: 85,
    popularity: 95,
    tags: ['Python', 'Programming Basics', 'Variables', 'Functions'],
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Example usage
unsorted = [3, 6, 8, 10, 1, 2, 1]
sorted_arr = quick_sort(unsorted)
print(sorted_arr)  # [1, 1, 2, 3, 6, 8, 10]`
  },
  {
    id: 'ds-1',
    title: 'Data Structures: Arrays & Lists',
    description: 'Understand array operations, time complexity, and implementation across languages.',
    difficulty: 'Beginner',
    category: 'programming',
    subcategory: 'Data Structures',
    estimatedTime: '3 hours',
    completionRate: 78,
    popularity: 88,
    tags: ['Arrays', 'Lists', 'Data Structures', 'Time Complexity'],
  },
  {
    id: 'algo-1',
    title: 'Sorting Algorithms',
    description: 'Learn and implement popular sorting algorithms with visualizations and comparisons.',
    difficulty: 'Intermediate',
    category: 'programming',
    subcategory: 'Algorithms',
    estimatedTime: '5 hours',
    completionRate: 65,
    popularity: 82,
    tags: ['Algorithms', 'Sorting', 'Quick Sort', 'Merge Sort', 'Bubble Sort'],
  },
  {
    id: 'js-1',
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript features including arrow functions, destructuring, and async/await.',
    difficulty: 'Intermediate',
    category: 'programming',
    subcategory: 'JavaScript',
    estimatedTime: '6 hours',
    completionRate: 72,
    popularity: 91,
    tags: ['JavaScript', 'ES6', 'Web Development', 'Async'],
    isPopular: true,
  },
  {
    id: 'web-1',
    title: 'React Fundamentals',
    description: 'Learn component-based UI development with React hooks and state management.',
    difficulty: 'Intermediate',
    category: 'programming',
    subcategory: 'Web Development',
    estimatedTime: '8 hours',
    completionRate: 68,
    popularity: 94,
    tags: ['React', 'JavaScript', 'UI', 'Hooks', 'Components'],
    isPopular: true,
  },
  {
    id: 'ds-2',
    title: 'Advanced Data Structures',
    description: 'Trees, graphs, heaps and their applications in solving complex problems.',
    difficulty: 'Advanced',
    category: 'programming',
    subcategory: 'Data Structures',
    estimatedTime: '10 hours',
    completionRate: 45,
    popularity: 76,
    tags: ['Trees', 'Graphs', 'Heaps', 'Advanced Data Structures'],
  },
  
  // Mathematics Modules
  {
    id: 'math-1',
    title: 'Calculus I: Differentiation',
    description: 'Master derivatives, limits, and applications of differential calculus.',
    difficulty: 'Intermediate',
    category: 'mathematics',
    subcategory: 'Calculus',
    estimatedTime: '7 hours',
    completionRate: 62,
    popularity: 85,
    tags: ['Calculus', 'Derivatives', 'Limits', 'Mathematics'],
  },
  {
    id: 'math-2',
    title: 'Linear Algebra Essentials',
    description: 'Vectors, matrices, transformations and their applications in computing.',
    difficulty: 'Intermediate',
    category: 'mathematics',
    subcategory: 'Linear Algebra',
    estimatedTime: '9 hours',
    completionRate: 58,
    popularity: 83,
    tags: ['Linear Algebra', 'Matrices', 'Vectors', 'Transformations'],
  },
  {
    id: 'math-3',
    title: 'Discrete Mathematics',
    description: 'Logic, set theory, combinatorics, and graph theory for computer science.',
    difficulty: 'Advanced',
    category: 'mathematics',
    subcategory: 'Discrete Math',
    estimatedTime: '12 hours',
    completionRate: 51,
    popularity: 79,
    tags: ['Discrete Math', 'Logic', 'Set Theory', 'Graph Theory'],
  },
  {
    id: 'math-4',
    title: 'Statistics & Probability',
    description: 'Fundamental concepts in statistics, probability theory, and data analysis.',
    difficulty: 'Beginner',
    category: 'mathematics',
    subcategory: 'Statistics',
    estimatedTime: '6 hours',
    completionRate: 73,
    popularity: 87,
    tags: ['Statistics', 'Probability', 'Data Analysis'],
    isNew: true,
  },
  
  // Science Modules
  {
    id: 'sci-1',
    title: 'Physics: Mechanics',
    description: 'Newton\'s laws, kinematics, dynamics, and conservation principles with simulations.',
    difficulty: 'Intermediate',
    category: 'science',
    subcategory: 'Physics',
    estimatedTime: '8 hours',
    completionRate: 64,
    popularity: 81,
    tags: ['Physics', 'Mechanics', 'Newton\'s Laws', 'Kinematics'],
  },
  {
    id: 'sci-2',
    title: 'Chemistry Fundamentals',
    description: 'Atomic structure, periodic table, bonding, and basic chemical reactions.',
    difficulty: 'Beginner',
    category: 'science',
    subcategory: 'Chemistry',
    estimatedTime: '5 hours',
    completionRate: 76,
    popularity: 75,
    tags: ['Chemistry', 'Atoms', 'Bonding', 'Chemical Reactions'],
    isNew: true,
  },
  {
    id: 'sci-3',
    title: 'Biology: Cell Structure',
    description: 'Cellular components, functions, and processes with interactive visualizations.',
    difficulty: 'Beginner',
    category: 'science',
    subcategory: 'Biology',
    estimatedTime: '4 hours',
    completionRate: 79,
    popularity: 72,
    tags: ['Biology', 'Cells', 'Microbiology', 'Organelles'],
  },
  {
    id: 'sci-4',
    title: 'Quantum Mechanics',
    description: 'Introduction to quantum physics principles and mathematical formulations.',
    difficulty: 'Advanced',
    category: 'science',
    subcategory: 'Physics',
    estimatedTime: '14 hours',
    completionRate: 42,
    popularity: 77,
    tags: ['Quantum', 'Physics', 'Wave Functions', 'Uncertainty'],
  },
  
  // Language Modules
  {
    id: 'lang-1',
    title: 'Spanish for Beginners',
    description: 'Basic Spanish vocabulary, grammar, and conversation with AI pronunciation feedback.',
    difficulty: 'Beginner',
    category: 'language',
    subcategory: 'Spanish',
    estimatedTime: '10 hours',
    completionRate: 81,
    popularity: 89,
    tags: ['Spanish', 'Language', 'Beginners', 'Grammar'],
    isPopular: true,
  },
  {
    id: 'lang-2',
    title: 'Business English',
    description: 'Professional English for international business, emails, and presentations.',
    difficulty: 'Intermediate',
    category: 'language',
    subcategory: 'English',
    estimatedTime: '8 hours',
    completionRate: 75,
    popularity: 86,
    tags: ['English', 'Business', 'Professional', 'Communication'],
  },
  {
    id: 'lang-3',
    title: 'Japanese Writing Systems',
    description: 'Learn Hiragana, Katakana, and basic Kanji with interactive exercises.',
    difficulty: 'Intermediate',
    category: 'language',
    subcategory: 'Japanese',
    estimatedTime: '12 hours',
    completionRate: 57,
    popularity: 80,
    tags: ['Japanese', 'Hiragana', 'Katakana', 'Kanji'],
  },
  {
    id: 'lang-4',
    title: 'Technical Writing',
    description: 'Clear communication of complex technical concepts and documentation.',
    difficulty: 'Advanced',
    category: 'language',
    subcategory: 'Writing',
    estimatedTime: '6 hours',
    completionRate: 68,
    popularity: 78,
    tags: ['Technical Writing', 'Documentation', 'Communication'],
    isNew: true,
  }
];

// Add responsive breakpoint constants
const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // Ultra wide screens
};

// Add responsive container sizes
const containerSizes = {
  sm: '100%',
  md: '90%',
  lg: '85%',
  xl: '80%',
  '2xl': '75%'
};

// Add responsive font sizes
const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem' // 30px
};

// Add responsive spacing
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem'    // 48px
};

// Update container classes to use fixed values instead of template literals
const containerClasses = {
  sm: 'w-full',
  md: 'max-w-[90%]',
  lg: 'max-w-[85%]',
  xl: 'max-w-[80%]',
  '2xl': 'max-w-[75%]'
};

const StudyModules = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('programming');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  
  const filteredModules = modules.filter(module => {
    // Category filter
    if (module.category !== activeCategory) return false;
    
    // Search query filter
    if (searchQuery && !module.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !module.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Difficulty filter
    if (selectedDifficulty && module.difficulty !== selectedDifficulty) {
      return false;
    }
    
    return true;
  });
  
  // Group modules by subcategory
  const modulesBySubcategory: Record<string, Module[]> = {};
  filteredModules.forEach(module => {
    if (!modulesBySubcategory[module.subcategory]) {
      modulesBySubcategory[module.subcategory] = [];
    }
    modulesBySubcategory[module.subcategory].push(module);
  });

  // If a module is selected, show the module detail view
  if (selectedModule) {
    return (
      <ModuleDetailView 
        module={selectedModule} 
        onBack={() => setSelectedModule(null)} 
      />
    );
  }
  
  return (
    <section className="py-8">
      <div className={`
        container mx-auto 
        px-4 sm:px-6 md:px-8 
        ${containerClasses.sm}
        sm:${containerClasses.md}
        lg:${containerClasses.lg}
        xl:${containerClasses.xl}
        2xl:${containerClasses['2xl']}
      `}>
        <div className="text-center mb-12">
          <h2 className={`
            text-2xl sm:text-3xl lg:text-4xl 
            font-bold mb-4 
            bg-gradient-to-r from-purple-400 to-indigo-400 
            bg-clip-text text-transparent
          `}>
            Interactive Study Modules
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Personalized learning experiences powered by AI to help you master any subject.
          </p>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedDifficulty === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedDifficulty(null)}
              className="text-xs"
            >
              All Levels
            </Button>
            <Button 
              variant={selectedDifficulty === 'Beginner' ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedDifficulty('Beginner')}
              className="text-xs"
            >
              Beginner
            </Button>
            <Button 
              variant={selectedDifficulty === 'Intermediate' ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedDifficulty('Intermediate')}
              className="text-xs"
            >
              Intermediate
            </Button>
            <Button 
              variant={selectedDifficulty === 'Advanced' ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedDifficulty('Advanced')}
              className="text-xs"
            >
              Advanced
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="programming" value={activeCategory} onValueChange={setActiveCategory} 
          className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8">
            <TabsTrigger value="programming" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Programming</span>
            </TabsTrigger>
            <TabsTrigger value="mathematics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Mathematics</span>
            </TabsTrigger>
            <TabsTrigger value="science" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Science</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <BookCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Language</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Dynamic content for each category */}
          {['programming', 'mathematics', 'science', 'language'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-6 sm:space-y-8">
              {Object.keys(modulesBySubcategory).length > 0 ? (
                Object.entries(modulesBySubcategory).map(([subcategory, modules]) => (
                  <div key={subcategory} className="space-y-4">
                    <h3 className={`
                      text-lg sm:text-xl font-medium mb-4 
                      flex items-center
                    `}>
                      {subcategory}
                      <UIBadge variant="outline" className="ml-2 text-xs">
                        {modules.length} {modules.length === 1 ? 'module' : 'modules'}
                      </UIBadge>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {modules.map((module) => (
                        <ModuleCard 
                          key={module.id} 
                          module={module} 
                          onStart={() => setSelectedModule(module)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Filter className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No modules found</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty(null);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

const ModuleCard = ({ module, onStart }: { module: Module, onStart: () => void }) => {
  return (
    <GlassMorphCard className={`
      h-full flex flex-col 
      hover:shadow-lg hover:shadow-purple-500/10 
      transition-all duration-300 
      transform hover:-translate-y-1 
      overflow-hidden
      p-4 sm:p-5
    `}>
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-base font-medium">{module.title}</h4>
          {module.isNew && (
            <UIBadge variant="secondary" className="ml-2 bg-green-500/20 text-green-400 text-xs">New</UIBadge>
          )}
          {module.isPopular && !module.isNew && (
            <UIBadge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-400 text-xs">Popular</UIBadge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {module.description}
        </p>
        
        {module.code && (
          <div className="bg-black/90 rounded-lg code-block p-2 mb-4 overflow-hidden max-h-32">
            <pre className="text-xs overflow-x-auto">
              <code>{module.code.split('\n').slice(0, 5).join('\n')}...</code>
                    </pre>
                  </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {module.tags.slice(0, 3).map((tag) => (
            <UIBadge key={tag} variant="outline" className="text-xs bg-primary/5">
              {tag}
            </UIBadge>
          ))}
          {module.tags.length > 3 && (
            <UIBadge variant="outline" className="text-xs bg-primary/5">
              +{module.tags.length - 3} more
            </UIBadge>
          )}
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground space-x-3 mb-3">
          <div className="flex items-center">
            <Badge className="h-3 w-3 mr-1 text-purple-400" />
            <span>{module.difficulty}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-purple-400" />
            <span>{module.estimatedTime}</span>
          </div>
          <div className="flex items-center">
            <UserCheck className="h-3 w-3 mr-1 text-purple-400" />
            <span>{module.completionRate}% completion</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center text-amber-400">
          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
          <Star className="h-3 w-3 fill-transparent stroke-amber-400" />
          <span className="text-xs ml-1 text-muted-foreground">({Math.round(module.popularity / 10)})</span>
        </div>
        <Button 
          size="sm" 
          className="text-xs px-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 group"
          onClick={onStart}
        >
          <span>Start</span>
          <Zap className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </GlassMorphCard>
  );
};

// Add state management for module progress
const useModuleProgress = (moduleId: string) => {
  const [progress, setProgress] = useState<ModuleProgress>({
    completedSections: [],
    timeSpent: 0,
    lastAccessed: new Date(),
    notes: {},
    assessmentAnswers: {},
    practiceProgress: {}
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`module-progress-${moduleId}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [moduleId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`module-progress-${moduleId}`, JSON.stringify(progress));
  }, [progress, moduleId]);

  const updateProgress = (sectionIndex: number) => {
    setProgress(prev => ({
      ...prev,
      completedSections: [...new Set([...prev.completedSections, sectionIndex])],
      lastAccessed: new Date()
    }));
  };

  const saveNotes = (sectionIndex: number, notes: string) => {
    setProgress(prev => ({
      ...prev,
      notes: { ...prev.notes, [sectionIndex]: notes }
    }));
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully."
    });
  };

  const submitAssessmentAnswer = (questionId: string, answer: string) => {
    setProgress(prev => ({
      ...prev,
      assessmentAnswers: { ...prev.assessmentAnswers, [questionId]: answer }
    }));
  };

  const markPracticeProblemComplete = (problemId: string) => {
    setProgress(prev => ({
      ...prev,
      practiceProgress: { ...prev.practiceProgress, [problemId]: true }
    }));
  };

  return {
    progress,
    updateProgress,
    saveNotes,
    submitAssessmentAnswer,
    markPracticeProblemComplete
  };
};

const ModuleDetailView = ({ module, onBack }: { module: Module, onBack: () => void }) => {
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>("normal");
  const [lineSpacing, setLineSpacing] = useState<string>("normal");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState<boolean>(false);
  const [assessmentTimeRemaining, setAssessmentTimeRemaining] = useState<number>(45 * 60); // 45 minutes in seconds
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [codeSolutions, setCodeSolutions] = useState<{ [key: string]: string }>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Python");
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [newNote, setNewNote] = useState<string>("");

  const {
    progress,
    updateProgress,
    saveNotes,
    submitAssessmentAnswer,
    markPracticeProblemComplete
  } = useModuleProgress(module.id);

  // Handle assessment timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAssessmentStarted && assessmentTimeRemaining > 0) {
      timer = setInterval(() => {
        setAssessmentTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAssessmentStarted, assessmentTimeRemaining]);

  // Handle bookmarking
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked-modules') || '[]');
    setIsBookmarked(bookmarks.includes(module.id));
  }, [module.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked-modules') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((id: string) => id !== module.id);
      localStorage.setItem('bookmarked-modules', JSON.stringify(newBookmarks));
    } else {
      bookmarks.push(module.id);
      localStorage.setItem('bookmarked-modules', JSON.stringify(bookmarks));
    }
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Module bookmarked",
      description: isBookmarked ? "Module removed from your bookmarks." : "Module added to your bookmarks."
    });
  };

  const handleSaveNotes = () => {
    saveNotes(currentSection, notes);
  };

  const handleStartAssessment = () => {
    setIsAssessmentStarted(true);
    toast({
      title: "Assessment started",
      description: "You have 45 minutes to complete the assessment. Good luck!"
    });
  };

  const handleSubmitAssessment = () => {
    // Calculate score and save progress
    const totalQuestions = Object.keys(selectedAnswers).length + Object.keys(codeSolutions).length;
    const completedQuestions = Object.values(selectedAnswers).filter(Boolean).length +
      Object.values(codeSolutions).filter(Boolean).length;

    if (completedQuestions < totalQuestions) {
      toast({
        title: "Cannot submit yet",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Submit answers and show results
    Object.entries(selectedAnswers).forEach(([id, answer]) => {
      submitAssessmentAnswer(id, answer);
    });

    setIsAssessmentStarted(false);
    toast({
      title: "Assessment submitted",
      description: "Your answers have been submitted successfully. Check your results in the assessment section."
    });
  };

  const handleTestSolution = (problemId: string, solution: string) => {
    // Implement test case running logic here
    toast({
      title: "Running tests",
      description: "Testing your solution against sample cases..."
    });
    // Simulate test execution
    setTimeout(() => {
      toast({
        title: "Tests passed",
        description: "Your solution passed all sample test cases!"
      });
      markPracticeProblemComplete(problemId);
    }, 1500);
  };

  const handleShareModule = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Module link copied to clipboard."
    });
  };

  const handleSaveProgress = () => {
    updateProgress(currentSection);
    toast({
      title: "Progress saved",
      description: "Your progress has been saved successfully."
    });
  };

  // Load resources on mount
  useEffect(() => {
    // Load saved study notes
    const savedNotes = localStorage.getItem(`module-notes-${module.id}`);
    if (savedNotes) {
      setStudyNotes(JSON.parse(savedNotes));
    }

    // Generate practice exercises based on module content
    setExercises([
      {
        id: '1',
        title: `${module.tags[0]} Fundamentals`,
        difficulty: 'Beginner',
        description: `Practice the basic concepts of ${module.tags[0]}.`,
        solution: '',
        completed: false
      },
      {
        id: '2',
        title: `Advanced ${module.tags[0]}`,
        difficulty: 'Intermediate',
        description: `Apply advanced ${module.tags[0]} concepts to solve complex problems.`,
        solution: '',
        completed: false
      }
    ]);

    // Set up reference materials
    setReferences([
      {
        id: '1',
        title: `${module.subcategory} Documentation`,
        type: 'documentation',
        url: '#',
        description: `Official documentation for ${module.subcategory}`
      },
      {
        id: '2',
        title: `${module.tags[0]} Tutorial`,
        type: 'tutorial',
        url: '#',
        description: `Step-by-step tutorial for ${module.tags[0]}`
      },
      {
        id: '3',
        title: 'Practice Examples',
        type: 'example',
        url: '#',
        description: `Real-world examples of ${module.tags[0]} applications`
      }
    ]);
  }, [module.id]);

  const handleSaveNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Cannot save empty note",
        description: "Please enter some content for your note.",
        variant: "destructive"
      });
      return;
    }

    const note: StudyNote = {
      id: Date.now().toString(),
      title: `Note ${studyNotes.length + 1}`,
      content: newNote,
      timestamp: new Date()
    };

    const updatedNotes = [...studyNotes, note];
    setStudyNotes(updatedNotes);
    setNewNote("");
    
    // Save to localStorage
    localStorage.setItem(`module-notes-${module.id}`, JSON.stringify(updatedNotes));
    
    toast({
      title: "Note saved",
      description: "Your study note has been saved successfully."
    });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = studyNotes.filter(note => note.id !== noteId);
    setStudyNotes(updatedNotes);
    localStorage.setItem(`module-notes-${module.id}`, JSON.stringify(updatedNotes));
    
    toast({
      title: "Note deleted",
      description: "Your study note has been deleted."
    });
  };

  const handleCompleteExercise = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, completed: true } : ex
    ));
    
    toast({
      title: "Exercise completed",
      description: "Great job! Keep up the good work!"
    });
  };

  // Resource content components
  const ResourceContent = () => {
    switch (activeResource) {
      case 'notes':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <textarea
                className={`
                  w-full h-32 sm:h-40 
                  p-3 rounded-lg 
                  bg-gray-800/50 border border-gray-700 
                  text-sm resize-none 
                  focus:outline-none focus:border-purple-500
                `}
                placeholder="Take notes while studying..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleSaveNote}
                >
                  Save Note
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {studyNotes.map(note => (
                <div key={note.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-medium">{note.title}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(note.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'exercises':
        return (
          <div className="space-y-4">
            {exercises.map(exercise => (
              <div key={exercise.id} className="p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium">{exercise.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    exercise.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{exercise.description}</p>
                <div className="flex justify-end">
                  <Button
                    variant={exercise.completed ? "ghost" : "default"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleCompleteExercise(exercise.id)}
                    disabled={exercise.completed}
                  >
                    {exercise.completed ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                    ) : (
                      'Start Exercise'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'assessment':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="text-sm font-medium mb-2">Assessment Overview</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2" />
                  <span>Multiple choice questions (30%)</span>
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                  <span>Practical problems (70%)</span>
                </li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setCurrentSection(3)} // Navigate to assessment section
                >
                  Start Assessment
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-sm font-medium mb-2">Preparation Tips</h4>
              <ul className="space-y-1 text-sm">
                <li>• Review all core concepts thoroughly</li>
                <li>• Complete practice exercises</li>
                <li>• Time yourself during practice</li>
                <li>• Focus on problem-solving strategies</li>
              </ul>
            </div>
          </div>
        );
      
      case 'references':
        return (
          <div className="space-y-4">
            {references.map(ref => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start">
                  <div className="p-2 mr-3 rounded-lg bg-purple-500/20">
                    {ref.type === 'documentation' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    )}
                    {ref.type === 'tutorial' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    )}
                    {ref.type === 'example' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{ref.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{ref.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Parse estimated time to get the number of hours
  const estimatedHours = Number(module.estimatedTime.split(' ')[0]) || 0;

  // Generate detailed concepts based on module tags and category
  const generateDetailedConcepts = () => {
    return module.tags.map(tag => ({
      title: tag,
      description: `Understanding ${tag} in the context of ${module.subcategory}`,
      keyPoints: [
        `Core principles of ${tag}`,
        `Common applications in ${module.subcategory}`,
        `Best practices and patterns`,
        `Performance considerations`
      ],
      examples: [
        {
          title: "Basic Implementation",
          description: `Simple example of ${tag} usage`,
          code: module.code || `// Example code for ${tag}\n// Will be provided by instructor`
        },
        {
          title: "Advanced Usage",
          description: `Complex implementation of ${tag}`,
          code: `// Advanced ${tag} implementation\n// Will be provided by instructor`
        }
      ]
    }));
  };

  // Generate practice problems based on difficulty
  const generatePracticeProblems = () => {
    const difficulties = {
      Beginner: 3,
      Intermediate: 4,
      Advanced: 5
    };

    return Array.from({ length: difficulties[module.difficulty] }, (_, i) => ({
      id: `problem-${i + 1}`,
      title: `Practice Problem ${i + 1}`,
      difficulty: i < 2 ? "Beginner" : i < 4 ? "Intermediate" : "Advanced",
      description: `Apply your knowledge of ${module.tags[i % module.tags.length]} to solve this problem.`,
      constraints: [
        "Time limit: 1 second",
        "Memory limit: 256 MB",
        `Input: Follows ${module.subcategory} standard format`,
        "Output: Print the result according to the problem requirements"
      ],
      testCases: [
        { input: "Sample input 1", output: "Expected output 1", explanation: "Detailed explanation of the approach" },
        { input: "Sample input 2", output: "Expected output 2", explanation: "Edge case handling" }
      ]
    }));
  };

  const sections = [
    {
      title: "Introduction",
      content: `
        <h2 class="mb-6 text-gradient">Welcome to ${module.title}</h2>
        
        <div class="p-4 mb-6 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p class="mb-2"><strong>Learning Objectives:</strong></p>
          <ul class="space-y-1">
            <li>✓ Master the fundamentals of ${module.tags[0]}</li>
            <li>✓ Understand advanced concepts in ${module.subcategory}</li>
            <li>✓ Apply theoretical knowledge to practical problems</li>
            <li>✓ Develop problem-solving skills using ${module.tags.join(", ")}</li>
          </ul>
        </div>
        
        <div class="p-4 mb-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p class="mb-2"><strong>Prerequisites:</strong></p>
          <ul class="space-y-1">
            ${module.difficulty === "Beginner" ? `
              <li>• No prior knowledge required</li>
              <li>• Basic understanding of programming concepts</li>
            ` : module.difficulty === "Intermediate" ? `
              <li>• Fundamental ${module.subcategory} concepts</li>
              <li>• Basic problem-solving skills</li>
              <li>• Understanding of ${module.tags[0]} basics</li>
            ` : `
              <li>• Strong foundation in ${module.subcategory}</li>
              <li>• Experience with ${module.tags.slice(0, 2).join(" and ")}</li>
              <li>• Problem-solving and analytical skills</li>
            `}
          </ul>
        </div>
        
        <div class="flex items-center p-3 my-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div class="mr-4 p-2 rounded-full bg-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="M12 2L4 10l8 8 8-8-8-8Z"></path><path d="m12 18-8 4 8-10 8 10-8-4Z"></path></svg>
          </div>
          <div>
            <p class="text-amber-400 font-medium">Why This Matters</p>
            <p class="text-sm">${module.description} This knowledge is essential for ${
              module.category === "programming" ? "building robust software applications" :
              module.category === "mathematics" ? "solving complex mathematical problems" :
              module.category === "science" ? "understanding scientific principles" :
              "mastering language and communication skills"
            }.</p>
          </div>
        </div>
        
        <div class="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <h3 class="font-medium mb-3">Module Structure</h3>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <div class="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">1</div>
              <span>Core Concepts (${Math.round(estimatedHours * 0.3)} hours)</span>
            </div>
            <div class="flex items-center text-sm">
              <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">2</div>
              <span>Practice Problems (${Math.round(estimatedHours * 0.4)} hours)</span>
            </div>
            <div class="flex items-center text-sm">
              <div class="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3">3</div>
              <span>Assessment (${Math.round(estimatedHours * 0.3)} hours)</span>
            </div>
          </div>
        </div>
      `
    },
    {
      title: "Core Concepts",
      content: `
        <h2 class="mb-6 text-gradient">Essential ${module.tags[0]} Concepts</h2>
        
        ${generateDetailedConcepts().map((concept, index) => `
          <div class="mb-8">
            <div class="p-4 rounded-lg ${
              index % 4 === 0 ? 'bg-purple-500/10 border-purple-500/20' : 
              index % 4 === 1 ? 'bg-blue-500/10 border-blue-500/20' : 
              index % 4 === 2 ? 'bg-green-500/10 border-green-500/20' : 
              'bg-amber-500/10 border-amber-500/20'
            } border">
              <h3 class="font-medium mb-3">${concept.title}</h3>
              <p class="mb-4">${concept.description}</p>
              
              <div class="mb-4">
                <h4 class="font-medium mb-2 text-sm">Key Points:</h4>
                <ul class="space-y-1 text-sm">
                  ${concept.keyPoints.map(point => `<li>• ${point}</li>`).join('')}
                </ul>
              </div>
              
              <div class="space-y-4">
                ${concept.examples.map(example => `
                  <div>
                    <h4 class="font-medium mb-2 text-sm">${example.title}</h4>
                    <p class="text-sm mb-2">${example.description}</p>
                    <div class="relative">
                      <div class="absolute right-2 top-2 flex space-x-1">
                        <button class="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                        <button class="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </button>
                      </div>
                      <pre class="p-4 rounded-lg bg-black/80 overflow-x-auto text-sm border border-gray-800"><code>${example.code}</code></pre>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
        
        <div class="p-4 rounded-lg bg-gray-800/50 border border-gray-700 mt-8">
          <h3 class="font-medium mb-3">Concept Map</h3>
          <p class="text-sm mb-4">Understanding how these concepts are interconnected:</p>
          <div class="p-4 rounded-lg bg-black/50 border border-gray-700">
            <!-- Add an interactive concept map visualization here -->
            <div class="flex flex-wrap gap-4 justify-center">
              ${module.tags.map((tag, i) => `
                <div class="relative">
                  <div class="p-3 rounded-lg bg-gray-800/80 border border-gray-700">
                    <span class="text-sm font-medium">${tag}</span>
                  </div>
                  ${i < module.tags.length - 1 ? `
                    <svg class="absolute top-1/2 -right-4 transform -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `
    },
    {
      title: "Practice Problems",
      content: `
        <h2 class="mb-6 text-gradient">Practice Problems</h2>
        
        <div class="space-y-6">
          ${generatePracticeProblems().map((problem, index) => `
            <div class="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="font-medium mb-1">${problem.title}</h3>
                  <p class="text-sm text-gray-400">${problem.description}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded ${
                  problem.difficulty === "Beginner" ? "bg-green-500/20 text-green-300" :
                  problem.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-300" :
                  "bg-red-500/20 text-red-300"
                }">${problem.difficulty}</span>
              </div>
              
              <div class="mb-4">
                <h4 class="text-sm font-medium mb-2">Constraints:</h4>
                <ul class="space-y-1 text-sm text-gray-400">
                  ${problem.constraints.map(constraint => `<li>• ${constraint}</li>`).join('')}
                </ul>
              </div>
              
              <div class="space-y-4">
                <h4 class="text-sm font-medium mb-2">Sample Test Cases:</h4>
                ${problem.testCases.map((testCase, i) => `
                  <div class="p-3 rounded-lg bg-black/50 border border-gray-700">
                    <div class="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Test Case ${i + 1}</span>
                      <button class="text-blue-400 hover:text-blue-300">Run Test</button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="text-xs text-gray-400 mb-1">Input:</div>
                        <pre class="p-2 rounded bg-gray-900/50 text-xs">${testCase.input}</pre>
                      </div>
                      <div>
                        <div class="text-xs text-gray-400 mb-1">Expected Output:</div>
                        <pre class="p-2 rounded bg-gray-900/50 text-xs">${testCase.output}</pre>
                      </div>
                    </div>
                    <div class="mt-2">
                      <div class="text-xs text-gray-400 mb-1">Explanation:</div>
                      <p class="text-xs text-gray-300">${testCase.explanation}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="mt-4 flex justify-end">
                <button class="px-3 py-1.5 text-xs rounded-lg border border-purple-500/50 hover:bg-purple-500/10 text-purple-400 font-medium transition-colors">
                  Start Solving
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `
    },
    {
      title: "Assessment",
      content: `
        <h2 class="mb-6 text-gradient">Module Assessment</h2>
        
        <div class="p-5 rounded-lg bg-gray-800/50 border border-gray-700 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium">Final Assessment</h3>
            <div class="flex items-center space-x-2 text-sm">
              <span class="text-gray-400">Time Limit:</span>
              <span class="px-2 py-1 rounded bg-gray-900/50 border border-gray-700">45 minutes</span>
            </div>
          </div>
          
          <p class="text-sm text-gray-300 mb-6">
            This assessment will test your understanding of ${module.tags.join(", ")} and their applications in ${module.subcategory}.
            Complete all questions to receive your certification.
          </p>
          
          <div class="space-y-8">
            <!-- Multiple Choice Questions -->
            <div class="space-y-6">
              <h4 class="font-medium text-sm">Part 1: Concept Check (30%)</h4>
              ${Array.from({ length: 3 }, (_, i) => `
                <div class="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <p class="font-medium mb-3">Question ${i + 1}: Understanding ${module.tags[i % module.tags.length]}</p>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="radio"
                        name="q${i + 1}"
                        value="${['A', 'B', 'C', 'D'][i % 4]}"
                        class="accent-purple-500"
                        ${selectedAnswers[`q${i + 1}`] === ['A', 'B', 'C', 'D'][i % 4] ? 'checked' : ''}
                        onchange="handleAnswerSelect('q${i + 1}', '${['A', 'B', 'C', 'D'][i % 4]}')"
                      />
                      <span class="text-sm">Option ${['A', 'B', 'C', 'D'][i % 4]}</span>
                    </label>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <!-- Practical Problems -->
            <div class="space-y-6">
              <h4 class="font-medium text-sm">Part 2: Practical Application (70%)</h4>
              ${Array.from({ length: 2 }, (_, i) => `
                <div class="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <p class="font-medium mb-1">Problem ${i + 1}: ${module.tags[i % module.tags.length]} Implementation</p>
                      <p class="text-sm text-gray-400">Implement a solution using ${module.tags[i % module.tags.length]} concepts.</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded ${i === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}">
                      ${i === 0 ? '15 points' : '20 points'}
                    </span>
                  </div>
                  
                  <div class="mb-4">
                    <h5 class="text-sm font-medium mb-2">Requirements:</h5>
                    <ul class="space-y-1 text-sm text-gray-400 list-disc pl-4">
                      <li>Implement the required functionality</li>
                      <li>Handle edge cases appropriately</li>
                      <li>Optimize for performance where possible</li>
                      <li>Include comments explaining your approach</li>
                    </ul>
                  </div>
                  
                  <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="text-sm font-medium">Your Solution:</h5>
                      <div class="flex items-center space-x-2">
                        <select class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700">
                          <option>Python</option>
                          <option>JavaScript</option>
                          <option>Java</option>
                          <option>C++</option>
                        </select>
                        <button class="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700">
                          Reset
                        </button>
                      </div>
                    </div>
                    <div class="relative">
                      <textarea
                        class="w-full h-40 p-3 rounded-lg bg-black/80 border border-gray-800 text-sm font-mono focus:outline-none focus:border-purple-500"
                        placeholder="Write your solution here..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div class="flex justify-end space-x-2">
                    <button class="px-3 py-1.5 text-xs rounded-lg border border-purple-500/50 hover:bg-purple-500/10 text-purple-400 font-medium transition-colors">
                      Test Solution
                    </button>
                    <button class="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium transition-colors">
                      Submit Solution
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="mt-8 flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400 mr-1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="text-sm text-gray-400">Time Remaining: ${Math.floor(assessmentTimeRemaining / 60)}:${assessmentTimeRemaining % 60 < 10 ? '0' : ''}${assessmentTimeRemaining % 60}</span>
              </div>
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400 mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span class="text-sm text-gray-400">Progress: ${Object.values(selectedAnswers).filter(Boolean).length}/${Object.keys(selectedAnswers).length}</span>
              </div>
            </div>
            <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium transition-colors">
              Submit Assessment
            </button>
          </div>
        </div>
        
        <div class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h3 class="font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Assessment Guidelines
          </h3>
          <ul class="space-y-1 text-sm">
            <li>• You must complete all questions to receive a grade</li>
            <li>• Each practical problem includes multiple test cases</li>
            <li>• You can use any of the provided programming languages</li>
            <li>• Time limit is strictly enforced</li>
          </ul>
        </div>
      `
    }
  ];

  // Font size classes map with responsive variants
  const fontSizeClasses = {
    "small": "text-xs sm:text-sm",
    "normal": "text-sm sm:text-base",
    "large": "text-base sm:text-lg",
    "x-large": "text-lg sm:text-xl"
  };

  // Line spacing classes map with responsive variants
  const lineSpacingClasses = {
    "tight": "leading-tight sm:leading-snug",
    "normal": "leading-snug sm:leading-normal",
    "relaxed": "leading-normal sm:leading-relaxed",
    "loose": "leading-relaxed sm:leading-loose"
  };

  return (
    <div className={`
      container mx-auto 
      px-4 sm:px-6 md:px-8 
      py-6 sm:py-8 
      ${containerClasses.sm}
      sm:${containerClasses.md}
      lg:${containerClasses.lg}
      xl:${containerClasses.xl}
      2xl:${containerClasses['2xl']}
    `}>
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-gray-800/50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to modules</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isBookmarked ? 'text-amber-400' : 'text-muted-foreground'}`}
            onClick={toggleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={handleShareModule}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          {module.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <UIBadge variant="outline" className="bg-primary/10">
            {module.subcategory}
          </UIBadge>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Badge className="h-3 w-3 mr-1 text-purple-400" />
            <span>{module.difficulty}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1 text-purple-400" />
            <span>{module.estimatedTime}</span>
          </div>
          
          <div className="flex items-center text-amber-400">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="text-xs ml-1">{Math.round(module.popularity / 10)}/10</span>
          </div>
        </div>
        
        <p className="text-gray-300 max-w-3xl">
          {module.description}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="space-y-3">
          <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <h3 className="font-medium mb-3 text-sm text-gray-300">Module Progress</h3>
            <Progress value={25} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">1 of 4 sections completed</p>
          </Card>
          
          <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <h3 className="font-medium mb-3 text-sm text-gray-300">Reading Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Text Size</label>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={fontSize === "small" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setFontSize("small")}
                  >
                    Small
                  </Button>
                  <Button 
                    variant={fontSize === "normal" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setFontSize("normal")}
                  >
                    Normal
                  </Button>
                  <Button 
                    variant={fontSize === "large" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setFontSize("large")}
                  >
                    Large
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Line Spacing</label>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={lineSpacing === "tight" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setLineSpacing("tight")}
                  >
                    Tight
                  </Button>
                  <Button 
                    variant={lineSpacing === "normal" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setLineSpacing("normal")}
                  >
                    Normal
                  </Button>
                  <Button 
                    variant={lineSpacing === "relaxed" ? "default" : "outline"} 
                    size="sm" 
                    className="h-7 px-2 text-xs flex-1"
                    onClick={() => setLineSpacing("relaxed")}
                  >
                    Relaxed
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <h3 className="font-medium mb-3 text-sm text-gray-300">Resources</h3>
            <div className="space-y-1.5">
              <Button
                variant={activeResource === 'notes' ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => setActiveResource('notes')}
              >
                <FileText className="h-3 w-3 mr-2" />
                <span>Study Notes {studyNotes.length > 0 && `(${studyNotes.length})`}</span>
              </Button>
              <Button
                variant={activeResource === 'exercises' ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => setActiveResource('exercises')}
              >
                <FileText className="h-3 w-3 mr-2" />
                <span>Practice Exercises {exercises.filter(e => e.completed).length > 0 && 
                  `(${exercises.filter(e => e.completed).length}/${exercises.length})`}</span>
              </Button>
              <Button
                variant={activeResource === 'assessment' ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => setActiveResource('assessment')}
              >
                <FileText className="h-3 w-3 mr-2" />
                <span>Assessment Guide</span>
              </Button>
              <Button
                variant={activeResource === 'references' ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-xs h-9"
                onClick={() => setActiveResource('references')}
              >
                <FileText className="h-3 w-3 mr-2" />
                <span>Reference Materials {references.length > 0 && `(${references.length})`}</span>
              </Button>
            </div>
          </Card>

          {/* Show resource content when a resource is selected */}
          {activeResource && (
            <Card className="p-4 bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm text-gray-300">
                  {activeResource === 'notes' && 'Study Notes'}
                  {activeResource === 'exercises' && 'Practice Exercises'}
                  {activeResource === 'assessment' && 'Assessment Guide'}
                  {activeResource === 'references' && 'Reference Materials'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setActiveResource(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Button>
              </div>
              <ResourceContent />
            </Card>
          )}
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white">
                {sections[currentSection].title}
              </h2>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <PauseCircle className="h-3 w-3 mr-1" />
                  <span>Save Progress</span>
                </Button>
                
                <Button variant="default" size="sm" className="text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  <span>Continue</span>
                </Button>
              </div>
            </div>
            
            <div 
              className={`prose prose-invert max-w-none ${fontSizeClasses[fontSize]} ${lineSpacingClasses[lineSpacing]} 
                prose-headings:text-gray-200 prose-p:text-gray-300 prose-li:text-gray-300 
                prose-headings:font-medium prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:my-4 prose-ul:my-4 prose-ol:my-4
                prose-strong:text-white prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic
                prose-pre:bg-black/50 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-md
                prose-img:rounded-lg prose-img:mx-auto`}
              dangerouslySetInnerHTML={{ __html: sections[currentSection].content }}
            />
            
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentSection === 0}
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                className="text-xs flex items-center"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                <span>Previous Section</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                disabled={currentSection === sections.length - 1}
                onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                className="text-xs flex items-center"
              >
                <span>Next Section</span>
                <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyModules;
