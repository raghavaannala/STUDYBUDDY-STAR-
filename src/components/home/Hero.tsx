import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad } from 'lucide-react';
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
    <div className="relative w-64 h-64 mb-8">
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
    { name: "Raghava" },
    { name: "Deekshith" },
    { name: "Rajkumar" },
    { name: "Anji" }
  ];
  
  return (
    <section className="pt-32 pb-16 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn delay={0.1} direction="left">
            <div className="space-y-4 p-6 rounded-xl vibranium-card">
              <StudyBuddyLogo />
              
              {/* Move Founders Dialog here and enhance it */}
              <div className="flex -mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 text-purple-300 hover:text-purple-200 px-8 py-3 rounded-full font-medium transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 group shadow-lg hover:shadow-purple-500/20"
                    >
                      <Users className="h-5 w-5 mr-2 animate-pulse" />
                      <span className="text-base">
                        Meet Our Founders
                      </span>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/0 via-purple-400/10 to-purple-600/0 group-hover:translate-x-full transition-transform duration-1000 -z-10"></div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="vibranium-card border-2 border-purple-500/30 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-2">
                        Our Founders
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {founders.map((founder, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 border-2 border-purple-500/30 hover:border-purple-400/50 transform hover:scale-[1.02] group"
                        >
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg border-2 border-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                            {founder.name[0]}
                          </div>
                          <span className="font-medium text-lg text-purple-200 group-hover:text-purple-100 transition-colors duration-300">
                            {founder.name}
                          </span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-purple-400">✨</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex mt-2">
                <span className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-xs font-medium vibranium-border border-2 border-purple-500/30">
                  Powered by Gemini
                </span>
              </div>
              <div className="relative">
                <div className="flex items-center gap-4 p-4 rounded-lg vibranium-border border-2 border-purple-500/20">
                  <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-5xl font-extrabold tracking-tight">
                    <span className="inline-block">
                      <span className="inline-block animate-pulse-subtle vibranium-text">S</span>
                      <span className="inline-block animate-pulse-subtle delay-85 vibranium-text">t</span>
                      <span className="inline-block animate-pulse-subtle delay-100 vibranium-text">u</span>
                      <span className="inline-block animate-pulse-subtle delay-150 vibranium-text">d</span>
                      <span className="inline-block animate-pulse-subtle delay-200 vibranium-text">y</span>
                    </span>
                    <span className="inline-block relative ml-2">
                      <span className="relative z-10" style={{
                        background: 'linear-gradient(to right, #FFD700, #FFA500)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                      }}>
                        Buddy
                      </span>
                      <span className="absolute -bottom-2 left-2 right-0 h-3 bg-gradient-to-r from-amber-500/40 to-amber-500/0 blur-sm"></span>
                    </span>
                    <div className="flex items-center gap-4 mt-8">
                      <Button
                        variant="default"
                        size="lg"
                        className="ml-4 bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-300 relative group overflow-hidden border-2 border-orange-400/50"
                        onClick={() => navigate('/groups')}
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="text-white group-hover:text-white/90">
                            🪄 Click here for Magic 🔮
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
                              className="animate-pulse"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-400/30 to-orange-600/0 group-hover:translate-x-full transition-transform duration-500 -z-10"></div>
                      </Button>
                    </div>
                  </h1>
                </div>
                
                {/* Enhanced glow effects */}
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse opacity-50"></div>
              </div>
              <div className="space-y-6 p-4 rounded-lg vibranium-border border-2 border-purple-500/20">
                <p className="text-xl text-purple-200/80 leading-relaxed">
                  Experience seamless collaborative learning and knowledge sharing through Study Buddy.
                </p>
                <p className="text-lg text-purple-200/70 leading-relaxed">
                  Solve problems, analyze code, and clarify doubts with our Code Genie - powered by Gemini's advanced AI capabilities.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 p-4 rounded-lg vibranium-border border-2 border-purple-500/20">
                <Button size="lg" className="vibranium-button border-2 border-purple-500/30" onClick={() => navigate('/code')}>
                  Try CodeDiploMate👨‍💻🚀
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="vibranium-button border-2 border-purple-500/30" onClick={() => navigate('/study')}>
                  Study Modules
                </Button>
              </div>
              <div className="flex gap-4 pt-2 p-4 rounded-lg vibranium-border border-2 border-purple-500/20">
                <Button size="lg" variant="outline" className="vibranium-button border-2 border-purple-500/30" onClick={() => navigate('/groups')}>
                  <Users className="mr-2 h-4 w-4" />
                  Join Study Groups
                </Button>
                <Button size="lg" className="vibranium-button border-2 border-purple-500/30" onClick={() => navigate('/games')}>
                  <Gamepad className="mr-2 h-4 w-4" />
                  Coding Games
                </Button>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3} direction="right">
            <div className="relative w-full h-[400px] flex items-center justify-center">
              <div className="absolute w-[300px] h-[300px] bg-purple-500/20 rounded-full filter blur-3xl -z-10 animate-float" />
              
              <GlassMorphCard className="w-full max-w-md mx-auto transform rotate-1 vibranium-card border-2 border-purple-500/30">
                <div className="p-2 bg-purple-950/90 rounded-lg code-block border border-purple-500/20">
                  <pre className="text-xs md:text-sm text-purple-100">
                    <code>{`    
  Study Buddy is an AI-powered collaborative 
  learning platform integrated with Gemini AI, 
  Developed by Team Xenon. 
  
  
  It enhances education by providing: 
  
  
- CodeDiploMate: AI-driven code analysis, optimization
- Time/space complexity evaluation.  
- Study Modules: Interactive learning resources
- Problem-solving assistance.  
- Collaborative Features: Study groups, discussions
- Real-time AI assistance.  
- Gamified Learning: Coding challenges
- AI-generated quizzes.  

..With a vibrant UI and seamless AI integration
..Study Buddy revolutionizes knowledge-sharing and problem-solving. 🚀
`}</code>
                  </pre>
                </div>
                <div className="mt-4 flex justify-between items-center p-4 border-t-2 border-purple-500/20">
                  <div>
                    <p className="text-sm font-medium vibranium-text">Time Complexity Analysis</p>
                    <p className="text-xs text-purple-300">Original: O(2^n) → Optimized: O(n)</p>
                  </div>
                  <Button size="sm" variant="outline" className="vibranium-button border-2 border-purple-500/30" onClick={() => navigate('/code')}>Try It</Button>
                </div>
              </GlassMorphCard>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Add background effects with border */}
      <div className="absolute inset-0 -z-10 border-t-2 border-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-purple-800/20" />
        <div className="absolute inset-0 bg-grid-purple/20" />
      </div>
    </section>
  );
};

export default Hero;
