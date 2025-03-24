import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad, BookOpen, FileText } from 'lucide-react';
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

const StudyBuddyLogo = () => {
  return (
    <div className="relative w-full max-w-[200px] sm:w-64 h-auto sm:h-64 mx-auto mb-4 sm:mb-8">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          {/* Enhanced Rainbow gradient for star */}
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF4500' }}>
              <animate attributeName="stop-color" values="#FF4500;#FFA500;#FFD700;#FF4500" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="25%" style={{ stopColor: '#FFA500' }}>
              <animate attributeName="stop-color" values="#FFA500;#FFD700;#00CED1;#FFA500" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#FFD700' }}>
              <animate attributeName="stop-color" values="#FFD700;#00CED1;#4169E1;#FFD700" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="75%" style={{ stopColor: '#00CED1' }}>
              <animate attributeName="stop-color" values="#00CED1;#4169E1;#FF4500;#00CED1" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#4169E1' }}>
              <animate attributeName="stop-color" values="#4169E1;#FF4500;#FFA500;#4169E1" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Enhanced Purple border gradient with animation */}
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9333EA' }}>
              <animate attributeName="stop-color" values="#9333EA;#A855F7;#7C3AED;#9333EA" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#A855F7' }}>
              <animate attributeName="stop-color" values="#A855F7;#7C3AED;#9333EA;#A855F7" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#7C3AED' }}>
              <animate attributeName="stop-color" values="#7C3AED;#9333EA;#A855F7;#7C3AED" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Enhanced Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Enhanced Purple border glow */}
          <filter id="borderGlow">
            <feGaussianBlur stdDeviation="2" result="purpleBlur"/>
            <feMerge>
              <feMergeNode in="purpleBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Add rotation animation */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
        </defs>

        {/* Animated background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="1"
          opacity="0.3"
          className="animate-spin-slow"
        >
          <animate
            attributeName="r"
            values="43;45;43"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Purple border star with animation */}
        <path
          d="M50,5 
             L61,35 
             L93,35 
             L67,55 
             L77,85 
             L50,68 
             L23,85 
             L33,55 
             L7,35 
             L39,35 Z"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="2.5"
          filter="url(#borderGlow)"
          className="animate-pulse-slow"
        >
          <animate
            attributeName="stroke-width"
            values="2.5;3;2.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Original star shape with enhanced animation */}
        <path
          d="M50,5 
             L61,35 
             L93,35 
             L67,55 
             L77,85 
             L50,68 
             L23,85 
             L33,55 
             L7,35 
             L39,35 Z"
          fill="url(#starGradient)"
          filter="url(#glow)"
          className="animate-pulse-subtle"
        >
          <animate
            attributeName="opacity"
            values="0.9;1;0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Study Buddy text with enhanced styling */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          className="font-bold text-[16px]"
          fill="white"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          Study
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          className="font-bold text-[16px]"
          fill="white"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          Buddy
        </text>
      </svg>

      {/* Enhanced sparkle effects */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 0 12px rgba(147, 51, 234, 0.8), 0 0 20px rgba(255, 255, 255, 0.9)',
          }}
        />
      ))}

      {/* Add floating particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.6,
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
    { name: "Rajkumar_kokku", designation: "CSS Stylist & Canva Editor" },
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
    <section className="pt-16 sm:pt-24 md:pt-32 pb-8 sm:pb-16 relative overflow-hidden w-full min-h-screen flex items-center">
      {/* Animated background gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-purple-800/20" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/5 via-transparent to-transparent transform translate-x-[calc(var(--mouse-x,0.5)*-30px)] translate-y-[calc(var(--mouse-y,0.5)*-30px)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent transform translate-x-[calc(var(--mouse-x,0.5)*30px)] translate-y-[calc(var(--mouse-y,0.5)*30px)]"></div>
        <div className="absolute h-[40rem] w-[40rem] -top-40 -left-20 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow opacity-50"></div>
        <div className="absolute h-[30rem] w-[30rem] -bottom-20 -right-20 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow opacity-40"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={`float-${i}`} 
            className="absolute rounded-full bg-white/20" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="container flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 px-4 md:px-8 relative z-10">
        {/* Left side - logo and CTA */}
        <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6 text-center lg:text-left">
          {/* Star logo with founders button */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div className="relative group transform hover:-rotate-6 transition-transform duration-300">
              <StudyBuddyLogo />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Founders button moved here */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs sm:text-sm backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 text-purple-300 hover:text-purple-200 px-6 sm:px-8 py-2 rounded-full font-medium transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 group shadow-lg hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)]"
                >
                  <Users className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Meet Our Founders</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-md bg-slate-900/90 border-2 border-purple-500/30 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-2">
                    Our Founders
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {founders.map((founder, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-indigo-600/10 hover:from-purple-500/20 hover:to-indigo-600/20 transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-[1.02] group shadow-lg hover:shadow-purple-500/20"
                    >
                      <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg border border-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-base sm:text-lg text-purple-200 group-hover:text-purple-100 transition-colors duration-300">
                          {founder.name}
                        </span>
                        <span className="text-xs text-purple-300/80">
                          {founder.designation}
                        </span>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-purple-400">✨</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Text branding with enhanced animation */}
          <div className="mt-4 sm:mt-6 relative overflow-hidden rounded-lg p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-shimmer-slow"></div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="inline-block text-white mr-2">Study</span>
              <span className="inline-block text-yellow-400">Buddy</span>
            </h1>
          </div>

          {/* Call to action with enhanced styling */}
          <p className="text-base sm:text-lg text-slate-300 max-w-lg mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed animate-fade-in-up">
            Experience seamless collaborative learning and knowledge sharing 
            through our <span className="text-purple-300 font-medium">AI-powered</span> platform.
          </p>

          {/* Main explore button with improved animation */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-bold text-sm sm:text-lg shadow-[0_8px_30px_rgb(147,51,234,0.3)] hover:shadow-[0_8px_25px_rgb(147,51,234,0.5)] transition-all duration-300 relative group overflow-hidden border border-purple-400/50 py-6"
              onClick={() => navigate('/groups')}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></span>
              <span className="relative z-10 flex items-center">
                <span className="text-white group-hover:text-white/90">
                  ✨ Explore StudyBuddy ✨
                </span>
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform text-white group-hover:text-white/90">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-bounce"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/30 to-purple-600/0 group-hover:translate-x-full transition-transform duration-500 -z-10"></div>
            </Button>
          </div>

          {/* Feature buttons with glass morphism and improved styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 animate-fade-in-up animation-delay-500">
            <Button 
              size="lg" 
              className="backdrop-blur-sm bg-gradient-to-br from-purple-600/90 to-indigo-700/90 hover:from-purple-500 hover:to-indigo-600 text-white border border-purple-400/30 shadow-[0_4px_20px_rgba(147,51,234,0.2)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.4)] transform hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => navigate('/code')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
              <div className="relative z-10 flex items-center">
                <span className="mr-2">👨‍💻</span>
                <span>Try CodeDiploMate</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
            
            <Button 
              size="lg" 
              className="backdrop-blur-sm bg-gradient-to-br from-purple-600/90 to-indigo-700/90 hover:from-purple-500 hover:to-indigo-600 text-white border border-purple-400/30 shadow-[0_4px_20px_rgba(147,51,234,0.2)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.4)] transform hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => navigate('/resume')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
              <div className="relative z-10 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>BuddyResume Builder</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => navigate('/study')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
              <div className="relative z-10 flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Study Modules</span>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => navigate('/groups')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
              <div className="relative z-10 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Join Study Groups</span>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300"
              onClick={() => navigate('/games')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
              <div className="relative z-10 flex items-center">
                <Gamepad className="mr-2 h-4 w-4" />
                <span>Coding Games</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Right side - Feature description with enhanced card styling */}
        <div className="w-full lg:w-1/2 mt-8 lg:mt-0 animate-fade-in-up animation-delay-200">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
            <div className="relative backdrop-blur-sm bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-5 sm:p-7 rounded-xl border border-purple-500/20 transform hover:translate-y-[-2px] transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.1)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.2)]">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-xl"></div>
              <div className="relative prose prose-invert max-w-none z-10">
                <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-3">AI-Powered Learning Platform</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-3 sm:mb-4 leading-relaxed">
                  Study Buddy is an AI-powered collaborative learning platform integrated with Gemini.
                  Developed by Team Xenon with a focus on enhancing your educational journey.
                </p>

                <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-5 leading-relaxed">
                  Our platform enhances education by providing intelligent assistance and collaborative tools that adapt to your learning style.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm border border-purple-500/10">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">Key Features</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-none ml-0 pl-0">
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">CodeDiploMate:</strong> AI-driven code analysis and optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">BuddyResume:</strong> AI-powered resume builder with ATS optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">Time/Space Analysis:</strong> Advanced complexity evaluation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">Study Modules:</strong> Interactive learning resources</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">Collaborative Features:</strong> Study groups, real-time sessions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 text-purple-400">▹</span>
                      <span><strong className="text-purple-200">Gamified Learning:</strong> Coding challenges and quizzes</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="ml-2 text-xs text-slate-300">Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Gemini AI</span></span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Team Xenon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
