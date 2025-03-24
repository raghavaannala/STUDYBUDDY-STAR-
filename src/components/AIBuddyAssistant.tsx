import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Minus, Bot, Star, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { getChatResponse } from '../services/gemini';
import { useToast } from "./ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  x: number;
  y: number;
}

export function AIBuddyAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
          content: '✨ Hello there! I\'m your magical study assistant. How can I help you today with your studies, coding questions, or any other academic magic you need? ✨' 
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
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
    
    console.log("Toggle chat clicked! Current state:", { isOpen, isMinimized });
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
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

  return (
    <>
      {!isOpen && (
        <div 
          ref={buttonRef}
          className="fixed z-50 cursor-grab active:cursor-grabbing"
          style={{
            bottom: position.y === 0 ? '1.5rem' : 'auto',
            right: position.x === 0 ? '1.5rem' : 'auto',
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
              className="ai-buddy-button relative h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-yellow-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-400/50 flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 z-20 cursor-pointer"
              onClick={toggleChat}
              aria-label="Open chat assistant"
              style={{
                filter: "drop-shadow(0 0 15px rgba(147, 51, 234, 0.5))",
              }}
            >
              <Star className="h-9 w-9" fill="currentColor" />
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
            
            <div className="absolute bottom-full right-0 mb-3 opacity-100 pointer-events-none animate-float-slow" style={{ animationDelay: "1.5s" }}>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-[0_5px_15px_rgba(147,51,234,0.3)] text-xs whitespace-nowrap border border-purple-400/30 animate-pulse-subtle">
                <span className="mr-1">✨</span>
                Click for magic help
                <span className="ml-1">✨</span>
                <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-indigo-600"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className={`backdrop-blur-md bg-slate-900/95 border border-purple-500/30 shadow-lg overflow-hidden ${isMinimized ? 'w-64' : 'w-80 sm:w-96'}`}>
            <div className="p-3 bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <h3 className="font-semibold">Magical Assistant</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-purple-500/20" 
                  onClick={minimizeChat}
                >
                  <Minus className="h-4 w-4" />
                </Button>
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

            <div className="h-[350px] p-3">
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

            <form onSubmit={handleSubmit} className="p-3 pt-2 border-t border-purple-500/20 bg-slate-800/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm bg-slate-800 border-purple-500/30 focus:border-purple-400"
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
            </form>
          </Card>
        </div>
      )}
    </>
  );
} 