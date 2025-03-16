export interface QuizQuestion {
  id: string;
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    id: 'javascript-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics, closures, and asynchronous programming.',
    timeLimit: 1200, // 20 minutes
    questions: [
      {
        id: 'js-1',
        question: 'What is the output of the following code?',
        code: `console.log(typeof typeof 1);`,
        options: [
          'number',
          'string',
          'undefined',
          'NaN'
        ],
        correctAnswer: 1,
        explanation: 'typeof 1 returns "number", and typeof "number" returns "string".'
      },
      {
        id: 'js-2',
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that has access to variables in its outer scope',
          'A way to close a browser window',
          'A method to end a loop',
          'A type of error handling'
        ],
        correctAnswer: 0,
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.'
      },
      {
        id: 'js-3',
        question: 'What will be logged to the console?',
        code: `const promise = new Promise(resolve => resolve(1));
promise.then(val => val + 2)
       .then(val => console.log(val));`,
        options: [
          '1',
          '2',
          '3',
          'undefined'
        ],
        correctAnswer: 2,
        explanation: 'The first .then() adds 2 to the resolved value (1), resulting in 3, which is then logged in the second .then().'
      }
    ]
  },
  {
    id: 'python-concepts',
    title: 'Python Concepts',
    description: 'Test your knowledge of Python data structures, comprehensions, and best practices.',
    timeLimit: 900, // 15 minutes
    questions: [
      {
        id: 'py-1',
        question: 'What is the output of this list comprehension?',
        code: `numbers = [1, 2, 3, 4, 5]
result = [x * 2 for x in numbers if x % 2 == 0]
print(result)`,
        options: [
          '[2, 4, 6, 8, 10]',
          '[4, 8]',
          '[2, 6, 10]',
          '[4]'
        ],
        correctAnswer: 1,
        explanation: 'The list comprehension filters even numbers (2, 4) and multiplies them by 2, resulting in [4, 8].'
      },
      {
        id: 'py-2',
        question: 'What is the difference between a tuple and a list in Python?',
        options: [
          'Tuples are faster than lists',
          'Lists are immutable, tuples are mutable',
          'Tuples are immutable, lists are mutable',
          'There is no difference'
        ],
        correctAnswer: 2,
        explanation: 'Tuples are immutable (cannot be changed after creation) while lists are mutable (can be modified).'
      }
    ]
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Test your knowledge of common data structures and their implementations.',
    timeLimit: 1500, // 25 minutes
    questions: [
      {
        id: 'ds-1',
        question: 'What is the time complexity of inserting an element at the beginning of an array?',
        options: [
          'O(1)',
          'O(n)',
          'O(log n)',
          'O(n²)'
        ],
        correctAnswer: 1,
        explanation: 'Inserting at the beginning of an array requires shifting all existing elements one position to the right, resulting in O(n) time complexity.'
      },
      {
        id: 'ds-2',
        question: 'Which data structure would be most efficient for implementing a cache with a "least recently used" (LRU) eviction policy?',
        options: [
          'Array',
          'Binary Search Tree',
          'Hash Map + Doubly Linked List',
          'Stack'
        ],
        correctAnswer: 2,
        explanation: 'A combination of a Hash Map and Doubly Linked List provides O(1) access time and efficient removal/insertion of elements, making it ideal for LRU cache implementation.'
      },
      {
        id: 'ds-3',
        question: 'What is the space complexity of storing a binary tree with n nodes?',
        options: [
          'O(1)',
          'O(log n)',
          'O(n)',
          'O(n²)'
        ],
        correctAnswer: 2,
        explanation: 'A binary tree with n nodes requires O(n) space to store all the nodes and their connections.'
      }
    ]
  }
];

export const getQuiz = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
}; 