import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎨', '🎭'];

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('memoryGameBestScore');
    return saved ? parseInt(saved) : Infinity;
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
  };

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstId].isMatched = true;
          newCards[secondId].isMatched = true;
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);

          // Check if game is complete
          if (newCards.every(card => card.isMatched)) {
            handleGameComplete();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstId].isFlipped = false;
          newCards[secondId].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const handleGameComplete = () => {
    if (moves < bestScore) {
      setBestScore(moves);
      localStorage.setItem('memoryGameBestScore', moves.toString());
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: "Congratulations! 🎉",
      description: `You completed the game in ${moves} moves!${moves < bestScore ? ' New best score!' : ''}`,
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          Memory Game
        </h2>
        <div className="flex justify-center gap-4 text-sm">
          <span>Moves: {moves}</span>
          <span>Best Score: {bestScore === Infinity ? '-' : bestScore}</span>
        </div>
        <Button
          onClick={initializeGame}
          className="mt-2 btn-hover"
        >
          New Game
        </Button>
      </motion.div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-square"
            >
              <div
                className={`w-full h-full cursor-pointer transition-transform duration-500 transform-gpu ${
                  card.isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className={`w-full h-full flex items-center justify-center text-3xl rounded-lg ${
                    card.isMatched
                      ? 'bg-primary/20'
                      : card.isFlipped
                      ? 'bg-primary'
                      : 'bg-secondary'
                  } ${card.isMatched ? 'cursor-default' : 'hover:bg-primary/80'}`}
                >
                  {card.isFlipped || card.isMatched ? card.value : '?'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoryGame; 