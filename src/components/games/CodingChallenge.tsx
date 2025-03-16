import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import CodeEditor from '../code/CodeEditor';
import { Check, Timer, RefreshCw } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  initialCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  hints: string[];
}

const sampleChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Array Sum',
    description: 'Write a function that calculates the sum of all numbers in an array.',
    difficulty: 'easy',
    timeLimit: 300,
    initialCode: 'function arraySum(numbers) {\n  // Your code here\n}',
    testCases: [
      { input: '[1, 2, 3, 4, 5]', expectedOutput: '15' },
      { input: '[-1, 0, 1]', expectedOutput: '0' },
    ],
    hints: [
      'Consider using the reduce method',
      'Remember to handle empty arrays',
    ],
  },
  {
    id: '2',
    title: 'String Reversal',
    description: 'Write a function that reverses a string without using the built-in reverse method.',
    difficulty: 'easy',
    timeLimit: 300,
    initialCode: 'function reverseString(str) {\n  // Your code here\n}',
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"world"', expectedOutput: '"dlrow"' },
    ],
    hints: [
      'Try using a for loop starting from the end',
      'You can also use array methods',
    ],
  },
];

const CodingChallenge = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(sampleChallenges[0]);
  const [code, setCode] = useState(currentChallenge.initialCode);
  const [timeLeft, setTimeLeft] = useState(currentChallenge.timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string }[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleTimeUp = () => {
    setIsRunning(false);
    toast({
      title: "Time's up!",
      description: "Don't worry, you can try again!",
      variant: "destructive",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const runTests = () => {
    try {
      // In a real implementation, this would run the code against test cases
      // Here we're just simulating test results
      const results = currentChallenge.testCases.map(test => ({
        passed: Math.random() > 0.5,
        output: 'Test output would go here',
      }));
      
      setTestResults(results);
      
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        toast({
          title: "Success! 🎉",
          description: "All test cases passed!",
        });
      } else {
        toast({
          title: "Some tests failed",
          description: "Check the test results and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while running tests",
        variant: "destructive",
      });
    }
  };

  const resetChallenge = () => {
    setCode(currentChallenge.initialCode);
    setTimeLeft(currentChallenge.timeLimit);
    setIsRunning(false);
    setTestResults([]);
    setShowHints(false);
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
            {currentChallenge.title}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded ${
              currentChallenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
              currentChallenge.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {currentChallenge.difficulty.charAt(0).toUpperCase() + currentChallenge.difficulty.slice(1)}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetChallenge}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose prose-invert max-w-none"
      >
        <p>{currentChallenge.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeEditor
            code={code}
            setCode={setCode}
            language="javascript"
            className="min-h-[400px]"
          />
          
          <div className="mt-4 flex justify-between">
            <Button
              onClick={() => setShowHints(!showHints)}
              variant="outline"
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </Button>
            
            <div className="space-x-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant="outline"
              >
                {isRunning ? 'Pause Timer' : 'Start Timer'}
              </Button>
              
              <Button
                onClick={runTests}
                className="bg-gradient-to-r from-primary to-orange-500"
              >
                Run Tests
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {showHints && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-4 rounded-lg"
            >
              <h3 className="text-lg font-medium mb-2">Hints</h3>
              <ul className="space-y-2">
                {currentChallenge.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {hint}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="glass p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Test Results</h3>
            {testResults.length > 0 ? (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      result.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      <code>{result.output}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run your code to see test results
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge; 