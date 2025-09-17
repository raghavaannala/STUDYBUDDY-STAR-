import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none' | 'scale' | 'rotate' | 'sparkle' | 'glow';
  duration?: number;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'intense';
}

const FadeIn = ({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.4,
  className,
  intensity = 'medium'
}: FadeInProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100');
              
              switch (direction) {
                case 'up':
                  entry.target.classList.add('translate-y-0');
                  break;
                case 'down':
                  entry.target.classList.add('translate-y-0');
                  break;
                case 'left':
                  entry.target.classList.add('translate-x-0');
                  break;
                case 'right':
                  entry.target.classList.add('translate-x-0');
                  break;
                case 'scale':
                  entry.target.classList.add('scale-100');
                  break;
                case 'rotate':
                  entry.target.classList.add('rotate-0');
                  break;
                case 'sparkle':
                  entry.target.classList.add('animate-sparkle');
                  if (sparklesRef.current) {
                    sparklesRef.current.classList.add('opacity-100');
                  }
                  break;
                case 'glow':
                  entry.target.classList.add('animate-glow');
                  break;
                default:
                  break;
              }
            }, delay * 1000);
            
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay, direction]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translate-y-10';
      case 'down': return '-translate-y-10';
      case 'left': return 'translate-x-10';
      case 'right': return '-translate-x-10';
      case 'scale': return 'scale-50';
      case 'rotate': return 'rotate-180';
      default: return '';
    }
  };

  const getIntensityClasses = () => {
    switch (intensity) {
      case 'subtle':
        return 'hover:scale-102 hover:brightness-105';
      case 'medium':
        return 'hover:scale-105 hover:brightness-110';
      case 'intense':
        return 'hover:scale-110 hover:brightness-125';
      default:
        return '';
    }
  };

  // Add these styles to your global CSS
  const styles = `
    @keyframes sparkle {
      0%, 100% { background-position: 50% 50%; }
      50% { background-position: 100% 100%; }
    }

    @keyframes glow {
      0%, 100% { filter: brightness(100%) drop-shadow(0 0 0 rgba(255,255,255,0)); }
      50% { filter: brightness(125%) drop-shadow(0 0 10px rgba(255,255,255,0.5)); }
    }

    .animate-sparkle {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.2) 25%,
        rgba(255,255,255,0.2) 75%,
        rgba(255,255,255,0) 100%
      );
      background-size: 200% auto;
      animation: sparkle 2s linear infinite;
    }

    .animate-glow {
      animation: glow 2s ease-in-out infinite;
    }

    .magical-border {
      position: relative;
    }

    .magical-border::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000);
      background-size: 400% 400%;
      animation: border-rotate 3s linear infinite;
      border-radius: inherit;
      z-index: -1;
    }

    @keyframes border-rotate {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        ref={ref}
        className={cn(
          'opacity-0 transition-all relative',
          getInitialTransform(),
          getIntensityClasses(),
          direction === 'sparkle' && 'overflow-hidden',
          direction === 'glow' && 'magical-border',
          className
        )}
        style={{ 
          transitionDuration: `${duration}s`,
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {direction === 'sparkle' && (
          <div
            ref={sparklesRef}
            className="absolute inset-0 opacity-0 transition-opacity"
            style={{ transitionDuration: `${duration}s` }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `sparkle ${1 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
        {children}
      </div>
    </>
  );
};

export default FadeIn;
