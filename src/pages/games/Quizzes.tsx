import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/card';

export default function Quizzes() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-20 pl-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Coding Quizzes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">JavaScript Fundamentals</h2>
              <p className="text-muted-foreground mb-4">
                Test your JavaScript knowledge with interactive quizzes.
              </p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                Start Quiz
              </button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 