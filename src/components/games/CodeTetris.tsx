import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCw, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const TETROMINOES = [
  {
    shape: [[1, 1, 1, 1]], // I
    color: '#FF6B6B',
    name: 'array'
  },
  {
    shape: [[1, 1], [1, 1]], // O
    color: '#4ECDC4',
    name: 'object'
  },
  {
    shape: [[0, 1, 0], [1, 1, 1]], // T
    color: '#45B7D1',
    name: 'function'
  },
  {
    shape: [[1, 0], [1, 0], [1, 1]], // L
    color: '#96CEB4',
    name: 'loop'
  }
];

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

const CodeTetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const createNewPiece = useCallback(() => {
    const randomPiece = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    return {
      shape: randomPiece.shape,
      color: randomPiece.color,
      name: randomPiece.name,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(randomPiece.shape[0].length / 2),
      y: 0
    };
  }, []);

  const checkCollision = useCallback((piece, board, offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePieceToBoard = useCallback((piece, board) => {
    const newBoard = board.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = { value: 1, color: piece.color };
          }
        }
      });
    });
    return newBoard;
  }, []);

  const clearLines = useCallback((board) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isLineFull = row.every(cell => cell && cell.value);
      if (isLineFull) linesCleared++;
      return !isLineFull;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const movePiece = useCallback((direction) => {
    if (!currentPiece || !isPlaying || gameOver) return;

    const offsetX = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const offsetY = direction === 'down' ? 1 : 0;

    if (!checkCollision(currentPiece, board, offsetX, offsetY)) {
      setCurrentPiece(prev => ({
        ...prev,
        x: prev.x + offsetX,
        y: prev.y + offsetY
      }));
    } else if (direction === 'down') {
      const newBoard = mergePieceToBoard(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + (linesCleared * 100));
      
      const newPiece = createNewPiece();
      if (checkCollision(newPiece, clearedBoard)) {
        setGameOver(true);
        setIsPlaying(false);
      } else {
        setCurrentPiece(newPiece);
      }
    }
  }, [currentPiece, board, isPlaying, gameOver, checkCollision, mergePieceToBoard, clearLines, createNewPiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || !isPlaying || gameOver) return;

    const rotated = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
      )
    };

    if (!checkCollision(rotated, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, board, isPlaying, gameOver, checkCollision]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(createNewPiece());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      movePiece('down');
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, movePiece]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left');
          break;
        case 'ArrowRight':
          movePiece('right');
          break;
        case 'ArrowDown':
          movePiece('down');
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, movePiece, rotatePiece]);

  const renderCell = (cell, x, y) => {
    // Check if current piece occupies this cell
    let isCurrent = false;
    let currentColor = null;
    
    if (currentPiece) {
      const pieceX = x - currentPiece.x;
      const pieceY = y - currentPiece.y;
      
      if (
        pieceY >= 0 &&
        pieceY < currentPiece.shape.length &&
        pieceX >= 0 &&
        pieceX < currentPiece.shape[0].length
      ) {
        isCurrent = currentPiece.shape[pieceY][pieceX] === 1;
        if (isCurrent) currentColor = currentPiece.color;
      }
    }

    return (
      <motion.div
        key={`${x}-${y}`}
        className="rounded-sm"
        initial={false}
        animate={{
          backgroundColor: isCurrent ? currentColor : 
                          cell ? cell.color : 
                          'rgba(88, 28, 135, 0.1)',
          scale: (isCurrent || cell) ? 1 : 0.95
        }}
        transition={{ duration: 0.2 }}
      />
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Code Tetris
          </h2>
          <p className="text-sm text-muted-foreground">
            Build your code blocks!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">Score</p>
            <p className="text-2xl font-bold text-purple-400">{score}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => isPlaying ? setIsPlaying(false) : startGame()}
            className="w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div
          className="grid gap-px bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 rounded-lg border border-purple-500/30"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${BLOCK_SIZE}px)`
          }}
        >
          {board.map((row, y) =>
            row.map((cell, x) => renderCell(cell, x, y))
          )}
        </div>

        <div className="absolute top-full mt-6 w-full flex justify-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={() => movePiece('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={() => movePiece('down')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={() => movePiece('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full"
            onClick={rotatePiece}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h3 className="text-xl font-bold text-red-400">Game Over!</h3>
          <Button onClick={startGame} variant="default">
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CodeTetris; 