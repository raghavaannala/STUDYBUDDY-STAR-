import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import FadeIn from '@/components/animations/FadeIn';
import { Timer, Play, Square, Trophy } from 'lucide-react';
import { Editor } from '@monaco-editor/react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  testCases: Array<{
    input: any[];
    expected: any;
  }>;
  timeLimit: number;
}

const challenges: Challenge[] = [
  {
    id: 'sum-array',
    title: 'Optimize Array Sum',
    description: 'Optimize the function to calculate the sum of an array efficiently',
    initialCode: `function sumArray(arr) {
  // Your optimized code here
  return arr.reduce((sum, num) => sum + num, 0);
}`,
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 15 },
      { input: [[10, 20, 30]], expected: 60 },
    ],
    timeLimit: 30
  },
  // Add more challenges
];

const AlgorithmRace = () => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [code, setCode] = useState(challenges[0].initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenges[0].timeLimit);
  const [results, setResults] = useState<Array<{ passed: boolean; time: number }>>([]);

  const runTests = useCallback(() => {
    try {
      const fn = new Function('return ' + code)();
      const testResults = challenges[currentChallenge].testCases.map(test => {
        const start = performance.now();
        const result = fn(...test.input);
        const end = performance.now();
        return {
          passed: result === test.expected,
          time: end - start
        };
      });
      setResults(testResults);

      const allPassed = testResults.every(r => r.passed);
      if (allPassed) {
        toast({
          title: "Success!",
          description: "All test cases passed successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Tests Failed",
          description: "Some test cases did not pass. Try optimizing your solution.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error running your code: " + error,
        variant: "destructive",
      });
    }
  }, [code, currentChallenge]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      runTests();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, runTests]);

  const handleStart = () => {
    setIsRunning(true);
    setTimeLeft(challenges[currentChallenge].timeLimit);
    setResults([]);
  };

  const handleStop = () => {
    setIsRunning(false);
    runTests();
  };

  return (
    <FadeIn>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Algorithm Race</h1>
            <p className="text-muted-foreground">
              Optimize your code before time runs out!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span className="text-2xl font-mono">
                {timeLeft}s
              </span>
            </div>
            {!isRunning ? (
              <Button onClick={handleStart}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-2">
                {challenges[currentChallenge].title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {challenges[currentChallenge].description}
              </p>
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Test Cases:</h3>
                {challenges[currentChallenge].testCases.map((test, index) => (
                  <div key={index} className="text-sm font-mono">
                    Input: {JSON.stringify(test.input)}
                    <br />
                    Expected: {JSON.stringify(test.expected)}
                  </div>
                ))}
              </div>
            </div>

            {results.length > 0 && (
              <div className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Results</h3>
                {results.map((result, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Test Case {index + 1}</span>
                      <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Execution time: {result.time.toFixed(2)}ms
                    </div>
                    <Progress value={Math.min(100, (result.time / 1) * 100)} className="mt-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <Editor
              height="600px"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                readOnly: isRunning,
              }}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default AlgorithmRace; 