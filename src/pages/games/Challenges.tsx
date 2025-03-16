import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { GlassMorphCard } from '@/components/ui/glass-morph-card';

export default function Challenges() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Code Challenges</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassMorphCard className="p-6">
              <h2 className="text-xl font-semibold mb-3">Algorithm Challenge</h2>
              <p className="text-muted-foreground mb-4">
                Solve algorithmic problems and improve your problem-solving skills.
              </p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Start Challenge
              </button>
            </GlassMorphCard>
          </div>
        </div>
      </main>
    </div>
  );
} 