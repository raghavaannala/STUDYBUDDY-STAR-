import React from 'react';
import { Card } from '@/components/ui/card';

const SimpleStudyAnalytics = () => {
  // Demo data for total study hours
  const totalStudyHours = 42;
  const sessionsCompleted = 24;
  const averageSessionLength = 25;

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-xl">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Study Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Total Study Time</h4>
            <p className="text-2xl font-bold text-white">{totalStudyHours} hours</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Focus Sessions</h4>
            <p className="text-2xl font-bold text-white">{sessionsCompleted}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Avg. Session Length</h4>
            <p className="text-2xl font-bold text-white">{averageSessionLength} min</p>
          </div>
        </div>
        
        <div className="bg-gray-800/20 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
            <div className="text-2xl font-bold text-purple-300">75%</div>
          </div>
          <h4 className="text-gray-300 font-medium mb-1">Weekly Goal Progress</h4>
          <p className="text-sm text-gray-400">6 hours completed of 8 hour goal</p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700/50 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
            <h4 className="text-sm text-gray-300 mb-2">Most Productive Day</h4>
            <p className="text-xl font-medium text-white">Wednesday</p>
            <p className="text-sm text-gray-400">3.5 hours</p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
            <h4 className="text-sm text-gray-300 mb-2">Top Subject</h4>
            <p className="text-xl font-medium text-white">Programming</p>
            <p className="text-sm text-gray-400">15 hours total</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimpleStudyAnalytics;
