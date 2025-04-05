"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users } from 'lucide-react';

export default function HomePage() {
  const [showFounders, setShowFounders] = useState(false);

  const founders = [
    { id: 1, name: 'Raghava' },
    { id: 2, name: 'Deekshit' },
    { id: 3, name: 'Vikas' },
    { id: 4, name: 'Rajkumar' },
    { id: 5, name: 'Anji' }
  ];

  return (
    <main className="min-h-screen bg-zinc-900">
      <div className="container mx-auto p-4">
        <div className="bg-orange-500/10 rounded-lg px-4 py-2 inline-block mb-8">
          <p className="text-orange-500">Powered by Gemini</p>
        </div>

        <div>
          <h1 className="text-8xl font-bold inline-flex items-center gap-8">
            <div>
              <span className="block text-white">Study</span>
              <span className="block italic text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                Buddy
              </span>
            </div>
            
            <button
              onClick={() => setShowFounders(true)}
              className="bg-orange-500/20 border-2 border-orange-500 px-6 py-3 rounded-xl 
                       hover:bg-orange-500/30 transition-all hover:scale-105 group
                       flex flex-col items-center justify-center"
            >
              <Users className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-2xl italic text-orange-500 whitespace-nowrap">
                Meet Our Founders
              </span>
            </button>
          </h1>
        </div>

        <p className="text-2xl text-gray-400 mb-6 max-w-2xl mt-8">
          Experience seamless collaborative learning and knowledge sharing through Study Buddy.
        </p>

        <p className="text-xl text-gray-500 mb-12 max-w-2xl">
          Solve problems, analyze code, and clarify doubts with our Code Genie - powered by Gemini's advanced AI capabilities.
        </p>

        <div className="flex gap-4">
          <a
            href="/code-genie"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Try CodeDiploMate →
          </a>
          
          <a
            href="/code-buddy"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Practice LeetCode →
          </a>
          
          <a
            href="/modules"
            className="bg-zinc-800 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-zinc-700 transition-colors"
          >
            Study Modules
          </a>
        </div>

        <Dialog open={showFounders} onOpenChange={setShowFounders}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Our Founders
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {founders.map((founder) => (
                <div 
                  key={founder.id}
                  className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <p className="text-lg text-white">
                    {founder.id}. {founder.name}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
} 