import { db } from "@/config/firebase";
import { collection, getDocs, doc, getDoc, query, where, addDoc, updateDoc } from "firebase/firestore";
import { nanoid } from 'nanoid';

export interface TestCase {
  input: string;
  output: string;
  explanation: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  source: string;
  testCases: TestCase[];
  acceptanceRate: number;
  submissions: number;
  tags: string[];
  constraints?: string;
  examples?: TestCase[];
  sampleSolution?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  timeLimit?: number; // in milliseconds
  memoryLimit?: number; // in MB
}

export interface ContestInfo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  registered?: boolean;
  participants: number;
  problems: number;
}

export interface UserSubmission {
  id?: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';
  submittedAt?: Date;
  executionTime?: number; // in milliseconds
  memoryUsed?: number; // in KB
}

export interface UserPerformance {
  userId: string;
  problemsSolved: number;
  totalAttempts: number;
  streak: number;
  lastActive: Date;
  averageTime: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  badges: UserBadge[];
  ratingsByTag: Record<string, number>;
  recentSubmissions: UserSubmission[];
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
  category: 'Achievement' | 'Streak' | 'Contest' | 'Skill';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface ChallengeSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  problemIds: string[];
  currentProblemIndex: number;
  completed: boolean;
  score: number;
  performance: {
    averageTimePerProblem: number;
    problemsAttempted: number;
    problemsSolved: number;
    streakMaintained: boolean;
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePicture?: string;
  score: number;
  problemsSolved: number;
  rank: number;
  country?: string;
  badge?: string;
}

export interface TestResults {
  success: boolean;
  results: {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    time?: string;
  }[];
  stats?: {
    totalTests: number;
    passedTests: number;
    executionTime: number;
    memoryUsed: number;
  };
}

export interface UserSolvedProblem {
  problemId: string;
  solution: string;
  language: string;
  solvedAt: Date;
  executionTime: string;
}

const defaultExplanation = 'Test case for problem validation';

export const mockProblems: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    source: 'LeetCode',
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    acceptanceRate: 75,
    submissions: 1000,
    tags: ['Array', 'Hash Table']
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    source: 'LeetCode',
    testCases: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      }
    ],
    acceptanceRate: 80,
    submissions: 1200,
    tags: ['Math']
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    source: 'LeetCode',
    testCases: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    acceptanceRate: 70,
    submissions: 900,
    tags: ['String', 'Sliding Window', 'Hash Table']
  },
  {
    id: 'add-two-numbers',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.',
    source: 'LeetCode',
    testCases: [
      {
        input: 'l1 = [2,4,3], l2 = [5,6,4]',
        output: '[7,0,8]',
        explanation: '342 + 465 = 807'
      },
      {
        input: 'l1 = [0], l2 = [0]',
        output: '[0]',
        explanation: '0 + 0 = 0'
      }
    ],
    acceptanceRate: 65,
    submissions: 800,
    tags: ['Linked List', 'Math']
  },
  {
    id: 'median-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    source: 'LeetCode',
    testCases: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.0',
        explanation: 'Merged array = [1,2,3] and median is 2.'
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.5',
        explanation: 'Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5'
      }
    ],
    acceptanceRate: 45,
    submissions: 500,
    tags: ['Array', 'Binary Search', 'Divide and Conquer']
  },
  {
    id: "1",
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    source: "LeetCode",
    tags: ["Math"],
    testCases: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      }
    ],
    acceptanceRate: 52.3,
    submissions: 9842
  },
  {
    id: "3",
    title: "Valid Parentheses",
    difficulty: "Medium",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    source: "LeetCode",
    tags: ["Stack", "String"],
    testCases: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "The parentheses are properly matched."
      },
      {
        input: "s = \"()[]{}\"",
        output: "true",
        explanation: "All brackets are properly matched and closed in the correct order."
      },
      {
        input: "s = \"(]\"",
        output: "false",
        explanation: "The brackets are not properly matched - a closing square bracket cannot match an opening parenthesis."
      }
    ],
    acceptanceRate: 39.8,
    submissions: 11568
  },
  {
    id: "4",
    title: "Stock Buy Sell to Maximize Profit",
    difficulty: "Medium",
    description: "Given an array of prices, find the maximum profit by buying and selling on different days.",
    source: "CodeChef",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "In this case, no transaction is done, i.e., max profit = 0."
      }
    ],
    acceptanceRate: 43.6,
    submissions: 8754
  },
  {
    id: "5",
    title: "Merge K Sorted Arrays",
    difficulty: "Hard",
    description: "Given K sorted arrays, merge them into a single sorted array.",
    source: "CodeForces",
    tags: ["Heap", "Divide and Conquer"],
    testCases: [
      {
        input: "arrays = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "Merging all arrays in sorted order results in [1,1,2,3,4,4,5,6]."
      },
      {
        input: "arrays = [[]]",
        output: "[]",
        explanation: "An empty array results in an empty merged array."
      }
    ],
    acceptanceRate: 31.2,
    submissions: 6324
  },
  // New problems
  {
    id: "6",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    source: "LeetCode",
    tags: ["String", "Sliding Window", "Hash Table"],
    testCases: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      },
      {
        input: "s = \"bbbbb\"",
        output: "1",
        explanation: "The answer is \"b\", with the length of 1."
      },
      {
        input: "s = \"pwwkew\"",
        output: "3",
        explanation: "The answer is \"wke\", with the length of 3."
      }
    ],
    acceptanceRate: 47.1,
    submissions: 7432
  },
  {
    id: "7",
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    source: "LeetCode",
    tags: ["Linked List", "Recursion"],
    testCases: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The linked list is reversed from [1->2->3->4->5] to [5->4->3->2->1]."
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "The linked list is reversed from [1->2] to [2->1]."
      },
      {
        input: "head = []",
        output: "[]",
        explanation: "An empty linked list remains empty when reversed."
      }
    ],
    acceptanceRate: 54.3,
    submissions: 9876
  },
  {
    id: "8",
    title: "Minimum Sum Partition",
    difficulty: "Hard",
    description: "Given an array, partition it into two sets such that the absolute difference between their sums is minimum.",
    source: "CodeChef",
    tags: ["Dynamic Programming", "Array", "Math"],
    testCases: [
      {
        input: "arr = [1, 6, 11, 5]",
        output: "1",
        explanation: "Subset1 = {1, 5, 6}, sum = 12. Subset2 = {11}, sum = 11. |12-11| = 1."
      },
      {
        input: "arr = [3, 1, 4, 2, 2, 1]",
        output: "1",
        explanation: "Various partitions possible: {3,1,2,1} and {4,2} have difference 1."
      }
    ],
    acceptanceRate: 35.8,
    submissions: 5421
  },
  {
    id: "9",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    source: "LeetCode",
    tags: ["Tree", "BFS", "Binary Tree"],
    testCases: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "The binary tree is traversed level by level, resulting in three levels: root [3], second level [9,20], and third level [15,7]."
      },
      {
        input: "root = [1]",
        output: "[[1]]",
        explanation: "A single node tree has only one level containing the root node."
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "An empty tree results in an empty level order traversal."
      }
    ],
    acceptanceRate: 47.1,
    submissions: 7432
  },
  {
    id: "10",
    title: "Sort Colors",
    difficulty: "Medium",
    description: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent. Use the integers 0, 1, and 2 to represent red, white, and blue respectively.",
    source: "LeetCode",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      {
        input: "nums = [2,0,2,1,1,0]",
        output: "[0,0,1,1,2,2]",
        explanation: "After sorting, all red objects (0s) come first, followed by white objects (1s), then blue objects (2s)."
      },
      {
        input: "nums = [2,0,1]",
        output: "[0,1,2]",
        explanation: "The array is sorted in-place with one of each color."
      }
    ],
    acceptanceRate: 54.3,
    submissions: 9876
  },
  {
    id: "11",
    title: "Detect Cycle in a Directed Graph",
    difficulty: "Hard",
    description: "Given a directed graph, check whether the graph contains a cycle or not.",
    source: "GeeksforGeeks",
    tags: ["Graph", "DFS", "BFS"],
    testCases: [
      {
        input: "vertices = 4, edges = [[0,1],[0,2],[1,2],[2,0],[2,3]]",
        output: "true",
        explanation: "There is a cycle: 0->1->2->0"
      },
      {
        input: "vertices = 4, edges = [[0,1],[0,2],[1,2],[2,3]]",
        output: "false",
        explanation: "There is no cycle in the graph."
      }
    ],
    acceptanceRate: 39.8,
    submissions: 5421
  },
  {
    id: "12",
    title: "Coin Change",
    difficulty: "Medium",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    source: "LeetCode",
    tags: ["Dynamic Programming", "BFS", "Array"],
    testCases: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1"
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
        explanation: "No combination can sum to 3"
      }
    ],
    acceptanceRate: 43.6,
    submissions: 8754
  },
  {
    id: "13",
    title: "Word Break",
    difficulty: "Hard",
    description: "Given a string and a dictionary of words, determine if the string can be segmented into a space-separated sequence of one or more dictionary words.",
    source: "GeeksforGeeks",
    tags: ["Dynamic Programming", "Trie", "String"],
    testCases: [
      {
        input: '"leetcode", ["leet", "code"]',
        output: 'true',
        explanation: 'Return true because "leetcode" can be segmented as "leet code".'
      },
      {
        input: '"applepenapple", ["apple", "pen"]',
        output: 'true',
        explanation: 'The string can be segmented as "apple pen apple".'
      },
      {
        input: '"catsandog", ["cats", "dog", "sand", "and", "cat"]',
        output: 'false',
        explanation: 'The string cannot be segmented into dictionary words.'
      }
    ],
    timeLimit: 1500,
    memoryLimit: 24,
    acceptanceRate: 35.8,
    submissions: 5421
  },
  {
    id: "14",
    title: "Maximum Subarray",
    difficulty: "Easy",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    source: "LeetCode",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    testCases: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "A single element array has maximum sum equal to that element."
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The entire array forms the maximum sum subarray."
      }
    ],
    acceptanceRate: 54.3,
    submissions: 9876
  },
  {
    id: "15",
    title: "LRU Cache",
    difficulty: "Hard",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods.",
    source: "LeetCode",
    tags: ["Hash Table", "Linked List", "Design"],
    testCases: [
      {
        input: "LRUCache lRUCache = new LRUCache(2); lRUCache.put(1, 1); lRUCache.put(2, 2); lRUCache.get(1); lRUCache.put(3, 3); lRUCache.get(2); lRUCache.put(4, 4); lRUCache.get(1); lRUCache.get(3); lRUCache.get(4);",
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation: "Cache capacity is 2. put(1, 1), put(2, 2), get(1) returns 1, put(3, 3) evicts key 2, etc."
      }
    ],
    acceptanceRate: 47.1,
    submissions: 7432
  },
  {
    id: "16",
    title: "Find the Closest Pair from Two Arrays",
    difficulty: "Medium",
    description: "Given two sorted arrays and a number x, find the pair whose sum is closest to x, where one element is from each array.",
    source: "GeeksforGeeks",
    tags: ["Array", "Two Pointers", "Binary Search"],
    testCases: [
      {
        input: "arr1 = [1, 4, 5, 7], arr2 = [10, 20, 30, 40], x = 32",
        output: "[7, 20]",
        explanation: "7 + 20 = 27 is closest to 32"
      },
      {
        input: "arr1 = [1, 4, 5, 7], arr2 = [10, 20, 30, 40], x = 50",
        output: "[7, 40]",
        explanation: "7 + 40 = 47 is closest to 50"
      }
    ],
    acceptanceRate: 43.6,
    submissions: 8754
  },
  {
    id: "17",
    title: "Boolean Matrix",
    difficulty: "Medium",
    description: "Given a boolean matrix mat[M][N] of size M X N, modify it such that if a matrix cell mat[i][j] is 1 then make all the cells of ith row and jth column as 1.",
    source: "GeeksforGeeks",
    tags: ["Matrix", "Array"],
    testCases: [
      {
        input: "matrix = [[1, 0, 0], [0, 0, 1], [0, 0, 0]]",
        output: "[[1, 0, 1], [1, 1, 1], [0, 0, 1]]",
        explanation: "After modification, rows and columns containing 1s are updated."
      },
      {
        input: "matrix = [[0, 0], [0, 0]]",
        output: "[[0, 0], [0, 0]]",
        explanation: "No 1s in the matrix, so no modifications needed."
      }
    ],
    acceptanceRate: 54.3,
    submissions: 9876
  },
  {
    id: "18",
    title: "Shortest Unique Prefix",
    difficulty: "Hard",
    description: "Given an array of strings, find the shortest unique prefix for each string.",
    source: "CodeChef",
    tags: ["Trie", "String"],
    testCases: [
      {
        input: "arr = [\"zebra\", \"dog\", \"duck\", \"dove\"]",
        output: "[\"z\", \"dog\", \"du\", \"dov\"]",
        explanation: "'z' is prefix for only zebra, 'dog' is only for dog, etc."
      },
      {
        input: "arr = [\"apple\", \"app\"]",
        output: "[\"app\", \"app\"]",
        explanation: "No unique prefix for \"app\", the entire string is needed."
      }
    ],
    acceptanceRate: 35.8,
    submissions: 5421
  },
  {
    id: "19",
    title: "Minimum Number of Platforms",
    difficulty: "Medium",
    description: "Given arrival and departure times of all trains at a railway station, find the minimum number of platforms required for the railway station so that no train waits.",
    source: "CodeForces",
    tags: ["Greedy", "Sorting"],
    testCases: [
      {
        input: "arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000]",
        output: "3",
        explanation: "Minimum 3 platforms needed at the railway station."
      },
      {
        input: "arr = [900, 1100, 1235], dep = [1000, 1200, 1240]",
        output: "1",
        explanation: "Only one platform is needed as trains arrive and depart without overlap."
      }
    ],
    acceptanceRate: 43.6,
    submissions: 8754
  },
  {
    id: "20",
    title: "Rabin-Karp Algorithm",
    difficulty: "Hard",
    description: "Implement the Rabin-Karp algorithm for pattern searching in a string.",
    source: "GeeksforGeeks",
    tags: ["String", "Rolling Hash", "Pattern Matching"],
    testCases: [
      {
        input: "text = \"AABAACAADAABAABA\", pattern = \"AABA\"",
        output: "[0, 9, 12]",
        explanation: "Pattern found at index 0, 9, and 12."
      },
      {
        input: "text = \"ABCDEFG\", pattern = \"XYZ\"",
        output: "[]",
        explanation: "No matches found."
      }
    ],
    acceptanceRate: 35.8,
    submissions: 5421
  }
];

export const mockContests: ContestInfo[] = [
  {
    id: "c1",
    title: "Weekly Contest 345",
    description: "Solve 4 algorithmic problems within 90 minutes",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 90 * 60 * 1000).toISOString(), // 90 minutes from now
    difficulty: "Intermediate",
    registered: true,
    participants: 2580,
    problems: 4
  },
  {
    id: "c2",
    title: "CodeChef Starters 100",
    description: "Beginner-friendly contest with prizes for top performers",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 120 * 60 * 1000).toISOString(), // 120 minutes from now
    difficulty: "Beginner",
    registered: true,
    participants: 1890,
    problems: 4
  },
  {
    id: "c3",
    title: "Google Kickstart",
    description: "Showcase your skills and get noticed by Google",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days from now
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10 + 180 * 60 * 1000).toISOString(), // 180 minutes from now
    difficulty: "Advanced",
    registered: true,
    participants: 5230,
    problems: 4
  }
];

// Mock challenge sessions
export const mockChallengeSessions: ChallengeSession[] = [
  {
    id: "cs1",
    userId: "user1",
    startTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    problemIds: ["1", "2", "3"],
    currentProblemIndex: 3,
    completed: true,
    score: 85,
    performance: {
      averageTimePerProblem: 587000, // ms
      problemsAttempted: 3,
      problemsSolved: 3,
      streakMaintained: true
    }
  }
];

// Mock leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  { userId: "user1", username: "codemaster", score: 2450, problemsSolved: 48, rank: 1, badge: "Gold" },
  { userId: "user2", username: "debuggerninja", score: 2120, problemsSolved: 42, rank: 2, badge: "Silver" },
  { userId: "user3", username: "algorithmgeek", score: 1980, problemsSolved: 39, rank: 3, badge: "Silver" },
  { userId: "user4", username: "bytewizard", score: 1845, problemsSolved: 37, rank: 4, badge: "Bronze" },
  { userId: "user5", username: "codehacker", score: 1790, problemsSolved: 35, rank: 5, badge: "Bronze" },
];

// Actual service functions to be implemented later with Firebase
export class CodingService {
  async getProblems(): Promise<CodingProblem[]> {
    try {
      // For now, return mock data
      console.log('Fetching problems...', mockProblems.length);
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      return Promise.resolve([...mockProblems]);
    } catch (error) {
      console.error("Error fetching problems:", error);
      return [];
    }
  }

  async getProblemById(id: string): Promise<CodingProblem | null> {
    try {
      console.log('Fetching problem by ID:', id);
      const problem = mockProblems.find(p => p.id === id);
      return Promise.resolve(problem || null);
    } catch (error) {
      console.error("Error fetching problem by ID:", error);
      return null;
    }
  }

  async getContests(): Promise<ContestInfo[]> {
    try {
      // For now, return mock data
      console.log('Fetching contests...', mockContests.length);
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      return Promise.resolve([...mockContests]);
    } catch (error) {
      console.error("Error fetching contests:", error);
      return [];
    }
  }

  async registerForContest(userId: string, contestId: string): Promise<boolean> {
    // Mock implementation
    console.log(`User ${userId} registered for contest ${contestId}`);
    return true;
  }

  async submitSolution(submission: Omit<UserSubmission, 'submittedAt'>): Promise<UserSubmission> {
    const fullSubmission: UserSubmission = {
      ...submission,
      submittedAt: new Date()
    };
    
    // Mock implementation - in real app, would validate against test cases
    console.log("Solution submitted:", fullSubmission);
    
    return fullSubmission;
  }

  private checkSyntax(code: string, language: string): boolean {
    // Basic syntax checking
    try {
      if (language === 'python') {
        // Check for proper Python function definition and format
        const hasProperDef = code.includes('def solve_') || code.includes('def Solution');
        const hasProperReturn = code.includes('return');
        const hasProperIndentation = code.includes('    ') || code.includes('\t');
        return !(hasProperDef && hasProperReturn && hasProperIndentation);
      } else if (language === 'javascript') {
        // Check for proper JavaScript function definition and format
        const hasProperFunction = code.includes('function solve') || code.includes('var Solution');
        const hasProperReturn = code.includes('return');
        return !(hasProperFunction && hasProperReturn);
      }
      return false;
    } catch {
      return true;
    }
  }

  private checkRequiredLogic(code: string, problemTitle: string, language: string): boolean {
    const lowerCode = code.toLowerCase();
    const lowerTitle = problemTitle.toLowerCase();

    // First check if the code has the correct function signature format
    if (language === 'python') {
      const expectedFuncName = `def solve_${lowerTitle.replace(/\s+/g, '').toLowerCase()}`;
      if (!code.includes(expectedFuncName)) {
        return false;
      }
    } else if (language === 'javascript') {
      const expectedFuncName = `function solve${lowerTitle.replace(/\s+/g, '')}`;
      if (!code.includes(expectedFuncName)) {
        return false;
      }
    }

    // Then check for problem-specific logic
    switch (lowerTitle) {
      case 'two sum':
        return lowerCode.includes('for') && (lowerCode.includes('map') || lowerCode.includes('dict'));
      case 'valid parentheses':
        return lowerCode.includes('stack') || lowerCode.includes('array') || lowerCode.includes('list');
      case 'reverse string':
        return lowerCode.includes('for') || lowerCode.includes('while') || lowerCode.includes('reverse');
      case 'maximum subarray':
        return lowerCode.includes('for') || lowerCode.includes('while') || lowerCode.includes('max');
      case 'palindrome number':
        return lowerCode.includes('str') || lowerCode.includes('reverse') || lowerCode.includes('while');
      default:
        // For other problems, just ensure basic structure is correct
        return true;
    }
  }

  private getExpectedFunctionName(problemTitle: string, language: string): string {
    const sanitizedTitle = problemTitle.replace(/\s+/g, '').toLowerCase();
    if (language === 'python') {
      return `solve_${sanitizedTitle}`;
    } else if (language === 'javascript') {
      return `solve${problemTitle.replace(/\s+/g, '')}`;
    }
    return '';
  }

  private getSolvedProblems(): UserSolvedProblem[] {
    const solved = localStorage.getItem('solvedProblems');
    return solved ? JSON.parse(solved) : [];
  }

  private saveSolvedProblem(problem: UserSolvedProblem) {
    const solved = this.getSolvedProblems();
    // Check if problem already exists
    const index = solved.findIndex(p => p.problemId === problem.problemId);
    if (index >= 0) {
      // Update existing solution
      solved[index] = problem;
    } else {
      // Add new solution
      solved.push(problem);
    }
    localStorage.setItem('solvedProblems', JSON.stringify(solved));
  }

  isProblemSolved(problemId: string): boolean {
    const solved = this.getSolvedProblems();
    return solved.some(p => p.problemId === problemId);
  }

  getSavedSolution(problemId: string): UserSolvedProblem | null {
    const solved = this.getSolvedProblems();
    return solved.find(p => p.problemId === problemId) || null;
  }

  async runTests(problemId: string, code: string, language: string): Promise<{ 
    success: boolean; 
    results: Array<{ 
      passed: boolean; 
      input: string; 
      expected: string; 
      actual: string; 
      time?: string;
    }> 
  }> {
    console.log(`Running tests for problem ${problemId} with ${language} code`);

    // Find the problem from mockProblems
    const problem = mockProblems.find(p => p.id === problemId);

    if (!problem) {
      console.error(`Problem not found with ID: ${problemId}`);
      return {
        success: false,
        results: [{
          passed: false,
          input: "",
          expected: "",
          actual: "Problem not found - Please try refreshing the page",
          time: "0ms"
        }]
      };
    }

    try {
      // Wrap the user's code in a class for execution
      const wrappedCode = language === 'python' ? 
        `class Solution:\n${code.split('\n').map(line => '    ' + line).join('\n')}\n\nsolution = Solution()` :
        `class Solution {\n${code}\n}\n\nconst solution = new Solution();`;

      const results = await Promise.all(problem.testCases.map(async testCase => {
        const startTime = performance.now();
        try {
          // Execute the solution with the test case
          const result = language === 'python' ?
            await executePythonCode(`${wrappedCode}\nresult = solution.solve_${problem.title.toLowerCase().replace(/\s+/g, '')}(${JSON.stringify(testCase.input)})`) :
            await executeJavaScriptCode(`${wrappedCode}\nconst result = solution.solve${problem.title.replace(/\s+/g, '')}(${JSON.stringify(testCase.input)});`);

          const endTime = performance.now();
          const executionTime = Math.round(endTime - startTime);

          return {
            passed: result === testCase.output,
            input: testCase.input,
            expected: testCase.output,
            actual: result,
            time: `${executionTime}ms`
          };
        } catch (error) {
          return {
            passed: false,
            input: testCase.input,
            expected: testCase.output,
            actual: error.message,
            time: "0ms"
          };
        }
      }));

      const success = results.every(r => r.passed);
      
      // If all tests pass, store the solution
      if (success) {
        const avgExecutionTime = results.reduce((sum, r) => sum + parseInt(r.time || "0"), 0) / results.length;
        this.saveSolvedProblem({
          problemId,
          solution: code,
          language,
          solvedAt: new Date(),
          executionTime: `${avgExecutionTime}ms`
        });
      }

      return {
        success,
        results
      };
    } catch (error: any) {
      console.error("Error running tests:", error);
      return {
        success: false,
        results: [{
          passed: false,
          input: "",
          expected: "",
          actual: error.message,
          time: "0ms"
        }]
      };
    }
  }

  async getUserPerformance(userId: string): Promise<UserPerformance | null> {
    // In a real implementation, this would fetch from a database
    // Return mock data for now
    return {
      userId,
      problemsSolved: 27,
      totalAttempts: 42,
      streak: 5,
      lastActive: new Date(),
      averageTime: 12500, // 12.5 seconds
      skillLevel: 'Intermediate',
      badges: [
        {
          id: 'b1',
          name: 'Streak Master',
          description: 'Solved problems for 5 consecutive days',
          iconUrl: '/badges/streak.png',
          earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          category: 'Streak'
        }
      ],
      ratingsByTag: {
        'Array': 820,
        'String': 750,
        'Dynamic Programming': 680,
        'Tree': 710
      },
      recentSubmissions: []
    };
  }

  async startChallengeSession(userId: string, difficulty?: 'Easy' | 'Medium' | 'Hard', numberOfProblems = 3): Promise<ChallengeSession> {
    // Get problems based on difficulty
    const allProblems = await this.getProblems();
    let eligibleProblems = allProblems;
    
    if (difficulty) {
      eligibleProblems = allProblems.filter(p => p.difficulty === difficulty);
    }
    
    // Select random problems
    const selectedProblems: string[] = [];
    while (selectedProblems.length < numberOfProblems && eligibleProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleProblems.length);
      selectedProblems.push(eligibleProblems[randomIndex].id);
      eligibleProblems.splice(randomIndex, 1);
    }
    
    // Create a new challenge session
    const session: ChallengeSession = {
      id: nanoid(),
      userId,
      startTime: new Date(),
      problemIds: selectedProblems,
      currentProblemIndex: 0,
      completed: false,
      score: 0,
      performance: {
        averageTimePerProblem: 0,
        problemsAttempted: 0,
        problemsSolved: 0,
        streakMaintained: false
      }
    };
    
    // In a real implementation, save to database
    return session;
  }

  async completeChallengeSession(sessionId: string, performance: ChallengeSession['performance']): Promise<ChallengeSession> {
    // In a real implementation, this would update the session in the database
    const updatedSession: ChallengeSession = {
      ...mockChallengeSessions[0],
      id: sessionId,
      completed: true,
      endTime: new Date(),
      performance
    };
    
    return updatedSession;
  }

  async getLeaderboard(timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time'): Promise<LeaderboardEntry[]> {
    // In a real implementation, this would fetch from a database with filtering by timeFrame
    return mockLeaderboard;
  }

  private generateRandomWrongOutput(expectedOutput: string): string {
    // Simple implementation - could be made more sophisticated
    if (expectedOutput.includes('[') && expectedOutput.includes(']')) {
      // It's an array, modify one element
      const elements = expectedOutput.replace('[', '').replace(']', '').split(',');
      if (elements.length > 0) {
        const randomIndex = Math.floor(Math.random() * elements.length);
        elements[randomIndex] = ' ' + (parseInt(elements[randomIndex]) + 1).toString();
        return '[' + elements.join(',') + ']';
      }
    } else if (expectedOutput === 'true' || expectedOutput === 'false') {
      // It's a boolean, return the opposite
      return expectedOutput === 'true' ? 'false' : 'true';
    } else if (!isNaN(parseInt(expectedOutput))) {
      // It's a number, modify it slightly
      return (parseInt(expectedOutput) + (Math.random() > 0.5 ? 1 : -1)).toString();
    }
    
    // Default: return "Wrong output"
    return "Incorrect result";
  }
}

async function executePythonCode(code: string): Promise<string> {
  try {
    // Extract input from the test case
    const match = code.match(/solution\.solve_\w+\((.*)\)/);
    if (!match) {
      throw new Error('Invalid code format');
    }
    
    // Parse the input string
    const inputStr = match[1];
    let input;
    try {
      // Handle different input formats
      if (inputStr.includes('=')) {
        // Format: "nums = [1,2], target = 3"
        const parts = inputStr.split(',').map(p => p.trim());
        const inputs = {};
        parts.forEach(part => {
          const [key, value] = part.split('=').map(s => s.trim());
          inputs[key] = JSON.parse(value);
        });
        input = inputs;
      } else {
        // Direct value format
        input = JSON.parse(inputStr);
      }
    } catch (e) {
      // If JSON.parse fails, use the raw string
      input = inputStr;
    }

    // Execute the solution
    const solution = new Function(`
      ${code}
      return String(result);
    `);

    return solution();
  } catch (error) {
    console.error('Python execution error:', error);
    throw new Error(`Python execution error: ${error.message}`);
  }
}

async function executeJavaScriptCode(code: string): Promise<string> {
  try {
    // Extract input from the test case
    const match = code.match(/solution\.solve\w+\((.*)\)/);
    if (!match) {
      throw new Error('Invalid code format');
    }
    
    // Parse the input string
    const inputStr = match[1];
    let input;
    try {
      // Handle different input formats
      if (inputStr.includes('=')) {
        // Format: "nums = [1,2], target = 3"
        const parts = inputStr.split(',').map(p => p.trim());
        const inputs = {};
        parts.forEach(part => {
          const [key, value] = part.split('=').map(s => s.trim());
          inputs[key] = JSON.parse(value);
        });
        input = inputs;
      } else {
        // Direct value format
        input = JSON.parse(inputStr);
      }
    } catch (e) {
      // If JSON.parse fails, use the raw string
      input = inputStr;
    }

    // Execute the solution
    const solution = new Function(`
      ${code}
      return String(result);
    `);

    return solution();
  } catch (error) {
    console.error('JavaScript execution error:', error);
    throw new Error(`JavaScript execution error: ${error.message}`);
  }
}

export const codingService = new CodingService(); 