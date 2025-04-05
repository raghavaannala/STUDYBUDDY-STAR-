import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Star, Sparkles } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getChatResponse } from '../services/gemini';
import { useToast } from "./ui/use-toast";

// Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'code' | 'text';
  language?: string;
}

interface AIAssistantProps {
  problemTitle?: string;
  problemDescription?: string;
  currentCode?: string;
  onSuggestionApply?: (suggestion: string) => void;
}

// Common coding topics for quick responses
const codingTopics = [
  "arrays", "strings", "linked lists", "trees", "graphs",
  "dynamic programming", "recursion", "sorting", "searching",
  "binary search", "two pointers", "sliding window", "backtracking"
];

interface StoredSuggestion {
  text: string;
  timestamp: number;
}

export function AIAssistant({ problemTitle, problemDescription, currentCode, onSuggestionApply }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [storedSuggestions, setStoredSuggestions] = useState<StoredSuggestion[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initial greeting when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      let greeting = `✨ Hi! I'm your coding assistant.`;
      
      if (problemTitle?.toLowerCase().includes('two sum')) {
        greeting += ` I see you're working on the Two Sum problem!
        
I can help you with:
1. Understanding how the Two Sum algorithm works
2. Breaking down the solution approach
3. Optimizing your code with the hashmap method
4. Debugging issues with your implementation

Click "give solution" for a complete working solution, or ask me specific questions! ✨`;
      } else {
        greeting += ` I can help you with:

1. Understanding the problem
2. Breaking down solutions
3. Optimizing code
4. Debugging issues
5. Explaining concepts

Just ask me anything or click "give solution" for a direct solution! ✨`;
      }
      
      const initialMessage: Message = {
        role: 'assistant',
        content: greeting,
        type: 'text'
      };
      setMessages([initialMessage]);
      
      // Show the guide for new sessions
      const hasSeenGuide = localStorage.getItem('hasSeenAssistantGuide');
      if (!hasSeenGuide) {
        setShowGuide(true);
        localStorage.setItem('hasSeenAssistantGuide', 'true');
      }
    }
  }, [problemTitle]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatCodeResponse = (response: string, problemTitle?: string, language?: string): Message[] => {
    const messages: Message[] = [];
    const parts = response.split('```');
    
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Text content
        if (part.trim()) {
          messages.push({
            role: 'assistant',
            content: part.trim(),
            type: 'text'
          });
        }
      } else {
        // Code content
        const [lang, ...codeParts] = part.split('\n');
        let codeContent = codeParts.join('\n').trim();
        
        // Don't extract or modify the code - return it in full
        if (codeContent) {
          messages.push({
            role: 'assistant',
            content: codeContent,
            type: 'code',
            language: lang.trim() || language || 'javascript'
          });
        }
      }
    });
    
    return messages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to state
    const userMessage: Message = { role: 'user', content: input, type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response = '';
      
      // Check if this is a request for a solution
      const isSolutionRequest = /solution|solve|answer|code|help me|how to|implement|fix|approach|algorithm|function|write|create|develop|program/i.test(input.toLowerCase());
      const isTestFailureError = /error|failing|test case|not working|bug|issue|problem|doesn't work|doesn't pass/i.test(input.toLowerCase());
      const isDirectSolutionRequest = /^(give|provide|show|help|tell)(\s+me)?(\s+the|\s+a)?(\s+complete|\s+full|\s+working)?(\s+solution|(\s+answer)|(\s+code)|(\s+approach)).*$/i.test(input.trim().toLowerCase());
      
      if (isTestFailureError || isSolutionRequest || isDirectSolutionRequest) {
        // Use a template-based approach instead of providing complete solutions
        if (problemTitle?.toLowerCase().includes('two sum')) {
          response = `Here's a template for the Two Sum problem:

\`\`\`python
def solve_twosum(nums, target):
    # TODO: Find two numbers in the array that add up to target
    # Return their indices
    
    # Write your code here
    # Hint: Consider using a dictionary to store values and their indices
    
    pass
\`\`\`

To solve this problem, you need to:
1. Find two numbers in the nums array that add up to the target
2. Return the indices of these two numbers
3. Consider using a dictionary/hash map for an efficient O(n) solution

Common approaches include:
- Brute force: Check all pairs of numbers (O(n²) time complexity)
- Hash map: Store each number and its index, then check for complements (O(n) time complexity)

Would you like me to explain the hash map approach in more detail?`;
        } else if (problemTitle?.toLowerCase().includes('maximum subarray')) {
          response = `Here's a template for the Maximum Subarray problem:

\`\`\`python
def solve_maximum_subarray(nums):
    # TODO: Find the contiguous subarray with the largest sum
    # Return the sum of this subarray
    
    # Write your code here
    # Hint: Consider Kadane's algorithm
    
    pass
\`\`\`

To solve this problem, you need to:
1. Find the contiguous subarray with the largest sum
2. Return the sum of this subarray
3. Consider using Kadane's algorithm for an efficient O(n) solution

Kadane's algorithm is an efficient way to solve this with O(n) time complexity. The key insight is to keep track of:
- The maximum sum ending at the current position
- The maximum sum found so far

Would you like me to explain Kadane's algorithm in more detail?`;
        } else if (problemTitle?.toLowerCase().includes('valid parentheses')) {
          response = `Here's a template for the Valid Parentheses problem:

\`\`\`python
def solve_validparentheses(s):
    # TODO: Implement a solution to check if the parentheses are valid
    # Hint: Consider using a stack data structure
    
    # Write your code here
    
    pass
\`\`\`

To solve this problem, you need to:
1. Determine if the input string has valid parentheses, brackets, and braces
2. Valid means all open brackets must be closed by the same type of bracket
3. Open brackets must be closed in the correct order
4. Consider using a stack to track opening brackets

The stack approach is the most efficient way to solve this problem with O(n) time complexity. The key steps are:
- Push opening brackets onto the stack
- When you encounter a closing bracket, check if it matches the most recent opening bracket
- If the stack is empty at the end, all brackets were properly matched

Would you like me to explain the stack approach in more detail?`;
        } else if (problemTitle?.toLowerCase().includes('palindrome number')) {
          response = `Here's a template for the Palindrome Number problem:

\`\`\`python
def solve_palindrome_number(x):
    # TODO: Determine if x is a palindrome integer
    # A palindrome reads the same backward as forward
    
    # Write your code here
    
    pass
\`\`\`

To solve this problem, you need to:
1. Determine if the input integer reads the same backward as forward
2. Consider how to handle negative numbers
3. Think about converting to a string or using mathematical operations

There are two common approaches:
- Convert to string and check if it reads the same forward and backward
- Reverse the number mathematically and check if it equals the original

Would you like me to explain either approach in more detail?`;
        } else {
          // For other problems, get a template from the API with context
          const sanitizedProblemName = problemTitle?.replace(/\s+/g, '_').toLowerCase() || 'problem';
          
          const context = `
You are helping a student learn to code by providing a template and guidance for a coding problem. DO NOT provide a complete working solution.

Problem: ${problemTitle}
Description: ${problemDescription}

The user is asking for help with the solution. First, create a Python function template with:
1. The function name should be solve_${sanitizedProblemName}
2. Include appropriate parameter names and types based on the problem description
3. Include TODO comments explaining what needs to be done
4. DO NOT provide a complete solution, just hints and a skeleton with 'pass' or placeholder return statements
5. Format with clean indentation (4 spaces)

Then, provide some general guidance on how to approach the problem. Explain the key concepts, data structures, or algorithms that might be helpful, without giving away the entire solution.

Your response should include:
1. A brief explanation of what the problem is asking
2. A Python code block with just the function skeleton
3. A discussion of 2-3 possible approaches to solve the problem
4. Questions to ask the user to guide their problem-solving process
`;
          
          response = await getChatResponse(context);
        }
      } else {
        // Regular chat responses
        const context = `
You are a coding assistant. The user is working on this problem:

Problem: ${problemTitle}
Description: ${problemDescription}

The user asks: "${input}"

Provide a helpful response. If they ask for help with the solution, provide hints and guidance rather than a complete solution unless explicitly requested.

If they are experiencing errors or issues with their code, try to diagnose the problem and suggest fixes.

Keep your responses focused and helpful for a coding context.
`.trim();

        response = await getChatResponse(context);
      }
      
      // Format and add AI response
      const formattedMessages = formatCodeResponse(response, problemTitle, currentCode?.includes('def') ? 'python' : 'javascript');
      setMessages(prev => [...prev, ...formattedMessages]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Adding a direct "Get Solution" function
  const getDirectSolution = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      let solution = '';
      
      // Provide a template-based solution for known problems
      if (problemTitle?.toLowerCase().includes('two sum')) {
        solution = `Here's a template for the Two Sum problem:

\`\`\`python
def solve_twosum(nums, target):
    # TODO: Find two numbers in the array that add up to target
    # Return their indices
    
    # Write your code here
    # Hint: Consider using a dictionary to store values and their indices
    
    pass
\`\`\`

To solve this problem, you need to:
1. Find two numbers in the nums array that add up to the target
2. Return the indices of these two numbers
3. Consider using a dictionary/hash map for an efficient O(n) solution
`;
      } else if (problemTitle?.toLowerCase().includes('maximum subarray')) {
        solution = `Here's a template for the Maximum Subarray problem:

\`\`\`python
def solve_maximum_subarray(nums):
    # TODO: Find the contiguous subarray with the largest sum
    # Return the sum of this subarray
    
    # Write your code here
    # Hint: Consider Kadane's algorithm
    
    pass
\`\`\`

To solve this problem, you need to:
1. Find the contiguous subarray with the largest sum
2. Return the sum of this subarray
3. Consider using Kadane's algorithm for an efficient O(n) solution
`;
      } else if (problemTitle?.toLowerCase().includes('valid parentheses')) {
        solution = `Here's a template for the Valid Parentheses problem:

\`\`\`python
def solve_validparentheses(s):
    # TODO: Implement a solution to check if the parentheses are valid
    # Hint: Consider using a stack data structure
    
    # Write your code here
    
    pass
\`\`\`

To solve this problem, you need to:
1. Determine if the input string has valid parentheses, brackets, and braces
2. Valid means all open brackets must be closed by the same type of bracket
3. Open brackets must be closed in the correct order
4. Consider using a stack to track opening brackets
`;
      } else if (problemTitle?.toLowerCase().includes('palindrome number')) {
        solution = `Here's a template for the Palindrome Number problem:

\`\`\`python
def solve_palindrome_number(x):
    # TODO: Determine if x is a palindrome integer
    # A palindrome reads the same backward as forward
    
    # Write your code here
    
    pass
\`\`\`

To solve this problem, you need to:
1. Determine if the input integer reads the same backward as forward
2. Consider how to handle negative numbers
3. Think about converting to a string or using mathematical operations
`;
      } else {
        // For other problems, get a skeleton template from the API
        const sanitizedProblemName = problemTitle?.replace(/\s+/g, '_').toLowerCase() || 'problem';
        
        const prompt = `
You are helping a student learn to code by providing a template for a coding problem.

Problem: ${problemTitle}
Description: ${problemDescription}

Create a Python function template for this problem with:
1. The function name should be solve_${sanitizedProblemName}
2. Include appropriate parameter names and types based on the problem description
3. Include TODO comments explaining what needs to be done
4. DO NOT provide a complete solution, just hints and a skeleton with 'pass' or empty return statements
5. Format with clean indentation (4 spaces)
6. Add helpful comments explaining the approach, but don't give away the full solution

Your response should have:
1. A brief explanation of the template
2. A Python code block with just the function skeleton 
3. A few hints about how to think about the problem
`;
        
        solution = await getChatResponse(prompt);
        
        // Add explanatory text if not present
        if (!solution.includes('```')) {
          solution = `Here's a template for the ${problemTitle} problem:

\`\`\`python
${solution}
\`\`\`

This template provides a starting point. Consider the key elements of the problem and the appropriate data structures.
`;
        } else if (!solution.toLowerCase().includes('here')) {
          solution = `Here's a template for the ${problemTitle} problem:

${solution}

This template provides a starting point. Consider the key elements of the problem and the appropriate data structures.
`;
        }
      }
      
      // Format and add the solution to messages
      const formattedMessages = formatCodeResponse(solution, problemTitle, 'python');
      setMessages(prev => [...prev, ...formattedMessages]);
      
    } catch (error) {
      console.error('Failed to get solution:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate solution template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <Card className="h-full border-0 shadow-none bg-slate-900 flex flex-col">
        <CardHeader className="border-b py-2 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-t-lg flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
            AI Assistant
            <Sparkles className="h-3 w-3 text-yellow-300" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col relative">
          <div className="absolute right-3 top-3 z-20">
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 text-xs rounded"
              onClick={getDirectSolution}
              disabled={isLoading}
            >
              give solution
            </Button>
          </div>
          
          <div 
            className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pt-12 pb-16"
            ref={scrollAreaRef}
          >
            <div className="p-3 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg p-2 ${
                      message.role === 'assistant'
                        ? message.type === 'code'
                          ? 'bg-slate-950 text-slate-100 border border-purple-500/20 font-mono'
                          : 'bg-slate-800 text-slate-100 border border-purple-500/10'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {message.type === 'code' ? (
                      <div className="relative">
                        <div className="absolute top-0 right-0 text-xs text-slate-500 px-2 py-1">
                          {message.language}
                        </div>
                        <pre className="text-sm overflow-x-auto p-2 pt-6 max-h-[400px]">
                          <code>{message.content}</code>
                        </pre>
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast({
                                title: "Code Copied",
                                description: "Solution copied to clipboard",
                              });
                            }}
                            size="sm"
                            className="text-xs"
                          >
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-lg p-2 bg-slate-800 text-slate-300 border border-purple-500/10">
                    <div className="flex items-center gap-2">
                      <div className="animate-bounce">•</div>
                      <div className="animate-bounce delay-100">•</div>
                      <div className="animate-bounce delay-200">•</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-900 absolute bottom-0 left-0 right-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 text-sm h-8 bg-slate-800 border-purple-500/30 focus:border-purple-400"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700 h-8 px-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 