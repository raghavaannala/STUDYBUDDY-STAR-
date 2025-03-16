export interface AlgorithmRace {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  competitors: {
    id: string;
    name: string;
    progress: number;
    isReady: boolean;
  }[];
}

export const races: AlgorithmRace[] = [
  {
    id: 'sorting-race',
    title: 'Sorting Algorithm Race',
    description: `Implement a sorting algorithm to sort an array of numbers in ascending order.
    
Your task is to implement the solution() function that takes an array of numbers and returns the sorted array.
You can use any sorting algorithm of your choice, but consider the time complexity!

Example:
Input: [5, 2, 8, 1, 9]
Output: [1, 2, 5, 8, 9]`,
    difficulty: 'Medium',
    timeLimit: 900, // 15 minutes
    starterCode: `function solution(arr) {
  // Write your sorting algorithm here
  
}`,
    testCases: [
      { input: '[5, 2, 8, 1, 9]', expectedOutput: '[1, 2, 5, 8, 9]' },
      { input: '[3, 3, 1, 2, 2]', expectedOutput: '[1, 2, 2, 3, 3]' },
      { input: '[10, 5, 0, -5, -10]', expectedOutput: '[-10, -5, 0, 5, 10]' },
      { input: '[1]', expectedOutput: '[1]' },
      { input: '[]', expectedOutput: '[]' }
    ],
    competitors: [
      { id: 'bot1', name: 'AlgoMaster', progress: 0, isReady: true },
      { id: 'bot2', name: 'CodeNinja', progress: 0, isReady: true },
      { id: 'bot3', name: 'ByteWizard', progress: 0, isReady: true }
    ]
  },
  {
    id: 'fibonacci-race',
    title: 'Fibonacci Race',
    description: `Implement an efficient solution to calculate the nth Fibonacci number.
    
The Fibonacci sequence is defined as: F(n) = F(n-1) + F(n-2), with F(0) = 0 and F(1) = 1.
Your solution should be optimized for larger values of n.

Example:
Input: 5
Output: 5 (The sequence is: 0, 1, 1, 2, 3, 5)`,
    difficulty: 'Hard',
    timeLimit: 1200, // 20 minutes
    starterCode: `function solution(n) {
  // Write your Fibonacci implementation here
  
}`,
    testCases: [
      { input: '5', expectedOutput: '5' },
      { input: '10', expectedOutput: '55' },
      { input: '0', expectedOutput: '0' },
      { input: '1', expectedOutput: '1' },
      { input: '15', expectedOutput: '610' }
    ],
    competitors: [
      { id: 'bot1', name: 'AlgoMaster', progress: 0, isReady: true },
      { id: 'bot2', name: 'CodeNinja', progress: 0, isReady: true },
      { id: 'bot3', name: 'ByteWizard', progress: 0, isReady: true },
      { id: 'bot4', name: 'DataDragon', progress: 0, isReady: true }
    ]
  },
  {
    id: 'anagram-race',
    title: 'Anagram Detection Race',
    description: `Implement a function to determine if two strings are anagrams of each other.
    
Two strings are anagrams if they contain the same characters with the same frequencies, ignoring spaces and case.

Example:
Input: "listen", "silent"
Output: true`,
    difficulty: 'Medium',
    timeLimit: 600, // 10 minutes
    starterCode: `function solution(str1, str2) {
  // Write your anagram detection code here
  
}`,
    testCases: [
      { input: '"listen", "silent"', expectedOutput: 'true' },
      { input: '"hello", "world"', expectedOutput: 'false' },
      { input: '"debit card", "bad credit"', expectedOutput: 'true' },
      { input: '"", ""', expectedOutput: 'true' },
      { input: '"a", "b"', expectedOutput: 'false' }
    ],
    competitors: [
      { id: 'bot1', name: 'AlgoMaster', progress: 0, isReady: true },
      { id: 'bot2', name: 'CodeNinja', progress: 0, isReady: true },
      { id: 'bot3', name: 'ByteWizard', progress: 0, isReady: true }
    ]
  }
];

export const getRace = (id: string): AlgorithmRace | undefined => {
  return races.find(race => race.id === id);
}; 