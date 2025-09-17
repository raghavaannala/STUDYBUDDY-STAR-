import React from 'react';
import { Code, BookOpen, Users, UserPlus, Gamepad, FileText } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';
import FadeIn from '../animations/FadeIn';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Code className="h-7 w-7" />,
    title: 'Smart Code Assistant',
    description: 'Intelligent code completion, debugging, and explanation powered by Gemini.',
    link: '/code',
    delay: 0.1
  },
  {
    icon: <Code className="h-7 w-7 text-indigo-400" />,
    title: 'CodeBuddy',
    description: 'Practice competitive coding problems, join contests, and improve your algorithmic skills.',
    link: '/codebuddy',
    delay: 0.15
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: 'Interactive Study Modules',
    description: 'AI-generated quizzes, notes, and summaries to enhance your learning experience.',
    delay: 0.2
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Study Groups',
    description: 'Join or create study groups to learn together and share resources.',
    link: '/groups',
    delay: 0.3
  },
  {
    icon: <UserPlus className="h-6 w-6 text-primary" />,
    title: 'Real-time Collaboration',
    description: 'Collaborate with peers in real-time using our interactive study rooms.',
    link: '/collaborate',
    delay: 0.4
  },
  {
    icon: <Gamepad className="h-6 w-6 text-primary" />,
    title: 'Coding Games',
    description: 'Learn through play with our interactive coding games and challenges designed to build your skills.',
    link: '/games',
    delay: 0.5
  },
  
];

const Features = () => {
  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <FadeIn>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Key Features</h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl mx-auto">
              StudyBuddy combines powerful AI capabilities with intuitive design to enhance your learning journey.
            </p>
          </FadeIn>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={feature.delay} direction="up">
              {feature.link ? (
                <Link to={feature.link} className="block h-full">
                  <GlassMorphCard className="h-full p-2.5 sm:p-3" hoverEffect>
                    <div className="flex flex-col h-full">
                      <div className="rounded-full bg-primary/10 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center mb-2 sm:mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="text-sm sm:text-base font-medium mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-xs flex-grow">{feature.description}</p>
                    </div>
                  </GlassMorphCard>
                </Link>
              ) : (
                <GlassMorphCard className="h-full p-2.5 sm:p-3" hoverEffect>
                  <div className="flex flex-col h-full">
                    <div className="rounded-full bg-primary/10 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center mb-2 sm:mb-3">
                      {feature.icon}
                    </div>
                    <h3 className="text-sm sm:text-base font-medium mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-xs flex-grow">{feature.description}</p>
                  </div>
                </GlassMorphCard>
              )}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
