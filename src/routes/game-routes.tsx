import React from 'react';
import { Route } from 'react-router-dom';
import Games from '@/pages/Games';
import CodingChallenge from '@/components/games/CodingChallenge';
import Quiz from '@/components/games/Quiz';
import AlgorithmRace from '@/components/games/AlgorithmRace';
import { getChallenge } from '@/data/challenges';
import { getQuiz } from '@/data/quizzes';
import { getRace } from '@/data/races';

export const gameRoutes = [
  <Route key="games" path="/games" element={<Games />} />,
  <Route 
    key="challenge" 
    path="/games/challenges/:challengeId" 
    element={
      <div className="container mx-auto px-4 py-8">
        <CodingChallenge 
          challenge={getChallenge('array-reverse')!}
          onComplete={(score) => console.log('Challenge completed with score:', score)}
        />
      </div>
    }
  />,
  <Route 
    key="quiz" 
    path="/games/quizzes/:quizId" 
    element={
      <div className="container mx-auto px-4 py-8">
        <Quiz 
          quiz={getQuiz('javascript-fundamentals')!}
          onComplete={(score) => console.log('Quiz completed with score:', score)}
        />
      </div>
    }
  />,
  <Route 
    key="algorithm-race" 
    path="/games/algorithm-race/:raceId" 
    element={
      <div className="container mx-auto px-4 py-8">
        <AlgorithmRace 
          race={getRace('sorting-race')!}
          onComplete={(position, time) => console.log('Race completed:', { position, time })}
        />
      </div>
    }
  />
]; 