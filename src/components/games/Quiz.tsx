import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { Timer, ChevronRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  text: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

const sampleQuiz: QuizData = {
  id: '1',
  title: 'JavaScript Fundamentals',
  description: 'Test your knowledge of JavaScript basics, including variables, functions, and scope.',
  timeLimit: 600,
  questions: [
    {
      id: '1',
      text: 'What is the output of the following code?',
      code: `console.log(typeof typeof 1);`,
      options: [
        'number',
        'string',
        'undefined',
        'object'
      ],
      correctAnswer: 1,
      explanation: 'typeof 1 returns "number", and typeof "number" returns "string".'
    },
    {
      id: '2',
      text: 'Which of the following is a closure?',
      code: `function outer() {
  let x = 10;
  return function() {
    return x;
  }
}`,
      options: [
        'A function that returns undefined',
        'A function that has access to variables in its outer scope',
        'A function that takes no parameters',
        'A function that returns another function'
      ],
      correctAnswer: 1,
      explanation: 'A closure is a function that has access to variables in its outer scope, even after the outer function has returned.'
    }
  ]
};

const Quiz = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizData>(sampleQuiz);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentQuiz.timeLimit);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isComplete) handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Correct! 🎉",
        description: currentQuestion.explanation,
      });
    } else {
      toast({
        title: "Incorrect",
        description: currentQuestion.explanation,
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    const finalScore = (score / currentQuiz.questions.length) * 100;
    
    if (finalScore > 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    toast({
      title: "Quiz Complete! 🎓",
      description: `You scored ${finalScore}%!`,
    });
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(currentQuiz.timeLimit);
    setIsComplete(false);
  };

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {currentQuiz.title}
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </span>
            <span>
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </span>
            <span className="text-primary">
              Score: {score}/{currentQuiz.questions.length}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetQuiz}
          className="flex items-center gap-2"
        >
          Reset Quiz
        </Button>
      </motion.div>

      {!isComplete ? (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
            
            {currentQuestion.code && (
              <pre className="bg-black/90 p-4 rounded-lg mb-4 overflow-x-auto">
                <code className="text-sm text-white">{currentQuestion.code}</code>
              </pre>
            )}

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`w-full p-4 rounded-lg text-left transition-colors ${
                    selectedAnswer === null
                      ? 'hover:bg-primary/20'
                      : selectedAnswer === index
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-red-500/20 border-red-500'
                      : index === currentQuestion.correctAnswer && isAnswered
                      ? 'bg-green-500/20 border-green-500'
                      : 'opacity-50'
                  } ${
                    selectedAnswer === index ? 'border-2' : 'border border-transparent'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-primary to-orange-500"
                >
                  {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Complete Quiz
                      <Award className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-6 rounded-lg text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Quiz Complete! 🎓</h3>
          <p className="text-lg mb-6">
            You scored {(score / currentQuiz.questions.length) * 100}%
          </p>
          <Button
            onClick={resetQuiz}
            className="bg-gradient-to-r from-primary to-orange-500"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz; 