import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import StudyModules from '@/components/study/StudyModules';
import CodeEditor from '@/components/study/CodeEditor';
import FadeIn from '@/components/animations/FadeIn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const Index = () => {
  const [showFounders, setShowFounders] = useState(false);

  const founders = [
    { id: 1, name: 'Raghava' },
    { id: 2, name: 'Deekshit' },
    { id: 3, name: 'Vikas' },
    { id: 4, name: 'Rajkumar' },
    { id: 5, name: 'Anji' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 relative overflow-hidden">
      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Navbar />
      
      <main className="flex-grow">
        <div className="animate-fade-in">
          <Hero />
        </div>
        
        <div className="glass mx-4 md:mx-12 my-16 rounded-2xl overflow-hidden">
          <FadeIn delay={0.2}>
            <Features />
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="px-4 py-8 md:px-8">
              <StudyModules />
            </div>
          </FadeIn>
          
          <FadeIn delay={0.6}>
            <div className="px-4 pb-12 md:px-8 floating">
              <CodeEditor />
            </div>
          </FadeIn>
        </div>
      </main>
      
      <Footer />

      <Dialog open={showFounders} onOpenChange={setShowFounders}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white mb-4">Our Founders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {founders.map((founder) => (
              <motion.div 
                key={founder.id}
                className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg text-white">
                  {founder.id}. {founder.name}
                </p>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
