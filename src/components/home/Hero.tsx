import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad, BookOpen, FileText, Code, Sparkles, Brain, Rocket, Zap, Target } from 'lucide-react';
import FadeIn from '../animations/FadeIn';
import GlassMorphCard from '../ui/GlassMorphCard';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Modern animation styles
const modernAnimations = `
  @keyframes gradientShift {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.7; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
    50% { opacity: 1; box-shadow: 0 0 25px rgba(59, 130, 246, 0.8); }
  }
  
  @keyframes floatElement {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ModernLogo = () => {
  return (
    <div className="relative w-full max-w-[180px] sm:w-60 h-auto sm:h-60 mx-auto mb-2 sm:mb-6 z-10 transition-all duration-500 hover:scale-105">
      {/* Glowing background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-500/25 to-blue-400/30 blur-2xl transform scale-110 animate-pulse-slow opacity-70"></div>
      
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        <defs>
          {/* Modern gradient for main shape */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3B82F6' }}>
              <animate attributeName="stop-color" values="#3B82F6;#6366F1;#8B5CF6;#3B82F6" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#6366F1' }}>
              <animate attributeName="stop-color" values="#6366F1;#8B5CF6;#3B82F6;#6366F1" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#8B5CF6' }}>
              <animate attributeName="stop-color" values="#8B5CF6;#3B82F6;#6366F1;#8B5CF6" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Border gradient */}
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60A5FA' }}>
              <animate attributeName="stop-color" values="#60A5FA;#818CF8;#60A5FA" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#818CF8' }}>
              <animate attributeName="stop-color" values="#818CF8;#60A5FA;#818CF8" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#60A5FA' }}>
              <animate attributeName="stop-color" values="#60A5FA;#818CF8;#60A5FA" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Glow effect */}
          <filter id="modernGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feComponentTransfer in="coloredBlur" result="brighterBlur">
              <feFuncR type="linear" slope="1.5"/>
              <feFuncG type="linear" slope="1.5"/>
              <feFuncB type="linear" slope="1.5"/>
            </feComponentTransfer>
            <feComposite operator="in" in="brighterBlur" in2="SourceAlpha" result="brightGlow"/>
            <feMerge>
              <feMergeNode in="brightGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circles */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="0.6"
          strokeDasharray="1,2"
          opacity="0.5"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 50 50" 
            to="360 50 50" 
            dur="30s" 
            repeatCount="indefinite"
          />
        </circle>

        {/* Modern hexagon shape */}
        <path
          d="M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z"
          fill="url(#mainGradient)"
          filter="url(#modernGlow)"
          opacity="0.9"
        >
          <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Inner hexagon for layered effect */}
        <path
          d="M50,20 L75,35 L75,65 L50,80 L25,65 L25,30 Z"
          fill="#f8fafc"
          opacity="0.15"
        />

        {/* Center emblem */}
        <circle cx="50" cy="50" r="10" fill="#f8fafc" opacity="0.2" />
        <text
          x="50"
          y="53"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#f8fafc"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          SB
        </text>

        {/* Text elements */}
        <text
          x="50"
          y="33"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#f8fafc"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          STUDY
        </text>
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#f8fafc"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          BUDDY
        </text>

        {/* Accent dots */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const x = 50 + 45 * Math.cos(angle * Math.PI / 180);
          const y = 50 + 45 * Math.sin(angle * Math.PI / 180);
          return (
            <circle key={angle} cx={x} cy={y} r="2" fill="#f8fafc" opacity="0.7">
              <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="1.5;3;1.5" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`float-${i}`} 
          className="absolute rounded-full bg-blue-100/30" 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            opacity: Math.random() * 0.5 + 0.3,
            animation: `floatElement ${Math.random() * 4 + 2}s infinite ease-in-out ${Math.random() * 2}s`,
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const [showFounders, setShowFounders] = useState(false);
  
  const founders = [
    { name: "Raghava_annala", designation: "Full Stack Developer & UI UX" },
    { name: "Deekshith_nanaveni", designation: "Full Stack Developer & Backend" },
    { name: "Vikas_gaddoju", designation: "Chief Evangelist" },
    { name: "Rajkumar_kokku", designation: "Stylist & Canva Editor" },
    { name: "Anji_sapavat", designation: "Data Analyst & DB Expert" }
  ];
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <section className="pt-6 sm:pt-12 md:pt-20 pb-4 sm:pb-8 relative overflow-x-hidden w-full min-h-[100svh] flex items-center">
      {/* Inject modern animations */}
      <style dangerouslySetInnerHTML={{ __html: modernAnimations }} />
      
      {/* Modern gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"></div>
        <div className="absolute h-[40rem] w-[40rem] -top-40 -left-20 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow opacity-50"></div>
        <div className="absolute h-[30rem] w-[30rem] -bottom-20 -right-20 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow opacity-40"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMzZjNmNDYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6Ii8+PHBhdGggZD0iTTAgMGg2MHY2MEgwVjB6IiBzdHJva2U9IiMzZjNmNDYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      </div>

      <div className="container mx-auto px-2 md:px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left side - logo and CTA */}
          <div className="w-full lg:w-2/5 space-y-6 text-center lg:text-left">
            {/* Logo and Founders button row */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="relative group">
                <ModernLogo />
              </div>
              
              {/* Founders button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs backdrop-blur-sm bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200 px-4 py-1 rounded-full font-medium transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 transform hover:scale-105 group shadow-md"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    <span>Meet Our Team</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-md bg-slate-900/90 border border-blue-500/20 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent pb-1">
                      Our Team
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-3">
                    {founders.map((founder, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 border border-blue-500/20 hover:border-blue-400/30 transform hover:scale-[1.02] group"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-blue-100 group-hover:text-blue-50 transition-colors duration-300">
                            {founder.name}
                          </span>
                          <span className="text-xs text-blue-200/70">
                            {founder.designation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Brand title and tagline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                  Study Buddy
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Experience seamless collaborative learning with our 
                <span className="text-blue-300 font-medium"> AI-powered </span>
                educational platform.
              </p>
            </div>

            {/* Main explore button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="default"
                size="default"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all duration-300 relative group overflow-hidden py-6"
                onClick={() => navigate('/groups')}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></span>
                <span className="relative z-10 flex items-center">
                  <span className="mr-2">Explore Study Groups</span>
                  <ArrowRight className="h-4 w-4 animate-pulse" />
                </span>
              </Button>
            </div>

            {/* Feature buttons grid */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="default" 
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group overflow-hidden text-xs py-5"
                onClick={() => navigate('/code')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></div>
                <div className="relative z-10 flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  <span className="font-medium">CodeDiploMate</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 group overflow-hidden text-xs py-5"
                onClick={() => navigate('/codebuddy')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></div>
                <div className="relative z-10 flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="font-medium">CodeBuddy</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/5 border border-blue-500/20 text-blue-200 hover:bg-blue-500/10 hover:text-blue-100 transition-all duration-300 py-5"
                onClick={() => navigate('/study')}
              >
                <div className="relative z-10 flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Study Modules</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline" 
                className="backdrop-blur-sm bg-white/5 border border-blue-500/20 text-blue-200 hover:bg-blue-500/10 hover:text-blue-100 transition-all duration-300 py-5"
                onClick={() => navigate('/groups')}
              >
                <div className="relative z-10 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Join Groups</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline"
                className="backdrop-blur-sm bg-white/5 border border-blue-500/20 text-blue-200 hover:bg-blue-500/10 hover:text-blue-100 transition-all duration-300 py-5"
                onClick={() => navigate('/games')}
              >
                <div className="relative z-10 flex items-center">
                  <Gamepad className="mr-2 h-4 w-4" />
                  <span>Coding Games</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group overflow-hidden text-xs py-5"
                onClick={() => navigate('/resume')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out"></div>
                <div className="relative z-10 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="font-medium">ResumeBuddy</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Right side - Feature dashboard */}
          <div className="w-full lg:w-3/5 mt-8 lg:mt-0">
            <div className="relative">
              {/* Main card */}
              <div className="relative backdrop-blur-sm bg-white/5 p-5 sm:p-6 rounded-xl border border-blue-500/20 shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                {/* Card header */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-1 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                      AI-Powered Learning Dashboard
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Everything you need to accelerate your learning journey
                  </p>
                </div>
                
                {/* Feature grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Feature card 1 */}
                  <div className="bg-white/5 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:bg-white/10 group">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="ml-3 font-semibold text-blue-100 group-hover:text-white transition-colors duration-300">AI Tutor "Buddy"</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Personalized AI assistant that adapts to your learning style and generates custom quizzes.
                    </p>
                  </div>
                  
                  {/* Feature card 2 */}
                  <div className="bg-white/5 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:bg-white/10 group">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                        <Code className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="ml-3 font-semibold text-blue-100 group-hover:text-white transition-colors duration-300">CodeDiploMate</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      AI-driven code analysis with time/space complexity insights and optimization recommendations.
                    </p>
                  </div>
                  
                  {/* Feature card 3 */}
                  <div className="bg-white/5 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:bg-white/10 group">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="ml-3 font-semibold text-blue-100 group-hover:text-white transition-colors duration-300">Real-time Collaboration</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Interactive study rooms with live peer suggestions, code sharing, and integrated video chat.
                    </p>
                  </div>
                  
                  {/* Feature card 4 */}
                  <div className="bg-white/5 rounded-lg p-4 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 hover:bg-white/10 group">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/20 transition-all duration-300">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="ml-3 font-semibold text-blue-100 group-hover:text-white transition-colors duration-300">ResumeBuddy</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      AI-powered ATS-friendly resume generator with job-specific optimization.
                    </p>
                  </div>
                </div>
                
                {/* Progress stats row */}
                <div className="bg-white/5 rounded-lg p-4 border border-blue-500/10 mb-6">
                  <h3 className="font-semibold text-blue-100 mb-4 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-400" />
                    Learning Progress
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Progress item 1 */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Web Development</span>
                        <span className="text-blue-300">75%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    {/* Progress item 2 */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Data Structures</span>
                        <span className="text-blue-300">60%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    
                    {/* Progress item 3 */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Machine Learning</span>
                        <span className="text-blue-300">40%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Active sessions */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                      <Rocket className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <span className="text-xs text-slate-400">Powered by</span>
                      <span className="block text-sm font-medium text-blue-300">Gemini AI</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/groups')} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs px-5 py-2 rounded-md shadow-lg transition-all duration-300 group"
                  >
                    <span className="flex items-center">
                      <Sparkles className="h-3 w-3 mr-2" />
                      <span>Start Learning</span>
                    </span>
                  </Button>
                </div>
                
              </div>
              
              {/* Accent elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-xl z-0"></div>
              <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl z-0"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
