'use client';

import React from 'react';
import CodeBuddy from '@/components/CodeBuddy';

export default function CodeBuddyPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4 flex items-center">
          <span className="text-orange-500 mr-2">LeetCode</span> Practice Environment
        </h1>

        <div className="bg-gray-800 rounded-lg p-6">
          <CodeBuddy />
        </div>
      </div>
    </main>
  );
} 