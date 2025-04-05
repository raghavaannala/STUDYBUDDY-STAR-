import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Code, Calendar, ExternalLink, Timer, Filter, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CodingProblem, 
  ContestInfo, 
  codingService 
} from '@/services/codingProblems';
import { useAuth } from '@/contexts/AuthContext';

// Define problem categories and their associated problems
const PRACTICE_PROBLEMS: Record<'Easy' | 'Medium' | 'Hard', CodingProblem[]> = {
  Easy: [
    {
      id: 'easy-1',
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Arrays', 'Hash Table'],
      testCases: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1]'
        }
      ]
    },
    {
      id: 'easy-2',
      title: 'Valid Parentheses',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Stack', 'String'],
      testCases: [
        {
          input: 's = "()"',
          output: 'true',
          explanation: 'The parentheses match correctly'
        }
      ]
    },
    {
      id: 'easy-3',
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Two Pointers', 'String'],
      testCases: [
        {
          input: 's = ["h","e","l","l","o"]',
          output: '["o","l","l","e","h"]',
          explanation: 'Reverse the string in-place'
        }
      ]
    },
    {
      id: 'easy-4',
      title: 'Maximum Subarray',
      description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
      testCases: [
        {
          input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
          output: '6',
          explanation: '[4,-1,2,1] has the largest sum = 6'
        }
      ]
    },
    {
      id: 'easy-5',
      title: 'Climbing Stairs',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Dynamic Programming', 'Math'],
      testCases: [
        {
          input: 'n = 3',
          output: '3',
          explanation: 'There are three ways: (1,1,1), (1,2), (2,1)'
        }
      ]
    },
    {
      id: 'easy-6',
      title: 'First Unique Character',
      description: 'Given a string s, find the first non-repeating character and return its index. If it does not exist, return -1.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['String', 'Hash Table', 'Queue'],
      testCases: [
        {
          input: 's = "leetcode"',
          output: '0',
          explanation: 'The first non-repeating character is "l"'
        }
      ]
    },
    {
      id: 'easy-7',
      title: 'Missing Number',
      description: 'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Math', 'Bit Manipulation'],
      testCases: [
        {
          input: 'nums = [3,0,1]',
          output: '2',
          explanation: 'n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number.'
        }
      ]
    },
    {
      id: 'easy-8',
      title: 'Palindrome Linked List',
      description: 'Given the head of a singly linked list, return true if it is a palindrome or false otherwise.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Linked List', 'Two Pointers', 'Stack'],
      testCases: [
        {
          input: 'head = [1,2,2,1]',
          output: 'true',
          explanation: 'The linked list is a palindrome'
        }
      ]
    },
    {
      id: 'easy-9',
      title: 'Merge Sorted Arrays',
      description: 'Given two sorted arrays nums1 and nums2, merge them into a single sorted array.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Two Pointers', 'Sorting'],
      testCases: [
        {
          input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
          output: '[1,2,2,3,5,6]',
          explanation: 'Merge nums2 into nums1 to form a single sorted array'
        }
      ]
    },
    {
      id: 'easy-10',
      title: 'Binary Search',
      description: 'Given a sorted array of integers nums and a target value, return the index of target in nums. If target is not found, return -1.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Binary Search'],
      testCases: [
        {
          input: 'nums = [-1,0,3,5,9,12], target = 9',
          output: '4',
          explanation: '9 exists in nums and its index is 4'
        }
      ]
    },
    {
      id: 'easy-11',
      title: 'Implement Queue using Stacks',
      description: 'Implement a first in first out (FIFO) queue using only two stacks.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Stack', 'Queue', 'Design'],
      testCases: [
        {
          input: '["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]',
          output: '[null, null, null, 1, 1, false]',
          explanation: 'Queue operations using two stacks'
        }
      ]
    },
    {
      id: 'easy-12',
      title: 'Symmetric Tree',
      description: 'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Tree', 'DFS', 'BFS'],
      testCases: [
        {
          input: 'root = [1,2,2,3,4,4,3]',
          output: 'true',
          explanation: 'The tree is symmetric'
        }
      ]
    },
    {
      id: 'easy-13',
      title: 'Best Time to Buy and Sell Stock',
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Dynamic Programming'],
      testCases: [
        {
          input: 'prices = [7,1,5,3,6,4]',
          output: '5',
          explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5'
        }
      ]
    },
    {
      id: 'easy-14',
      title: 'Intersection of Two Arrays',
      description: 'Given two integer arrays nums1 and nums2, return an array of their intersection.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Array', 'Hash Table', 'Two Pointers'],
      testCases: [
        {
          input: 'nums1 = [1,2,2,1], nums2 = [2,2]',
          output: '[2]',
          explanation: 'The intersection of the two arrays is [2]'
        }
      ]
    },
    {
      id: 'easy-15',
      title: 'Power of Three',
      description: 'Given an integer n, return true if it is a power of three. Otherwise, return false.',
      difficulty: 'Easy',
      source: 'LeetCode',
      tags: ['Math', 'Recursion'],
      testCases: [
        {
          input: 'n = 27',
          output: 'true',
          explanation: '27 = 3^3'
        }
      ]
    }
  ],
  Medium: [
    {
      id: 'medium-1',
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['String', 'Sliding Window', 'Hash Table'],
      testCases: [
        {
          input: 's = "abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3'
        }
      ]
    },
    {
      id: 'medium-2',
      title: '3Sum',
      description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Arrays', 'Two Pointers', 'Sorting'],
      testCases: [
        {
          input: 'nums = [-1,0,1,2,-1,-4]',
          output: '[[-1,-1,2],[-1,0,1]]',
          explanation: 'These are all the unique triplets that sum to zero'
        }
      ]
    },
    {
      id: 'medium-3',
      title: 'Binary Tree Level Order Traversal',
      description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Tree', 'BFS', 'Binary Tree'],
      testCases: [
        {
          input: 'root = [3,9,20,null,null,15,7]',
          output: '[[3],[9,20],[15,7]]',
          explanation: 'Level order traversal: level by level from left to right'
        }
      ]
    },
    {
      id: 'medium-4',
      title: 'Rotate Image',
      description: 'You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees (clockwise).',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Math', 'Matrix'],
      testCases: [
        {
          input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
          output: '[[7,4,1],[8,5,2],[9,6,3]]',
          explanation: 'Rotate the matrix by 90 degrees clockwise'
        }
      ]
    },
    {
      id: 'medium-5',
      title: 'Group Anagrams',
      description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Hash Table', 'String', 'Sorting'],
      testCases: [
        {
          input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
          output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
          explanation: 'Group words that are anagrams of each other'
        }
      ]
    },
    {
      id: 'medium-6',
      title: 'Spiral Matrix',
      description: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Matrix', 'Simulation'],
      testCases: [
        {
          input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]',
          output: '[1,2,3,6,9,8,7,4,5]',
          explanation: 'Return elements in spiral order'
        }
      ]
    },
    {
      id: 'medium-7',
      title: 'Jump Game',
      description: 'You are given an integer array nums. You are initially positioned at the first index and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Dynamic Programming', 'Greedy'],
      testCases: [
        {
          input: 'nums = [2,3,1,1,4]',
          output: 'true',
          explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.'
        }
      ]
    },
    {
      id: 'medium-8',
      title: 'Subsets',
      description: 'Given an integer array nums of unique elements, return all possible subsets (the power set).',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Backtracking', 'Bit Manipulation'],
      testCases: [
        {
          input: 'nums = [1,2,3]',
          output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]',
          explanation: 'Return all possible subsets'
        }
      ]
    },
    {
      id: 'medium-9',
      title: 'Container With Most Water',
      description: 'Given n non-negative integers representing an array of heights, find two lines that together with the x-axis forms a container that holds the most water.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Two Pointers', 'Greedy'],
      testCases: [
        {
          input: 'height = [1,8,6,2,5,4,8,3,7]',
          output: '49',
          explanation: 'The maximum area is obtained by choosing height[1] = 8 and height[8] = 7'
        }
      ]
    },
    {
      id: 'medium-10',
      title: 'Generate Parentheses',
      description: 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['String', 'Dynamic Programming', 'Backtracking'],
      testCases: [
        {
          input: 'n = 3',
          output: '["((()))","(()())","(())()","()(())","()()()"]',
          explanation: 'All valid combinations of 3 pairs of parentheses'
        }
      ]
    },
    {
      id: 'medium-11',
      title: 'Search in Rotated Sorted Array',
      description: 'Given a rotated sorted array nums and a target value, return the index of target if it is in nums, or -1 if it is not in nums.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Binary Search'],
      testCases: [
        {
          input: 'nums = [4,5,6,7,0,1,2], target = 0',
          output: '4',
          explanation: 'Target 0 is found at index 4'
        }
      ]
    },
    {
      id: 'medium-12',
      title: 'Permutations',
      description: 'Given an array nums of distinct integers, return all possible permutations.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Backtracking'],
      testCases: [
        {
          input: 'nums = [1,2,3]',
          output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
          explanation: 'All possible permutations'
        }
      ]
    },
    {
      id: 'medium-13',
      title: 'Unique Paths',
      description: 'A robot is located at the top-left corner of a m x n grid. The robot can only move either down or right. How many possible unique paths are there to reach the bottom-right corner?',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
      testCases: [
        {
          input: 'm = 3, n = 7',
          output: '28',
          explanation: 'There are 28 unique paths to reach the bottom-right corner'
        }
      ]
    },
    {
      id: 'medium-14',
      title: 'Sort Colors',
      description: 'Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['Array', 'Two Pointers', 'Sorting'],
      testCases: [
        {
          input: 'nums = [2,0,2,1,1,0]',
          output: '[0,0,1,1,2,2]',
          explanation: 'Sort the array in-place'
        }
      ]
    },
    {
      id: 'medium-15',
      title: 'Word Break',
      description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
      difficulty: 'Medium',
      source: 'LeetCode',
      tags: ['String', 'Dynamic Programming', 'Trie'],
      testCases: [
        {
          input: 's = "leetcode", wordDict = ["leet","code"]',
          output: 'true',
          explanation: 'Return true because "leetcode" can be segmented as "leet code"'
        }
      ]
    }
  ],
  Hard: [
    {
      id: 'hard-1',
      title: 'Median of Two Sorted Arrays',
      description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Binary Search', 'Divide and Conquer'],
      testCases: [
        {
          input: 'nums1 = [1,3], nums2 = [2]',
          output: '2.0',
          explanation: 'Merged array = [1,2,3] and median is 2'
        }
      ]
    },
    {
      id: 'hard-2',
      title: 'Regular Expression Matching',
      description: 'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*" where "." matches any single character and "*" matches zero or more of the preceding element.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['String', 'Dynamic Programming', 'Recursion'],
      testCases: [
        {
          input: 's = "aa", p = "a*"',
          output: 'true',
          explanation: '"*" means zero or more of the preceding element, "a"'
        }
      ]
    },
    {
      id: 'hard-3',
      title: 'Merge k Sorted Lists',
      description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Linked List', 'Divide and Conquer', 'Heap'],
      testCases: [
        {
          input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
          output: '[1,1,2,3,4,4,5,6]',
          explanation: 'Merge all lists into one sorted list'
        }
      ]
    },
    {
      id: 'hard-4',
      title: 'Trapping Rain Water',
      description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
      testCases: [
        {
          input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
          output: '6',
          explanation: 'The elevation map can trap 6 units of water'
        }
      ]
    },
    {
      id: 'hard-5',
      title: 'N-Queens',
      description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Backtracking'],
      testCases: [
        {
          input: 'n = 4',
          output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
          explanation: 'Place 4 queens on a 4x4 board without attacking each other'
        }
      ]
    },
    {
      id: 'hard-6',
      title: 'Word Search II',
      description: 'Given an m x n board of characters and a list of strings words, return all words on the board that can be constructed from letters of sequentially adjacent cells.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Backtracking', 'Trie', 'Matrix'],
      testCases: [
        {
          input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
          output: '["eat","oath"]',
          explanation: 'Find all words that can be formed on the board'
        }
      ]
    },
    {
      id: 'hard-7',
      title: 'Longest Valid Parentheses',
      description: 'Given a string containing just the characters "(" and ")", find the length of the longest valid (well-formed) parentheses substring.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['String', 'Dynamic Programming', 'Stack'],
      testCases: [
        {
          input: 's = "(()"',
          output: '2',
          explanation: 'The longest valid parentheses substring is "()"'
        }
      ]
    },
    {
      id: 'hard-8',
      title: 'Sliding Window Maximum',
      description: 'Given an array nums and a sliding window of size k moving from the left of the array, return the maximum element in each window.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Queue', 'Sliding Window', 'Heap'],
      testCases: [
        {
          input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
          output: '[3,3,5,5,6,7]',
          explanation: 'Maximum element in each sliding window of size 3'
        }
      ]
    },
    {
      id: 'hard-9',
      title: 'First Missing Positive',
      description: 'Given an unsorted integer array nums, return the smallest missing positive integer.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Hash Table'],
      testCases: [
        {
          input: 'nums = [3,4,-1,1]',
          output: '2',
          explanation: '2 is the smallest missing positive integer'
        }
      ]
    },
    {
      id: 'hard-10',
      title: 'Serialize and Deserialize Binary Tree',
      description: 'Design an algorithm to serialize and deserialize a binary tree.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Tree', 'DFS', 'String', 'Design'],
      testCases: [
        {
          input: 'root = [1,2,3,null,null,4,5]',
          output: '[1,2,3,null,null,4,5]',
          explanation: 'Serialize and deserialize the binary tree'
        }
      ]
    },
    {
      id: 'hard-11',
      title: 'Maximum Profit in Job Scheduling',
      description: 'Given n jobs where each job has a start time, end time, and profit, find the maximum profit you can make.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Binary Search', 'Dynamic Programming', 'Sorting'],
      testCases: [
        {
          input: 'startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]',
          output: '120',
          explanation: 'Jobs 1 and 4 give the maximum profit of 120'
        }
      ]
    },
    {
      id: 'hard-12',
      title: 'Edit Distance',
      description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['String', 'Dynamic Programming'],
      testCases: [
        {
          input: 'word1 = "horse", word2 = "ros"',
          output: '3',
          explanation: 'horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e)'
        }
      ]
    },
    {
      id: 'hard-13',
      title: 'Longest Consecutive Sequence',
      description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Hash Table', 'Union Find'],
      testCases: [
        {
          input: 'nums = [100,4,200,1,3,2]',
          output: '4',
          explanation: 'The longest consecutive sequence is [1,2,3,4]'
        }
      ]
    },
    {
      id: 'hard-14',
      title: 'Minimum Window Substring',
      description: 'Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['String', 'Hash Table', 'Sliding Window', 'Two Pointers'],
      testCases: [
        {
          input: 's = "ADOBECODEBANC", t = "ABC"',
          output: '"BANC"',
          explanation: 'The minimum window substring that contains all characters of t'
        }
      ]
    },
    {
      id: 'hard-15',
      title: 'Largest Rectangle in Histogram',
      description: 'Given an array of integers heights representing the histogram bar height, return the area of the largest rectangle in the histogram.',
      difficulty: 'Hard',
      source: 'LeetCode',
      tags: ['Array', 'Stack', 'Monotonic Stack'],
      testCases: [
        {
          input: 'heights = [2,1,5,6,2,3]',
          output: '10',
          explanation: 'The largest rectangle has area = 10 units'
        }
      ]
    }
  ]
};

export default function CodeBuddy() {
  console.log("CodeBuddy component rendering - start");
  
  // State management
  const [activeTab, setActiveTab] = useState("problems");
  const [problems, setProblems] = useState<CodingProblem[]>(
    Object.values(PRACTICE_PROBLEMS).flat()
  );
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [solution, setSolution] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch problems and contests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('CodeBuddy: Starting to fetch data...');
        
        // Initialize with practice problems from constant
        setProblems(Object.values(PRACTICE_PROBLEMS).flat());
        
        try {
          // Fetch contests
          console.log('CodeBuddy: About to fetch contests...');
          const contestsData = await codingService.getContests();
          console.log('CodeBuddy: Contests fetched:', contestsData?.length);
          setContests(contestsData || []);
        } catch (contestError) {
          console.error("Error fetching contests:", contestError);
          setContests([]);
        }
        
      } catch (error) {
        console.error("CodeBuddy: Error in main fetch data block:", error);
        setError(error instanceof Error ? error.message : "Failed to load data");
        toast({
          title: "Error",
          description: "Failed to fetch coding problems and contests",
          variant: "destructive"
        });
      } finally {
        console.log('CodeBuddy: Fetch complete, setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      console.log('CodeBuddy: Component unmounting');
    };
  }, [toast]);
  
  // Safe filter problems based on search and filters
  const filteredProblems = useMemo(() => {
    console.log('CodeBuddy: Filtering problems, count:', problems?.length);
    if (!problems || problems.length === 0) return [];
    
    return problems.filter(problem => {
      try {
        const matchesSearch = searchQuery === "" || 
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
        const matchesSource = !selectedSource || problem.source === selectedSource;
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.every(tag => problem.tags.includes(tag));
        
        return matchesSearch && matchesDifficulty && matchesSource && matchesTags;
      } catch (filterError) {
        console.error("Error filtering problem:", filterError, problem);
        return false;
      }
    });
  }, [problems, searchQuery, selectedDifficulty, selectedSource, selectedTags]);
  
  // Get unique sources for filter - safely
  const sources = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    try {
      return Array.from(new Set(problems.map(p => p.source)));
    } catch (error) {
      console.error("Error getting sources:", error);
      return [];
    }
  }, [problems]);
  
  // Get unique tags for filter
  const allTags = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    try {
      const tagSet = new Set<string>();
      problems.forEach(problem => {
        problem.tags.forEach(tag => tagSet.add(tag));
      });
      return Array.from(tagSet);
    } catch (error) {
      console.error("Error getting tags:", error);
      return [];
    }
  }, [problems]);
  
  // Handle contest registration
  const handleRegisterContest = async (contestId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for contests",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await codingService.registerForContest(user.uid, contestId);
      setContests(prev => prev.map(contest => 
        contest.id === contestId ? {...contest, registered: true} : contest
      ));
      
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the contest"
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the contest",
        variant: "destructive"
      });
    }
  };
  
  // Render problem difficulty label
  const renderProblemDifficulty = (difficulty: string) => {
    const colorMap = {
      'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Hard': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded border ${colorMap[difficulty as keyof typeof colorMap]}`}>
        {difficulty}
      </span>
    );
  };
  
  // Render contest difficulty label
  const renderContestDifficulty = (difficulty: string) => {
    const colorMap = {
      'Beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded border ${colorMap[difficulty as keyof typeof colorMap]}`}>
        {difficulty}
      </span>
    );
  };

  // Use a variant of toast that works with our theme
  const showToast = (title: string, description: string, type: "default" | "destructive") => {
    toast({
      title,
      description,
      variant: type
    });
  };

  // Handle running tests for a solution
  const handleRunTests = async () => {
    if (!selectedProblem || !solution.trim()) return;
    
    setIsRunningTests(true);
    setTestResults(null);
    
    try {
      const results = await codingService.runTests(
        selectedProblem.id,
        solution,
        selectedLanguage
      );
      
      setTestResults(results);
      
      if (results.success) {
        showToast(
          "Tests Passed",
          "All test cases passed successfully!",
          "default"
        );
      } else {
        showToast(
          "Tests Failed",
          "Some test cases failed. Check the results.",
          "destructive"
        );
      }
    } catch (error) {
      showToast(
        "Test Error",
        "Failed to run tests",
        "destructive"
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // Handle solution submission
  const handleSubmitSolution = async () => {
    if (!user || !selectedProblem) return;
    
    setIsSubmitting(true);
    
    try {
      await codingService.submitSolution({
        userId: user.uid,
        problemId: selectedProblem.id,
        code: solution,
        language: selectedLanguage,
        status: "Accepted", // This would be determined by testing in a real implementation
      });
      
      // Run tests first to show results
      const results = await codingService.runTests(
        selectedProblem.id,
        solution,
        selectedLanguage
      );
      
      setTestResults(results);
      
      if (results.success) {
        showToast(
          "Solution Submitted",
          "Your solution has been submitted successfully!",
          "default"
        );
      } else {
        showToast(
          "Submission Failed",
          "Your solution failed some test cases.",
          "destructive"
        );
      }
    } catch (error) {
      showToast(
        "Submission Failed",
        "Failed to submit your solution",
        "destructive"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Add a function to get problems by difficulty
  const getProblemsByDifficulty = (difficulty: string) => {
    return PRACTICE_PROBLEMS[difficulty as keyof typeof PRACTICE_PROBLEMS] || [];
  };

  // If a problem is selected, show the full problem solving interface
  if (selectedProblem) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => {
              setSelectedProblem(null);
              setSolution("");
              setTestResults(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to problems
          </Button>
          
          <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
          <div className="ml-3">
            {renderProblemDifficulty(selectedProblem.difficulty)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {selectedProblem.tags && selectedProblem.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-purple-950/30">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs bg-blue-950/30">
            {selectedProblem.source}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Problem description and test cases */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p>{selectedProblem.description}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProblem.testCases && selectedProblem.testCases.map((testCase, index) => (
                    <div key={index} className="rounded-md bg-gray-800/50 p-4 text-sm">
                      <h4 className="text-sm font-medium mb-2">Test Case {index + 1}</h4>
                      <div className="mb-2">
                        <span className="text-gray-400">Input:</span> 
                        <code className="text-xs bg-gray-700 p-1 rounded ml-2 block mt-1 whitespace-pre-wrap">{testCase.input}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Expected Output:</span> 
                        <code className="text-xs bg-gray-700 p-1 rounded ml-2 block mt-1 whitespace-pre-wrap">{testCase.output}</code>
                      </div>
                      {testCase.explanation && (
                        <div className="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
                          <span className="font-medium">Explanation:</span> {testCase.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Test Results Section */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    Test Results
                    {testResults.success ? (
                      <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="ml-2 h-5 w-5 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-auto">
                    {testResults.results.map((result: any, index: number) => (
                      <div 
                        key={index} 
                        className={`rounded-md ${result.passed ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'} p-3 text-sm`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            Test Case {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          {result.time && (
                            <span className="text-xs text-gray-400">
                              {result.time}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="text-gray-400">Input:</span> 
                            <code className="ml-2 bg-gray-800 p-1 rounded block mt-1">{result.input}</code>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Expected:</span> 
                            <code className="ml-2 bg-gray-800 p-1 rounded block mt-1">{result.expected}</code>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Actual:</span> 
                            <code className={`ml-2 bg-gray-800 p-1 rounded block mt-1 ${!result.passed ? 'text-red-400' : ''}`}>
                              {result.actual}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Badge 
                      variant={testResults.success ? "default" : "destructive"} 
                      className="text-sm px-4 py-1"
                    >
                      {testResults.success ? 'All Tests Passed' : 'Some Tests Failed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right side - Code editor and controls */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Your Solution</CardTitle>
                  <Select 
                    defaultValue="javascript" 
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <Textarea 
                  className="font-mono text-sm h-[calc(100vh-350px)] min-h-64 bg-gray-800/70 resize-none"
                  placeholder={getLanguageTemplate(selectedLanguage, selectedProblem.title)}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                />
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4 space-x-4">
                <Button 
                  variant="outline"
                  onClick={handleRunTests}
                  disabled={isRunningTests || !solution.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {isRunningTests ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Running Tests...
                    </>
                  ) : (
                    'Run Tests'
                  )}
                </Button>
                
                <Button 
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || !solution.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Solution'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          CodeBuddy
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Practice competitive coding problems, participate in contests, and improve your algorithmic skills
        </p>
      </div>
      
      {error && (
        <div className="p-4 mb-6 border border-red-500/30 bg-red-500/10 rounded-md text-center">
          <p className="text-red-400 mb-2">Error loading content:</p>
          <p className="text-red-300 text-sm">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/20"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading coding problems and contests...</p>
        </div>
      ) : (
        <>
          <Tabs 
            defaultValue="problems" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="problems" className="text-sm">
                <Code className="h-4 w-4 mr-2" />
                Practice Problems
              </TabsTrigger>
              <TabsTrigger value="contests" className="text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Contests
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="problems">
              <div className="flex flex-col gap-4 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search problems by title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select onValueChange={(value) => setSelectedDifficulty(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {sources && sources.length > 0 && (
                    <Select onValueChange={(value) => setSelectedSource(value === "all" ? null : value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {sources.map((source) => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTags([])}
                      className="text-xs"
                    >
                      Clear Tags
                    </Button>
                  )}
                </div>
                
                {/* Tag selector */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant={selectedTags.includes(tag) ? "default" : "outline"} 
                      className={`text-xs cursor-pointer hover:bg-purple-950/30 ${
                        selectedTags.includes(tag) ? 'bg-purple-600/60' : 'bg-purple-950/10'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {!filteredProblems.length ? (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                  <Filter className="h-12 w-12 mb-2 opacity-30" />
                  <p>No problems match your filters</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDifficulty(null);
                      setSelectedSource(null);
                      setSelectedTags([]);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {['Easy', 'Medium', 'Hard'].map(difficulty => {
                    const difficultyProblems = filteredProblems.filter(p => p.difficulty === difficulty);
                    if (!difficultyProblems.length) return null;
                    
                    return (
                      <div key={difficulty} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{difficulty} Problems</h3>
                          <Badge variant="outline" className={
                            difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }>
                            {difficultyProblems.length}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {difficultyProblems.map((problem) => (
                            <Card key={problem.id} className="hover:shadow-md hover:border-purple-500/50 transition-all">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                                  {renderProblemDifficulty(problem.difficulty)}
                                </div>
                                <CardDescription className="flex items-center text-xs">
                                  <span className="mr-2">{problem.source}</span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {problem.tags && problem.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs bg-purple-950/30">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm line-clamp-2 text-gray-400">
                                  {problem.description}
                                </p>
                              </CardContent>
                              <CardFooter>
                                <Button 
                                  variant="secondary" 
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedProblem(problem);
                                    setSolution("");
                                    setTestResults(null);
                                  }}
                                >
                                  Solve Problem
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="contests">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contests.map((contest) => (
                  <Card key={contest.id} className="hover:shadow-md hover:border-purple-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                        {renderContestDifficulty(contest.difficulty)}
                      </div>
                      <CardDescription className="text-sm">
                        {contest.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Start Date:</span>
                          <span>{format(new Date(contest.startDate), 'PPp')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">End Date:</span>
                          <span>{format(new Date(contest.endDate), 'PPp')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Problems:</span>
                          <span>{contest.problems}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Participants:</span>
                          <span>{contest.participants.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={contest.registered ? "secondary" : "default"}
                        className="w-full"
                        onClick={() => handleRegisterContest(contest.id)}
                        disabled={contest.registered}
                      >
                        {contest.registered ? "Registered" : "Register Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Function to generate code templates based on language
function getLanguageTemplate(language: string, problemTitle: string): string {
  const title = problemTitle.replace(/\s+/g, ''); // Remove spaces for function name
  
  switch (language) {
    case 'javascript':
      return `/**
 * ${problemTitle} Solution
 */
function solve${title}(input) {
  // Your solution here
  
  return result;
}

// Example usage:
// solve${title}([1, 2, 3]);`;

    case 'python':
      return `# ${problemTitle} Solution

def solve_${title.toLowerCase()}(input):
    # Your solution here
    
    return result

# Example usage:
# solve_${title.toLowerCase()}([1, 2, 3])`;

    case 'java':
      return `/**
 * ${problemTitle} Solution
 */
public class Solution {
    public static void main(String[] args) {
        // Example usage
        // int[] input = {1, 2, 3};
        // System.out.println(solve${title}(input));
    }
    
    public static int solve${title}(int[] input) {
        // Your solution here
        
        return result;
    }
}`;

    case 'cpp':
      return `#include <iostream>
#include <vector>
using namespace std;

/**
 * ${problemTitle} Solution
 */
int solve${title}(vector<int>& input) {
    // Your solution here
    
    return result;
}

int main() {
    // Example usage
    // vector<int> input = {1, 2, 3};
    // cout << solve${title}(input) << endl;
    return 0;
}`;

    default:
      return `// Write your solution for ${problemTitle} here`;
  }
} 