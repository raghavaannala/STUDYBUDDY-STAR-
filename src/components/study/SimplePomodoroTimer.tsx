import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

const SimplePomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);
  
  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    return ((25 * 60 - timeLeft) / (25 * 60)) * 100;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-xl">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Pomodoro Timer
        </h3>
        
        <div className="w-full mb-6">
          <div className="relative pt-1 w-full">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <div
                style={{ width: `${calculateProgress()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="text-5xl font-bold text-center p-6 rounded-full w-48 h-48 flex items-center justify-center bg-purple-500/10 text-purple-300 border-2 border-purple-500/30">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={toggleTimer} 
            className={`w-16 h-16 rounded-full ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button 
            onClick={resetTimer} 
            variant="outline" 
            className="w-16 h-16 rounded-full"
            disabled={timeLeft === 25 * 60}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SimplePomodoroTimer;
