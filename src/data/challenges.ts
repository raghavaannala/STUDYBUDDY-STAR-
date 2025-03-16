export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  timeLimit: number;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  hints: string[];
}

export const challenges: Challenge[] = [
  {
    id: 'array-reverse',
    title: 'Array Reversal',
    description: `Create a function that reverses an array without using the built-in reverse() method.
    
Your task is to implement the solution() function that takes an array as input and returns the reversed array.

Example:
Input: [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]`,
    difficulty: 'Easy',
    timeLimit: 600, // 10 minutes
    starterCode: `function solution(arr) {
  // Write your code here
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]' },
      { input: '["a", "b", "c"]', expectedOutput: '["c", "b", "a"]' },
      { input: '[1]', expectedOutput: '[1]' },
      { input: '[]', expectedOutput: '[]' }
    ],
    hints: [
      'Try using a loop that swaps elements from the start and end',
      'You can use a temporary variable to help with swapping',
      'Only loop through half of the array to avoid re-reversing it'
    ]
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    description: `Create a function that checks if a string is a palindrome.
    
A palindrome is a word, phrase, number, or other sequence that reads the same forward and backward, ignoring spaces, punctuation, and capitalization.

Example:
Input: "A man a plan a canal Panama"
Output: true

Your function should:
1. Ignore spaces, punctuation, and capitalization
2. Return true if the string is a palindrome, false otherwise`,
    difficulty: 'Easy',
    timeLimit: 600,
    starterCode: `function solution(str) {
  // Write your code here
  
}`,
    testCases: [
      { input: '"A man a plan a canal Panama"', expectedOutput: 'true' },
      { input: '"race a car"', expectedOutput: 'false' },
      { input: '"Was it a car or a cat I saw?"', expectedOutput: 'true' },
      { input: '"hello"', expectedOutput: 'false' },
      { input: '""', expectedOutput: 'true' }
    ],
    hints: [
      'Remove all non-alphanumeric characters and convert to lowercase first',
      'You can use regular expressions to clean the string',
      'Compare characters from both ends moving inward'
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search Implementation',
    description: `Implement a binary search algorithm.
    
Binary search is an efficient algorithm for searching a sorted array by repeatedly dividing the search interval in half.

Your task is to implement the solution() function that takes a sorted array and a target value as input and returns the index of the target if found, or -1 if not found.

Example:
Input: ([1, 2, 3, 4, 5], 3)
Output: 2`,
    difficulty: 'Medium',
    timeLimit: 900, // 15 minutes
    starterCode: `function solution(arr, target) {
  // Write your code here
  
}`,
    testCases: [
      { input: '[1, 2, 3, 4, 5], 3', expectedOutput: '2' },
      { input: '[1, 2, 3, 4, 5], 6', expectedOutput: '-1' },
      { input: '[1], 1', expectedOutput: '0' },
      { input: '[], 5', expectedOutput: '-1' },
      { input: '[1, 3, 5, 7, 9, 11, 13, 15], 7', expectedOutput: '3' }
    ],
    hints: [
      'Start with two pointers: left at the start and right at the end',
      'Calculate the middle point and compare with the target',
      'If the middle element is the target, return its index',
      'If the target is greater, search the right half; if smaller, search the left half'
    ]
  }
];

export const getChallenge = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
}; 