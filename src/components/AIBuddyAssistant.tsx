import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Minus, Bot, Star, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { getChatResponse } from '../services/gemini';
import { useToast } from "./ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAIAware } from '@/contexts/AIAwareContext';
import { useDeviceDetect } from '@/hooks/useMediaQuery';

// Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Position interface for dragging
interface Position {
  x: number;
  y: number;
}

// Founder information interface
interface FounderInfo {
  name: string;
  role: string;
  background: string;
}

// Founders data interface
interface FoundersData {
  founders: FounderInfo[];
  founded: string;
  mission: string;
}

// App features and navigation quick links
const appFeatures = {
  "code": {
    description: "AI-powered code completion, debugging, and explanation",
    pages: ["/code-assistant", "/code-genie", "/code-diplomate"]
  },
  "study": {
    description: "Join or create study groups to learn together", 
    pages: ["/study", "/study-groups"]
  },
  "quiz": {
    description: "Interactive learning, AI-generated quizzes and summaries",
    pages: ["/quiz"]
  },
  "games": {
    description: "Learn through play with interactive coding games and challenges",
    pages: ["/games"]
  },
  "collaborate": {
    description: "Work together with peers in interactive study rooms",
    pages: ["/collaborate"]
  }
};

// Default founders data
const defaultFoundersData: FoundersData = {
  founders: [
    {
      name: "Raghava",
      role: "Full Stack & UI UX",
      background: "Expert in creating beautiful and functional user interfaces"
    },
    {
      name: "Deekshith",
      role: "Full Stack & Backend",
      background: "Specialist in robust backend architecture and database management"
    },
    {
      name: "Vikas",
      role: "Chief Evangelist",
      background: "Technology advocate and community builder focused on promoting StudyBuddy's mission"
    },
    {
      name: "Rajkumar",
      role: "CSS Stylist",
      background: "Creating pixel-perfect designs and responsive layouts"
    },
    {
      name: "Anji",
      role: "Data Analyst",
      background: "Data science expert focusing on analytics and insights"
    }
  ],
  founded: "2023",
  mission: "To make learning accessible, interactive, and personalized through AI technology"
};

// Common academic subjects for quick responses
const academicSubjects = [
  "programming", "mathematics", "physics", "chemistry", "biology",
  "history", "english", "literature", "computer science", "data structures", 
  "algorithms", "web development", "machine learning"
];

export function AIBuddyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [foundersInfo, setFoundersInfo] = useState<FoundersData>(defaultFoundersData);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAIActive, aiSuggestion, recordUserAction } = useAIAware();
  const { isMobile } = useDeviceDetect();

  // Load founders info when component mounts
  useEffect(() => {
    async function loadFoundersInfo() {
      try {
        // Instead of importing, we simulate loading the founders info
        // In a real app, this would be an API call to your backend
        console.log("Loading founders info from service...");
        
        // We already have the founders data in defaultFoundersData,
        // so we'll just simulate a successful load after a short delay
        setTimeout(() => {
          setFoundersInfo(defaultFoundersData);
        }, 300);
      } catch (error) {
        console.error("Failed to load founders info:", error);
        // Keep using the default foundersInfo if fetch fails
      }
    }
    
    loadFoundersInfo();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && buttonRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - buttonRef.current.offsetWidth;
        const maxY = window.innerHeight - buttonRef.current.offsetHeight;
        
        setPosition({
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY)
        });
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && buttonRef.current && e.touches[0]) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;
        
        const maxX = window.innerWidth - buttonRef.current.offsetWidth;
        const maxY = window.innerHeight - buttonRef.current.offsetHeight;
        
        setPosition({
          x: Math.min(Math.max(0, newX), maxX),
          y: Math.min(Math.max(0, newY), maxY)
        });
        
        e.preventDefault();
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let attentionInterval: NodeJS.Timeout;
    
    if (!isOpen && !isDragging) {
      attentionInterval = setInterval(() => {
        const buttonEl = document.querySelector('.ai-buddy-button');
        if (buttonEl) {
          buttonEl.classList.add('animate-bounce-once');
          setTimeout(() => {
            buttonEl.classList.remove('animate-bounce-once');
          }, 1000);
        }
      }, 8000);
    }
    
    return () => {
      if (attentionInterval) clearInterval(attentionInterval);
    };
  }, [isOpen, isDragging]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: '✨ Hello there! I\'m your magical study assistant. I can help you navigate the app, explain features, or answer academic questions! Try asking about "code help", "study groups" or any academic subject. ✨' 
        }
      ]);
      
      // Show the guide for new sessions
      const hasSeenGuide = localStorage.getItem('hasSeenAssistantGuide');
      if (!hasSeenGuide) {
        setShowGuide(true);
        localStorage.setItem('hasSeenAssistantGuide', 'true');
      }
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Hide assistant when AI is disabled
    if (!isAIActive && isOpen) {
      setIsOpen(false);
    }
  }, [isAIActive, isOpen]);

  useEffect(() => {
    // Process suggestions from other components
    if (aiSuggestion && isAIActive && !isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: aiSuggestion }
        ]);
      }, 500);
    }
  }, [aiSuggestion, isAIActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    setShowGuide(false); // Hide guide when user sends a message

    // Check if user is asking for help with the assistant
    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes('help') && 
        (lowerCaseMessage.includes('assistant') || lowerCaseMessage.includes('how to use') || 
         lowerCaseMessage.includes('what can you do') || lowerCaseMessage.includes('guide'))) {
      setShowGuide(true);
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: '✨ Here\'s a guide to help you use me effectively! Check out the overlay with tips. ✨' }
      ]);
      setIsLoading(false);
      return;
    }

    // Check if user is asking about founders
    if (lowerCaseMessage.includes('founder') || 
        lowerCaseMessage.includes('who made') || 
        lowerCaseMessage.includes('who created') || 
        lowerCaseMessage.includes('who built') ||
        lowerCaseMessage.includes('who developed') ||
        lowerCaseMessage.includes('company info')) {
      
      // Check for specific founder questions
      let specificFounder = null;
      for (const founder of foundersInfo.founders) {
        if (lowerCaseMessage.includes(founder.name.toLowerCase())) {
          specificFounder = founder;
          break;
        }
      }
      
      if (specificFounder) {
        // Answer about specific founder
        const founderResponse = `✨ ${specificFounder.name} is our ${specificFounder.role}. ${specificFounder.background}. They are one of the key members of our founding team at StudyBuddy! ✨`;
        
        setMessages(prev => [
          ...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: founderResponse }
        ]);
      } else {
        // Answer about all founders
        let foundersResponse = `✨ StudyBuddy was founded in ${foundersInfo.founded} with the mission: "${foundersInfo.mission}".\n\nOur founders are:\n`;
        
        // Dynamically create the list of founders
        foundersInfo.founders.forEach(founder => {
          foundersResponse += `• ${founder.name} (${founder.role}) - ${founder.background}\n`;
        });
        
        foundersResponse += "\nIs there anything specific about our team or company you'd like to know? ✨";
        
        setMessages(prev => [
          ...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: foundersResponse }
        ]);
      }
      
      setIsLoading(false);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Check for navigation or feature request keywords first
      const lowerCaseMessage = userMessage.toLowerCase();
      
      // Navigation commands
      if (lowerCaseMessage.includes("go to") || lowerCaseMessage.includes("navigate to") || lowerCaseMessage.includes("open")) {
        for (const [feature, info] of Object.entries(appFeatures)) {
          if (lowerCaseMessage.includes(feature)) {
            // Navigate to the first page in the feature's pages array
            navigate(info.pages[0]);
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `✨ I've opened the ${feature} feature for you! Let me know if you need any help using it. ✨` 
            }]);
            
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Help with app features
      if (lowerCaseMessage.includes("how to use") || lowerCaseMessage.includes("explain feature") || 
          lowerCaseMessage.includes("what is") || lowerCaseMessage.includes("how does")) {
        for (const [feature, info] of Object.entries(appFeatures)) {
          if (lowerCaseMessage.includes(feature)) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `✨ The ${feature} feature lets you ${info.description}. Would you like me to open it for you? Just say "go to ${feature}" and I'll take you there! ✨` 
            }]);
            
            setIsLoading(false);
            return;
          }
        }
      }

      // Regular response using Gemini
      const response = await getChatResponse(userMessage);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (isDragging) return;
    
    if (!isAIActive) {
      toast({
        title: "AI Assistant is turned off",
        description: "Turn on AI Assistant in your profile menu to use this feature.",
        duration: 3000
      });
      return;
    }
    
    console.log("Toggle chat clicked! Current state:", { isOpen, isMinimized });
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
    
    // Record interaction if recordUserAction is available
    if (recordUserAction) {
      recordUserAction(`assistant_${isOpen ? 'closed' : 'opened'}`);
    }
  };

  const minimizeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };
  
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (buttonRef.current) {
      let clientX, clientY;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      
      const rect = buttonRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Add a small delay before hiding suggestions to allow for clicking them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Auto-submit the suggestion
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };

  return (
    <>
      {!isOpen && (
        <div 
          ref={buttonRef}
          className="fixed z-50 cursor-grab active:cursor-grabbing"
          style={{
            bottom: position.y === 0 ? (isMobile ? '5rem' : '1.5rem') : 'auto',
            right: position.x === 0 ? (isMobile ? '1rem' : '1.5rem') : 'auto',
            top: position.y !== 0 ? `${position.y}px` : 'auto',
            left: position.x !== 0 ? `${position.x}px` : 'auto',
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="relative group">
            <div className="absolute inset-0 animate-float pointer-events-none">
              <div className="absolute inset-0 rounded-full animate-ping-slow opacity-40 bg-purple-500"></div>
              <div className="absolute inset-0 rounded-full animate-ping-slow opacity-30 bg-indigo-500" style={{ animationDelay: "1s" }}></div>
            </div>
            
            <button
              className="ai-buddy-button relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-yellow-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-400/50 flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 z-20 cursor-pointer"
              onClick={toggleChat}
              aria-label="Open chat assistant"
              style={{
                filter: "drop-shadow(0 0 15px rgba(147, 51, 234, 0.5))",
              }}
            >
              <Star className={`${isMobile ? 'h-7 w-7' : 'h-9 w-9'}`} fill="currentColor" />
              <Sparkles className="absolute top-1 right-1 h-5 w-5 text-yellow-300 animate-pulse-slow pointer-events-none" />
              
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white animate-twinkle pointer-events-none"
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 3 + 3}s`,
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 215, 0, 0.9)',
                  }}
                />
              ))}
              
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border border-indigo-600 flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                1
              </div>
            </button>
            
            {!isMobile && (
              <div className="absolute bottom-full right-0 mb-3 opacity-100 pointer-events-none animate-float-slow" style={{ animationDelay: "1.5s" }}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-[0_5px_15px_rgba(147,51,234,0.3)] text-xs whitespace-nowrap border border-purple-400/30 animate-pulse-subtle">
                  <span className="mr-1">✨</span>
                  Click for magic help
                  <span className="ml-1">✨</span>
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-indigo-600"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className={`fixed ${isMobile ? 'inset-0 pt-16 pb-16 z-40' : 'bottom-6 right-6 z-50'}`}>
          {showGuide && (
            <div className="absolute inset-0 z-10 bg-black/60 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 m-4 rounded-lg border border-purple-500 max-w-xs">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 text-yellow-300 mr-2" />
                  Assistant Guide
                </h3>
                <ul className="space-y-2 text-sm text-white/90">
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                    <span>Ask me to navigate to any feature: <span className="text-purple-300">"Go to code assistant"</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                    <span>Get help with app features: <span className="text-purple-300">"How does BuddyResume work?"</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
                    <span>Ask academic questions: <span className="text-purple-300">"Explain binary search"</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</div>
                    <span>Get coding help: <span className="text-purple-300">"How do I fix this React error?"</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">5</div>
                    <span>Ask about our founders: <span className="text-purple-300">"Who created StudyBuddy?"</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-purple-500 rounded-full text-white h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">6</div>
                    <span><span className="text-yellow-300">Tip:</span> Click on any suggestion below the input to instantly ask those questions!</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowGuide(false)}
                >
                  Got it!
                </Button>
              </div>
            </div>
          )}
          
          <Card className={`${isMobile ? 'w-full h-full overflow-hidden rounded-none' : 'w-80 md:w-96 overflow-hidden shadow-2xl'} shadow-purple-500/20 border-purple-300/30`}>
            <div className="p-3 bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <h3 className="font-semibold">Magical Assistant</h3>
              </div>
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-purple-500/20" 
                    onClick={minimizeChat}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-purple-500/20" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={`bg-slate-900 text-slate-200 ${isMobile ? 'flex-grow overflow-y-auto' : 'h-80 overflow-hidden'} p-4`} style={{ height: isMobile ? 'calc(100% - 112px)' : '320px' }}>
              <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-100 border border-purple-500/10'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 text-sm bg-slate-800 text-slate-300 border border-purple-500/10">
                        <div className="flex items-center gap-2">
                          <div className="animate-bounce">•</div>
                          <div className="animate-bounce delay-100">•</div>
                          <div className="animate-bounce delay-200">•</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 p-3 border-t border-slate-800">
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 text-sm bg-slate-800 border-purple-500/30 focus:border-purple-400"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {showSuggestions && (
                  <div className="absolute bottom-full left-0 right-0 bg-slate-800 border border-slate-700 rounded-md max-h-40 overflow-auto z-10 mb-2">
                    <div className="p-2 border-b border-slate-700 bg-slate-900/50">
                      <span className="text-xs text-slate-400">App Features:</span>
                    </div>
                    {Object.keys(appFeatures).map((feature) => (
                      <div 
                        key={feature}
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                        onClick={() => handleSuggestionClick(`How do I use the ${feature} feature?`)}
                      >
                        How do I use the {feature} feature?
                      </div>
                    ))}
                    <div className="p-2 border-b border-slate-700 border-t bg-slate-900/50">
                      <span className="text-xs text-slate-400">Academic Help:</span>
                    </div>
                    {academicSubjects.slice(0, 3).map((subject) => (
                      <div 
                        key={subject}
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                        onClick={() => handleSuggestionClick(`Help me with ${subject}`)}
                      >
                        Help me with {subject}
                      </div>
                    ))}
                    <div className="p-2 border-b border-slate-700 border-t bg-slate-900/50">
                      <span className="text-xs text-slate-400">About Us:</span>
                    </div>
                    <div 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                      onClick={() => handleSuggestionClick("Who are the founders of StudyBuddy?")}
                    >
                      Who are the founders of StudyBuddy?
                    </div>
                    <div 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                      onClick={() => handleSuggestionClick("What is StudyBuddy's mission?")}
                    >
                      What is StudyBuddy's mission?
                    </div>
                    <div 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                      onClick={() => handleSuggestionClick("Tell me about Raghava's role")}
                    >
                      Tell me about Raghava's role
                    </div>
                    <div 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-purple-500/20 text-slate-300"
                      onClick={() => handleSuggestionClick("What does Vikas do as Chief Evangelist?")}
                    >
                      What does Vikas do as Chief Evangelist?
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
} 