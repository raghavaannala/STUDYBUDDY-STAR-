import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import FadeIn from '@/components/animations/FadeIn';
import { Check, RefreshCcw, Lightning } from 'lucide-react';

interface CodeBlock {
  id: string;
  content: string;
  isCorrect?: boolean;
}

const puzzles = [
  {
    id: 'puzzle1',
    title: 'Array Map Function',
    description: 'Arrange the code blocks to create a proper array map function',
    blocks: [
      { id: 'block1', content: 'const numbers = [1, 2, 3, 4, 5];' },
      { id: 'block2', content: 'const doubled = numbers.map(' },
      { id: 'block3', content: '(num) => {' },
      { id: 'block4', content: '  return num * 2;' },
      { id: 'block5', content: '});' },
    ],
    solution: ['block1', 'block2', 'block3', 'block4', 'block5']
  },
  // Add more puzzles here
];

const CodePuzzleMasters = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    loadPuzzle(currentPuzzle);
  }, [currentPuzzle]);

  const loadPuzzle = (index: number) => {
    const shuffledBlocks = [...puzzles[index].blocks]
      .sort(() => Math.random() - 0.5)
      .map(block => ({ ...block, isCorrect: undefined }));
    setBlocks(shuffledBlocks);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
  };

  const checkSolution = () => {
    const currentSolution = puzzles[currentPuzzle].solution;
    const userSolution = blocks.map(block => block.id);
    const isCorrect = currentSolution.every((id, index) => id === userSolution[index]);

    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + Math.max(100 - attempts * 10, 10));
      toast({
        title: "Excellent!",
        description: "You solved the puzzle correctly!",
        variant: "default",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Try again! Check the order of your blocks.",
        variant: "destructive",
      });
    }

    return isCorrect;
  };

  return (
    <FadeIn>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Code Puzzle Masters</h1>
            <p className="text-muted-foreground">
              Drag and drop the code blocks in the correct order
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadPuzzle(currentPuzzle)}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {puzzles[currentPuzzle].title}
          </h2>
          <p className="text-muted-foreground mb-4">
            {puzzles[currentPuzzle].description}
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="code-blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {blocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 bg-background border rounded-md cursor-move
                            ${block.isCorrect === true ? 'border-green-500' : ''}
                            ${block.isCorrect === false ? 'border-red-500' : ''}`}
                        >
                          <code>{block.content}</code>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-between">
          <Button
            variant="default"
            onClick={checkSolution}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Check Solution
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPuzzle((prev) => 
              (prev + 1) % puzzles.length
            )}
            className="flex items-center gap-2"
          >
            <Lightning className="h-4 w-4" />
            Next Puzzle
          </Button>
        </div>
      </div>
    </FadeIn>
  );
};

export default CodePuzzleMasters; 