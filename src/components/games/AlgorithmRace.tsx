import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import CodeEditor from '../code/CodeEditor';
import { Timer, Users, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Competitor {
  id: string;
  name: string;
  progress: number;
  isComplete: boolean;
  timeElapsed: number;
}

interface AlgorithmChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  timeLimit: number;
}

const sampleChallenge: AlgorithmChallenge = {
  id: '1',
  title: 'Quick Sort Implementation',
  description: 'Implement the Quick Sort algorithm to sort an array of numbers in ascending order.',
  difficulty: 'medium',
  initialCode: `function quickSort(arr) {
  // Your implementation here
  return arr;
}`,
  testCases: [
    { input: '[5, 2, 8, 1, 9]', expectedOutput: '[1, 2, 5, 8, 9]' },
    { input: '[-1, 0, -5, 2, 3]', expectedOutput: '[-5, -1, 0, 2, 3]' },
  ],
  timeLimit: 600,
};

const mockCompetitors: Competitor[] = [
  { id: '1', name: 'AlgoNinja', progress: 0, isComplete: false, timeElapsed: 0 },
  { id: '2', name: 'CodeMaster', progress: 0, isComplete: false, timeElapsed: 0 },
  { id: '3', name: 'ByteWizard', progress: 0, isComplete: false, timeElapsed: 0 },
];

const AlgorithmRace = () => {
  const [challenge, setChallenge] = useState<AlgorithmChallenge>(sampleChallenge);
  const [code, setCode] = useState(challenge.initialCode);
  const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors);
  const [isRacing, setIsRacing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRacing && !isComplete) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        updateCompetitors();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRacing, isComplete]);

  const updateCompetitors = () => {
    setCompetitors(prev => prev.map(competitor => {
      if (competitor.isComplete) return competitor;
      
      const progressIncrement = Math.random() * 5;
      const newProgress = Math.min(100, competitor.progress + progressIncrement);
      const isNowComplete = newProgress >= 100;
      
      return {
        ...competitor,
        progress: newProgress,
        isComplete: isNowComplete,
        timeElapsed: isNowComplete ? timeElapsed : competitor.timeElapsed,
      };
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRace = () => {
    setIsRacing(true);
    toast({
      title: "Race Started! 🏁",
      description: "Complete the algorithm challenge before your competitors!",
    });
  };

  const submitSolution = () => {
    // In a real implementation, this would test the code
    const success = Math.random() > 0.3; // Simulated success rate
    
    if (success) {
      setIsComplete(true);
      setIsRacing(false);
      
      const rank = competitors.filter(c => c.isComplete).length + 1;
      
      if (rank === 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      toast({
        title: "Solution Accepted! 🎉",
        description: `You finished in ${rank}${getRankSuffix(rank)} place!`,
      });
    } else {
      toast({
        title: "Tests Failed",
        description: "Your solution didn't pass all test cases. Try again!",
        variant: "destructive",
      });
    }
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const resetRace = () => {
    setCode(challenge.initialCode);
    setCompetitors(mockCompetitors);
    setIsRacing(false);
    setTimeElapsed(0);
    setUserProgress(0);
    setIsComplete(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {challenge.title}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-0.5 rounded ${
              challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
              challenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {formatTime(timeElapsed)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {competitors.length + 1} Competitors
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetRace}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Race
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-invert max-w-none"
      >
        <p>{challenge.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeEditor
            code={code}
            setCode={setCode}
            language="javascript"
          />
          
          <div className="mt-4 flex justify-end space-x-2">
            {!isRacing ? (
              <Button
                onClick={startRace}
                className="bg-gradient-to-r from-primary to-orange-500"
              >
                Start Race
              </Button>
            ) : (
              <Button
                onClick={submitSolution}
                className="bg-gradient-to-r from-primary to-orange-500"
                disabled={isComplete}
              >
                Submit Solution
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Race Progress
            </h3>
            
            <div className="space-y-4">
              {/* User's progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>You</span>
                  <span>{isComplete ? formatTime(timeElapsed) : 'In Progress'}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: isComplete ? '100%' : `${userProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Competitors' progress */}
              {competitors.map((competitor) => (
                <div key={competitor.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{competitor.name}</span>
                    <span>
                      {competitor.isComplete 
                        ? formatTime(competitor.timeElapsed)
                        : 'In Progress'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <motion.div
                      className="bg-primary/50 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${competitor.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Test Cases</h3>
            <div className="space-y-2">
              {challenge.testCases.map((testCase, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium">Input:</p>
                  <pre className="bg-black/90 p-2 rounded text-xs mb-1">
                    {testCase.input}
                  </pre>
                  <p className="font-medium">Expected Output:</p>
                  <pre className="bg-black/90 p-2 rounded text-xs">
                    {testCase.expectedOutput}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmRace; 