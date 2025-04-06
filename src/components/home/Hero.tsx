import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gamepad, BookOpen, FileText, Code, Sparkles, Brain, Rocket } from 'lucide-react';
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

// Add vibranium animation styles
const vibraniumStyles = `
  @keyframes vibraniumPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
  
  @keyframes vibraniumShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes vibraniumGlow {
    0%, 100% { filter: drop-shadow(0 0 5px rgba(147, 51, 234, 0.5)); }
    50% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.7)); }
  }
  
  @keyframes goldTextShimmer {
    0% { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes vibraniumFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(2deg); }
    50% { transform: translateY(0) rotate(0deg); }
    75% { transform: translateY(5px) rotate(-2deg); }
  }
`;

const StudyBuddyLogo = () => {
  return (
    <div className="relative w-full max-w-[180px] sm:w-60 h-auto sm:h-60 mx-auto mb-2 sm:mb-6 z-10 transform hover:scale-105 transition-transform duration-500">
      {/* Enhanced cosmic background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/40 via-pink-500/30 to-amber-500/40 blur-2xl transform scale-110 animate-pulse-slow opacity-70"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/20 via-purple-500/10 to-blue-500/20 blur-xl transform scale-105 animate-pulse-slow opacity-60" style={{ animationDelay: "1s" }}></div>
      
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        <defs>
          {/* Crisp vibrant gradient for star fill */}
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF3300' }}>
              <animate attributeName="stop-color" values="#FF3300;#FFCC00;#FFD700;#FF3300" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="25%" style={{ stopColor: '#FFCC00' }}>
              <animate attributeName="stop-color" values="#FFCC00;#FFD700;#4CC9F0;#FFCC00" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#FFD700' }}>
              <animate attributeName="stop-color" values="#FFD700;#4CC9F0;#3A0CA3;#FFD700" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="75%" style={{ stopColor: '#4CC9F0' }}>
              <animate attributeName="stop-color" values="#4CC9F0;#3A0CA3;#FF3300;#4CC9F0" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#3A0CA3' }}>
              <animate attributeName="stop-color" values="#3A0CA3;#FF3300;#FFCC00;#3A0CA3" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Vibranium border gradient */}
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9333EA' }}>
              <animate attributeName="stop-color" values="#9333EA;#FFD700;#7C3AED;#9333EA" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: '#A855F7' }}>
              <animate attributeName="stop-color" values="#A855F7;#FFD700;#9333EA;#A855F7" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: '#7C3AED' }}>
              <animate attributeName="stop-color" values="#7C3AED;#9333EA;#FFD700;#7C3AED" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Metallic gold shimmer for inner star */}
          <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,215,0,0.7)' }}>
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: 'rgba(255,223,0,1)' }}>
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: 'rgba(255,215,0,0.7)' }}>
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          {/* Enhanced crisp Glow effect */}
          <filter id="glow">
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

          {/* Golden border glow - more crisp */}
          <filter id="borderGlow">
            <feGaussianBlur stdDeviation="1.8" result="goldenBlur"/>
            <feFlood floodColor="#FFD700" floodOpacity="0.7" result="goldColor"/>
            <feComposite in="goldColor" in2="goldenBlur" operator="in" result="goldGlow"/>
            <feComponentTransfer in="goldGlow" result="brighterGold">
              <feFuncR type="linear" slope="1.3"/>
              <feFuncG type="linear" slope="1.3"/>
              <feFuncB type="linear" slope="1.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="brighterGold"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Star points glitter */}
          <filter id="glitter">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1.2" specularExponent="20" lightingColor="#FFFFFF" result="specOut">
              <fePointLight x="50" y="50" z="200"/>
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
            <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>
          
          {/* Inner star pattern */}
          <pattern id="starPattern" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="none"/>
            <path d="M0,5 L10,5" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5"/>
            <path d="M5,0 L5,10" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Cosmic background rings */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="0.5"
          opacity="0.3"
          className="animate-spin-slow"
        >
          <animate attributeName="r" values="46;48;46" dur="7s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
        </circle>
        
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#goldShimmer)"
          strokeWidth="0.7"
          opacity="0.4"
          strokeDasharray="3,2"
          transform="rotate(0 50 50)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 50 50" 
            to="360 50 50" 
            dur="15s" 
            repeatCount="indefinite"
          />
          <animate attributeName="r" values="43;45;43" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Vibranium border star with animation */}
        <path
          d="M50,2 
             L62,35 
             L96,35 
             L69,55 
             L80,88 
             L50,70 
             L20,88 
             L31,55 
             L4,35 
             L38,35 Z"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="3"
          filter="url(#borderGlow)"
          className="animate-pulse-slow"
        >
          <animate attributeName="stroke-width" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85;1;0.85" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Small inner star with gold shimmer */}
        <path
          d="M50,12 
             L58,36 
             L82,36 
             L63,50 
             L71,74 
             L50,60 
             L29,74 
             L37,50 
             L18,36 
             L42,36 Z"
          fill="url(#goldShimmer)"
          opacity="0.4"
          style={{ mixBlendMode: 'overlay' }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="-360 50 50"
            dur="30s"
            repeatCount="indefinite"
          />
        </path>

        {/* Main star shape with enhanced animation */}
        <path
          d="M50,2 
             L62,35 
             L96,35 
             L69,55 
             L80,88 
             L50,70 
             L20,88 
             L31,55 
             L4,35 
             L38,35 Z"
          fill="url(#starGradient)"
          filter="url(#glow)"
          className="animate-pulse-subtle"
        >
          <animate attributeName="opacity" values="0.92;1;0.92" dur="3s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="180s"
            repeatCount="indefinite"
          />
        </path>

        {/* Star points glitter effects */}
        <filter id="crisperGlitter">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1.5" specularExponent="30" lightingColor="#FFFFFF" result="specOut">
            <fePointLight x="50" y="50" z="150"/>
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
          <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
        </filter>
        
        <g filter="url(#crisperGlitter)">
          <circle cx="50" cy="2" r="2.8" fill="#FFEA00" opacity="1">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite" 
                   begin={(Math.random() * 2) + "s"} />
            <animate attributeName="r" values="2.2;3.5;2.2" dur="1.5s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
          </circle>
          <circle cx="96" cy="35" r="2.8" fill="#FFEA00" opacity="1">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
            <animate attributeName="r" values="2.2;3.5;2.2" dur="1.5s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
          </circle>
          <circle cx="80" cy="88" r="2.8" fill="#FFEA00" opacity="1">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
            <animate attributeName="r" values="2.2;3.5;2.2" dur="1.5s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
          </circle>
          <circle cx="20" cy="88" r="2.8" fill="#FFEA00" opacity="1">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
            <animate attributeName="r" values="2.2;3.5;2.2" dur="1.5s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
          </circle>
          <circle cx="4" cy="35" r="2.8" fill="#FFEA00" opacity="1">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
            <animate attributeName="r" values="2.2;3.5;2.2" dur="1.5s" repeatCount="indefinite"
                   begin={(Math.random() * 2) + "s"} />
          </circle>
        </g>

        {/* Gold-Purple Vibranium text gradient */}
        <linearGradient id="vibraniumTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9333EA">
            <animate attributeName="stop-color" values="#9333EA;#FFD700;#9333EA" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="33%" stopColor="#A855F7">
            <animate attributeName="stop-color" values="#A855F7;#9333EA;#FFD700;#A855F7" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="66%" stopColor="#FFD700">
            <animate attributeName="stop-color" values="#FFD700;#A855F7;#9333EA;#FFD700" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#FFC107">
            <animate attributeName="stop-color" values="#FFC107;#FFD700;#9333EA;#FFC107" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* Clean, crisp text effect with vibranium styling */}
        <filter id="crispVibraniumText">
          <feGaussianBlur stdDeviation="0.3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k1="1.5" k2="-0.5" k3="0" k4="0" result="sharp"/>
          <feFlood floodColor="#9333EA" floodOpacity="0.3" result="purpleColor"/>
          <feComposite in="purpleColor" in2="sharp" operator="in" result="purpleGlow"/>
          <feFlood floodColor="#FFD700" floodOpacity="0.3" result="goldColor"/>
          <feComposite in="goldColor" in2="sharp" operator="in" result="goldGlow"/>
          <feMerge>
            <feMergeNode in="purpleGlow"/>
            <feMergeNode in="goldGlow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Study Buddy text with white styling */}
        <g>
          <text
            x="50"
            y="44"
            textAnchor="middle"
            className="font-bold text-[16px]"
            fill="white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
            filter="url(#crispVibraniumText)"
          >
            Study
          </text>
          <text
            x="50"
            y="61"
            textAnchor="middle"
            className="font-bold text-[16px]"
            fill="white"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
            filter="url(#crispVibraniumText)"
          >
            Buddy
          </text>
        </g>
      </svg>

      {/* Outer animated sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 130 - 15}%`,
            top: `${Math.random() * 130 - 15}%`,
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
            background: i % 4 === 0 ? 'white' : i % 4 === 1 ? '#FFD700' : i % 4 === 2 ? '#9333EA' : '#FF4500',
            boxShadow: i % 4 === 0 
              ? '0 0 20px rgba(255,255,255,0.95), 0 0 40px rgba(255,255,255,0.6)' 
              : i % 4 === 1 
                ? '0 0 20px rgba(255,215,0,0.95), 0 0 40px rgba(255,215,0,0.6)'
                : i % 4 === 2
                  ? '0 0 20px rgba(147,51,234,0.95), 0 0 40px rgba(147,51,234,0.6)'
                  : '0 0 20px rgba(255,69,0,0.95), 0 0 40px rgba(255,69,0,0.6)',
            animation: `twinkle ${Math.random() * 4 + 2}s infinite ${Math.random() * 5}s ease-in-out`,
            opacity: Math.random() * 0.5 + 0.5,
            zIndex: 5,
          }}
        />
      ))}

      {/* Floating particles */}
      {[...Array(7)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            background: i % 3 === 0 ? '#9333EA' : i % 3 === 1 ? '#FFD700' : '#FF4500',
            opacity: 0.7,
            animation: `float-particle ${Math.random() * 10 + 15}s infinite linear, pulse ${Math.random() * 5 + 2}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      {/* Magical orbit path */}
      <div className="absolute inset-0 rounded-full border border-purple-500/10 opacity-50 animate-spin-slow"></div>
      <div className="absolute inset-0 rounded-full border border-amber-500/10 opacity-40" 
           style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
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
      {/* Inject vibranium animations */}
      <style dangerouslySetInnerHTML={{ __html: vibraniumStyles }} />
      
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
        {[...Array(10)].map((_, i) => (
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

      <div className="container mx-auto px-2 md:px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          {/* Left side - logo and CTA */}
          <div className="w-full lg:w-2/5 space-y-4 text-center lg:text-left">
            {/* Logo and Founders button row */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="relative group transform hover:-rotate-6 transition-transform duration-300">
                <StudyBuddyLogo />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Founders button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 text-purple-300 hover:text-purple-200 px-4 py-1 rounded-full font-medium transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-105 group shadow-lg hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)]"
                  >
                    <Users className="h-3 w-3 mr-1 animate-pulse" />
                    <span>Meet Our Founders</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-md bg-slate-900/90 border-2 border-purple-500/30 max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent pb-1">
                      Our Founders
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-3">
                    {founders.map((founder, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-indigo-600/10 hover:from-purple-500/20 hover:to-indigo-600/20 transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 transform hover:scale-[1.02] group shadow-lg hover:shadow-purple-500/20"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg border border-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-purple-200 group-hover:text-purple-100 transition-colors duration-300">
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
            
            {/* Brand title and tagline */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-shimmer-slow"></div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  <span className="inline-block text-white mr-2">Study</span>
                  <span className="inline-block text-yellow-400">Buddy</span>
                </h1>
              </div>
              
              <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0 leading-relaxed animate-fade-in-up">
                Experience seamless collaborative learning and knowledge sharing 
                through our <span className="text-purple-300 font-medium">AI-powered</span> platform.
              </p>
            </div>

            {/* Main explore button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
              <Button
                variant="default"
                size="default"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-bold text-xs sm:text-sm shadow-[0_8px_30px_rgb(147,51,234,0.3)] hover:shadow-[0_8px_25px_rgb(147,51,234,0.5)] transition-all duration-300 relative group overflow-hidden border border-purple-400/50 py-4"
                onClick={() => navigate('/groups')}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></span>
                <span className="relative z-10 flex items-center">
                  <span className="text-white group-hover:text-white/90">
                    ✨ Explore Our Study Groups ✨
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

            {/* Feature buttons grid */}
            <div className="grid grid-cols-2 gap-1.5 animate-fade-in-up animation-delay-500">
              <Button 
                size="default" 
                className="backdrop-blur-sm bg-gradient-to-br from-orange-500 to-purple-600 hover:from-orange-400 hover:to-purple-500 text-white border border-orange-400/30 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_25px_rgba(249,115,22,0.5)] transform hover:translate-y-[-2px] transition-all duration-300 group overflow-hidden text-xs py-3"
                onClick={() => navigate('/code')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-md"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-white/20 to-orange-500/0 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <div className="relative z-10 flex items-center">
                  <Code className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">CodeDiploMate</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                className="backdrop-blur-sm bg-gradient-to-br from-amber-400 to-purple-600 hover:from-amber-300 hover:to-purple-500 text-white border border-amber-400/30 shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_8px_25px_rgba(217,119,6,0.5)] transform hover:translate-y-[-2px] transition-all duration-300 group overflow-hidden text-xs py-3"
                onClick={() => navigate('/codebuddy')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-md"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-white/20 to-amber-400/0 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <div className="relative z-10 flex items-center">
                  <Code className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">CodeBuddy</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline" 
                className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300"
                onClick={() => navigate('/study')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
                <div className="relative z-10 flex items-center">
                  <BookOpen className="mr-1 h-3 w-3" />
                  <span>Study Modules</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline" 
                className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300"
                onClick={() => navigate('/groups')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
                <div className="relative z-10 flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  <span>Join Groups</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline"
                className="backdrop-blur-sm bg-slate-800/40 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.2)] transform hover:translate-y-[-2px] transition-all duration-300 group"
                onClick={() => navigate('/games')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
                <div className="relative z-10 flex items-center">
                  <Gamepad className="mr-1 h-3 w-3" />
                  <span>Coding Games</span>
                </div>
              </Button>
              
              <Button 
                size="default" 
                variant="outline"
                className="backdrop-blur-sm bg-gradient-to-br from-purple-600/20 to-indigo-700/20 border border-purple-500/30 text-purple-200 hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-indigo-600/30 hover:text-purple-100 shadow-[0_4px_20px_rgba(147,51,234,0.2)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.3)] transform hover:translate-y-[-3px] transition-all duration-300 group animate-pulse-subtle"
                onClick={() => navigate('/resume')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
                <div className="relative z-10 flex items-center">
                  <FileText className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                  <span className="relative">
                    <span className="group-hover:animate-pulse">ResumeBuddy</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {/* Right side - Feature description with vibranium card styling */}
          <div className="w-full lg:w-3/5 mt-6 lg:mt-0 animate-fade-in-up animation-delay-200">
            <div className="relative group">
              {/* Vibranium metallic card effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 via-blue-500 to-indigo-700 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
              
              {/* Vibranium pulsing edge */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6B23FF] via-[#A78BFA] to-[#6B23FF] rounded-lg blur-md opacity-20 group-hover:opacity-30 transition-all duration-1000 animate-pulse-slow"></div>
              
              {/* Vibranium card glows on hover */}
              <div className="relative backdrop-blur-sm bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-3 sm:p-4 rounded-xl border border-purple-500/40 transform hover:translate-y-[-2px] transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.1)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.4)] overflow-hidden">
                
                {/* Vibranium hexagon pattern overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NiIgaGVpZ2h0PSI4NiI+CjxyZWN0IHdpZHRoPSI4NiIgaGVpZ2h0PSI4NiIgZmlsbD0iIzEyMTIxMiIvPgo8cGF0aCBkPSJNNDMgMzcgTDM3IDQzIEw0MyA0OSBMNDkgNDMgWiIgc3Ryb2tlPSIjMzMzIiBmaWxsPSJub25lIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] opacity-20"></div>
                
                {/* Vibranium metallic shine effect */}
                <div className="absolute top-0 left-0 right-0 h-full w-1/4 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-600%] transition-all duration-1500 ease-in-out"></div>
                
                <div className="relative prose prose-invert max-w-none z-10">
                  <h3 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-yellow-200 to-indigo-300 mb-2">
                    AI-Powered Collaborative Learning Platform
                  </h3>
                  <p className="text-xs text-slate-300 mb-2 sm:mb-3 leading-relaxed">
                    Study Buddy is a cutting-edge AI-powered collaborative learning platform integrated with Gemini for state-of-the-art tutoring.
                    Developed by Team Xenon with a focus on personalizing your educational journey through advanced AI technology.
                  </p>

                  <p className="text-xs text-slate-300 mb-3 sm:mb-4 leading-relaxed">
                    Our platform revolutionizes education by providing intelligent assistance that adapts to your learning style and automatically generates coding challenges based on your comprehension level.
                  </p>

                  {/* Vibranium feature card with animated gold text */}
                  <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm border border-purple-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-slate-800/0 to-indigo-500/5 rounded-lg"></div>
                    
                    {/* Vibranium-style tip box with flashy gold text */}
                    <div className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 p-8 rounded-full blur-2xl opacity-70 animate-pulse-slow"></div>
                    
                    {/* Shimmering vibranium border */}
                    <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-clip-border" style={{ 
                      background: 'linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.3) 50%, rgba(251,191,36,0) 100%)',
                      backgroundSize: '200% auto',
                      animation: 'goldTextShimmer 3s linear infinite'
                    }}></div>
                    
                    <h4 className="text-xs font-semibold mb-1 text-yellow-400">
                      <span className="relative inline-block">
                        <span className="group-hover:animate-pulse flex items-center">
                          <Sparkles className="h-4 w-4 inline-block mr-1 text-amber-300" />
                          <span className="text-yellow-400">OUR FEATURES</span>
                        </span>
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 opacity-50"></span>
                      </span>
                    </h4>
                    
                    <ul className="space-y-0.5 sm:space-y-1 text-xs text-slate-300 list-none ml-0 pl-0">
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Brain className="h-3 w-3 inline-block mr-1" /> AI Tutor "Buddy":
                          </strong> Adaptive learning assistant with auto-quiz generation
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Gamepad className="h-3 w-3 inline-block mr-1" /> Auto-Quiz System:
                          </strong> Automatically generates coding challenges when you understand a concept
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Code className="h-3 w-3 inline-block mr-1" /> CodeDiploMate:
                          </strong> AI-driven code analysis, debugging, and optimization with time/space complexity insights
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Code className="h-3 w-3 inline-block mr-1" /> CodeBuddy:
                          </strong> Interactive code platform for solving algorithmic challenges with real-time feedback
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Users className="h-3 w-3 inline-block mr-1" /> Real-time Collaboration:
                          </strong> Interactive study rooms with peer suggestions and code sharing
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Users className="h-3 w-3 inline-block mr-1" /> Private Groups:
                          </strong> Create exclusive invite-only study groups for focused collaboration
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <Sparkles className="h-3 w-3 inline-block mr-1" /> Smart Code Assistant:
                          </strong> AI-powered code completion and error detection
                        </span>
                      </li>
                      <li className="flex items-start hover:translate-x-1 transition-transform duration-300">
                        <span className="inline-flex mr-1 mt-1 text-amber-400 text-[10px]" style={{ animation: 'vibraniumGlow 2s ease-in-out infinite' }}>⬢</span>
                        <span className="text-[11px]">
                          <strong className="text-amber-300" style={{ 
                            background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'goldTextShimmer 2s linear infinite'
                          }}>
                            <FileText className="h-3 w-3 inline-block mr-1" /> ResumeBuddy:
                          </strong> AI-powered ATS-friendly resume generator with job-specific optimization
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center" style={{ animation: 'vibraniumFloat 4s ease-in-out infinite' }}>
                        <Rocket className="h-4 w-4 text-white" />
                      </div>
                      <span className="ml-2 text-xs text-slate-300">Powered by <span style={{ 
                        background: 'linear-gradient(90deg, #FFD700, #FFC107, #FFD700)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundSize: '200% auto',
                        animation: 'goldTextShimmer 2s linear infinite'
                      }}>Gemini AI</span></span>
                    </div>
                    <div>
                      <Button 
                        size="sm"
                        onClick={() => navigate('/groups')} 
                        className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs px-4 py-1 rounded-full shadow-lg hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden group"
                      >
                        {/* Vibranium button glow effect */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-300/0 via-amber-300/30 to-amber-300/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-all duration-1000 ease-in-out z-0"></span>
                        
                        {/* Vibranium pulse border */}
                        <span className="absolute inset-0 rounded-full border border-amber-400/30 z-0" style={{ 
                          animation: 'vibraniumPulse 2s ease-in-out infinite',
                          boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
                        }}></span>
                        
                        <span className="relative z-10 flex items-center font-medium">
                          <Sparkles className="h-3 w-3 mr-1" style={{ animation: 'vibraniumFloat 2s ease-in-out infinite' }} />
                          <span className="text-xs">Start Learning</span>
                        </span>
                      </Button>
                    </div>
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
