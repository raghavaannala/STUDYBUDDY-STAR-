import React, { useState, useEffect } from 'react';
import Editor from '@/components/Editor';
import { CodingProblem, mockProblems } from '@/services/codingProblems';
import { CheckCircle2, XCircle, CheckCircle, Timer } from 'lucide-react';

interface CodeTemplate {
  readOnlyRanges: Array<[number, number]>;  // Line ranges that are read-only
  template: string;  // Full template including function signature and helper code
  defaultCode: string;  // The editable part that goes inside the function
  startingLine: number;  // Where the editable region begins
  endLine: number;  // Where the editable region ends
}

function getCodeTemplate(problem: CodingProblem, language: string): CodeTemplate {
  // Determine problem type and desired function signature
  const problemType = determineProblemType(problem);
  const sanitizedName = problem.title.replace(/\s+/g, '').toLowerCase();
  
  console.log(`Creating template for problem: ${problem.title}, type: ${problemType}`);
  
  // Get problem-specific template
  if (language === 'python') {
    return getPythonTemplate(problem, sanitizedName, problemType);
  } else {
    return getJavaScriptTemplate(problem, sanitizedName, problemType);
  }
}

// Helper to determine problem type based on description or title
function determineProblemType(problem: CodingProblem): string {
  const title = problem.title.toLowerCase();
  const description = problem.description.toLowerCase();
  const combinedText = `${title} ${description}`;
  
  // String validation problems (parentheses, brackets, etc.)
  if (title.includes('valid parentheses') || 
      description.includes('parentheses') || 
      description.includes('brackets') ||
      (description.includes('(') && description.includes(')') && description.includes('valid')) ||
      combinedText.includes('matching brackets') ||
      combinedText.includes('balanced brackets') ||
      (combinedText.includes('valid') && combinedText.includes('string') && combinedText.includes('check'))) {
    return 'string-validation';
  } 
  
  // Array problems with target (Two Sum, etc.)
  else if (title.includes('two sum') || 
           description.includes('indices of the two numbers') ||
           (combinedText.includes('array') && combinedText.includes('target') && combinedText.includes('sum')) ||
           (combinedText.includes('find') && combinedText.includes('indices') && combinedText.includes('target')) ||
           (combinedText.includes('nums') && combinedText.includes('target') && combinedText.includes('find'))) {
    return 'array-target';
  } 
  
  // Array-only problems (Maximum Subarray, etc.)
  else if (title.includes('maximum subarray') || 
           description.includes('maximum subarray') ||
           combinedText.includes('kadane') ||
           (combinedText.includes('maximum') && combinedText.includes('subarray')) ||
           (combinedText.includes('array') && combinedText.includes('contiguous') && combinedText.includes('sum')) ||
           (combinedText.includes('array') && combinedText.includes('maximum') && !combinedText.includes('target'))) {
    return 'array-only';
  } 
  
  // String processing problems
  else if ((combinedText.includes('string') && !combinedText.includes('array')) ||
           combinedText.includes('palindrome') || 
           combinedText.includes('anagram') ||
           combinedText.includes('characters') ||
           combinedText.includes('text') ||
           combinedText.includes('word')) {
    return 'string-only';
  }
  
  // Matrix problems
  else if (combinedText.includes('matrix') || 
           combinedText.includes('grid') || 
           combinedText.includes('2d array') ||
           (combinedText.includes('m×n') || combinedText.includes('m x n'))) {
    return 'matrix';
  }
  
  // Binary tree problems
  else if (combinedText.includes('binary tree') || 
           combinedText.includes('bst') || 
           combinedText.includes('tree traversal')) {
    return 'tree';
  }
  
  // Linked list problems
  else if (combinedText.includes('linked list') || 
           (combinedText.includes('node') && combinedText.includes('next'))) {
    return 'linked-list';
  }
  
  // Generic array problems (default)
  else if (combinedText.includes('array') || 
           combinedText.includes('list') || 
           combinedText.includes('elements') ||
           combinedText.includes('nums')) {
    // Further distinguish if it's a target problem
    if (combinedText.includes('target') || 
        (combinedText.includes('sum') && combinedText.includes('equal'))) {
      return 'array-target';
    } else {
      return 'array-only';
    }
  }
  
  // Default to array-only if we can't determine
  return 'array-only';
}

// Python template generator based on problem type
function getPythonTemplate(problem: CodingProblem, problemName: string, problemType: string): CodeTemplate {
  let functionSignature = '';
  let inputParsing = '';
  let resultHandling = '';
  
  // Configure based on problem type
  switch (problemType) {
    case 'array-target':
      functionSignature = `def solve_${problemName}(nums, target):`;
      inputParsing = `
    # Read input
    line = input().strip()
    parts = line.split('::')
    nums = list(map(int, parts[0][1:-1].split(',')))
    target = int(parts[1])
    
    # Solve the problem
    result = solve_${problemName}(nums, target)`;
      resultHandling = `
    # Print output
    print(" ".join(map(str, result)))`;
      break;
      
    case 'string-validation':
      functionSignature = `def solve_${problemName}(s):`;
      inputParsing = `
    # Read input (a string)
    s = input().strip()
    
    # Remove quotes if present
    if s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    
    # Solve the problem
    result = solve_${problemName}(s)`;
      resultHandling = `
    # Print output (boolean result as string)
    print(str(result).lower())`;
      break;
      
    case 'array-only':
      functionSignature = `def solve_${problemName}(nums):`;
      inputParsing = `
    # Read input
    line = input().strip()
    # Handle different input formats
    if '::' in line:
        nums_str = line.split('::')[0]
    else:
        nums_str = line
    # Remove brackets and parse
    nums = list(map(int, nums_str[1:-1].split(',')))
    
    # Solve the problem
    result = solve_${problemName}(nums)`;
      resultHandling = `
    # Print output
    print(result)`;
      break;
      
    case 'string-only':
      functionSignature = `def solve_${problemName}(s):`;
      inputParsing = `
    # Read input
    s = input().strip()
    
    # Remove quotes if present
    if s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    
    # Solve the problem
    result = solve_${problemName}(s)`;
      resultHandling = `
    # Print output
    print(result)`;
      break;
      
    case 'matrix':
      functionSignature = `def solve_${problemName}(matrix):`;
      inputParsing = `
    # Read input (a matrix/2D array)
    line = input().strip()
    # Remove outer brackets and split into rows
    matrix_str = line[1:-1].strip()
    # Parse the matrix
    matrix = []
    current_row = []
    current_num = ""
    parsing_array = False
    
    for char in matrix_str:
        if char == '[':
            if parsing_array:  # nested array
                current_num += char
            else:
                parsing_array = True
        elif char == ']':
            if current_num:
                current_row.append(int(current_num))
                current_num = ""
            if parsing_array:
                matrix.append(current_row)
                current_row = []
                parsing_array = False
        elif char == ',':
            if current_num:
                current_row.append(int(current_num))
                current_num = ""
        elif char.isdigit() or char == '-':
            current_num += char
    
    # Solve the problem
    result = solve_${problemName}(matrix)`;
      resultHandling = `
    # Print output
    if isinstance(result, list):
        if isinstance(result[0], list):
            # 2D result
            print('[' + ','.join(['[' + ','.join(map(str, row)) + ']' for row in result]) + ']')
        else:
            # 1D result
            print('[' + ','.join(map(str, result)) + ']')
    else:
        print(result)`;
      break;
      
    case 'tree':
      functionSignature = `def solve_${problemName}(root):`;
      inputParsing = `
    # Read input (a binary tree in level-order format)
    line = input().strip()
    
    # Parse the tree from level-order representation
    values = line.replace('[', '').replace(']', '').split(',')
    
    # TreeNode definition
    class TreeNode:
        def __init__(self, val=0, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right
    
    # Build the tree
    if not values or values[0] == 'null':
        root = None
    else:
        root = TreeNode(int(values[0]))
        queue = [root]
        i = 1
        while queue and i < len(values):
            node = queue.pop(0)
            
            # Left child
            if i < len(values) and values[i] != 'null':
                node.left = TreeNode(int(values[i]))
                queue.append(node.left)
            i += 1
            
            # Right child
            if i < len(values) and values[i] != 'null':
                node.right = TreeNode(int(values[i]))
                queue.append(node.right)
            i += 1
    
    # Solve the problem
    result = solve_${problemName}(root)`;
      resultHandling = `
    # Print output
    print(result)`;
      break;
      
    case 'linked-list':
      functionSignature = `def solve_${problemName}(head):`;
      inputParsing = `
    # Read input (a linked list in array format)
    line = input().strip()
    
    # Parse the linked list from array representation
    values = line.replace('[', '').replace(']', '').split(',')
    
    # ListNode definition
    class ListNode:
        def __init__(self, val=0, next=None):
            self.val = val
            self.next = next
    
    # Build the linked list
    dummy = ListNode(0)
    current = dummy
    
    for val in values:
        if val != 'null' and val.strip():
            current.next = ListNode(int(val.strip()))
            current = current.next
    
    head = dummy.next
    
    # Solve the problem
    result = solve_${problemName}(head)`;
      resultHandling = `
    # Print output
    if isinstance(result, ListNode):
        # Convert result back to array for printing
        result_array = []
        current = result
        while current:
            result_array.append(current.val)
            current = current.next
        print('[' + ','.join(map(str, result_array)) + ']')
    else:
        print(result)`;
      break;
      
    default:
      // Default to string input if we can't determine
      functionSignature = `def solve_${problemName}(s):`;
      inputParsing = `
    # Read input
    s = input().strip()
    
    # Solve the problem
    result = solve_${problemName}(s)`;
      resultHandling = `
    # Print output
    print(result)`;
      break;
  }
  
  // Function implementation (default placeholder)
  const functionBody = `
    # Write your solution here
    pass`;
  
  // Combine to create full template
  const template = `# ${problem.description}
#
# Example:
# Input:
# ${problem.testCases[0]?.input || ''}
#
# Output:
# ${problem.testCases[0]?.output || ''}

${functionSignature}${functionBody}

# --------- DO NOT MODIFY BELOW THIS LINE ----------
def main():${inputParsing}${resultHandling}

if __name__ == "__main__":
    main()`;
  
  // Create default implementation based on problem type
  let defaultCode = '';
  switch (problemType) {
    case 'array-target':
      defaultCode = `${functionSignature}
    # Create a dictionary to store values and their indices
    num_map = {}
    
    # Iterate through the array
    for i, num in enumerate(nums):
        # Calculate the complement
        complement = target - num
        
        # Check if complement exists in the map
        if complement in num_map:
            # Return indices of the pair
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    # No solution found
    return [-1, -1]`;
      break;
      
    case 'string-validation':
      defaultCode = `${functionSignature}
    # Initialize a stack to keep track of opening brackets
    stack = []
    
    # Define a mapping of closing brackets to their opening counterparts
    brackets_map = {
        ')': '(',
        '}': '{',
        ']': '['
    }
    
    # Iterate through each character in the string
    for char in s:
        # If character is a closing bracket
        if char in brackets_map:
            # Pop the top element from stack if not empty, else assign a dummy value
            top_element = stack.pop() if stack else '#'
            
            # Check if the popped element matches the corresponding opening bracket
            if brackets_map[char] != top_element:
                return False
        else:
            # If character is an opening bracket, push it onto the stack
            stack.append(char)
    
    # If stack is empty, all brackets were matched properly
    return len(stack) == 0`;
      break;
      
    case 'array-only':
      defaultCode = `${functionSignature}
    # Handle edge case of empty array
    if not nums:
        return 0
    
    # Initialize variables for maximum subarray tracking
    max_so_far = nums[0]
    current_max = nums[0]
    
    # Iterate through the array starting from the second element
    for i in range(1, len(nums)):
        # Update current_max to be either the current element or the sum
        current_max = max(nums[i], current_max + nums[i])
        
        # Update max_so_far if current_max becomes larger
        max_so_far = max(max_so_far, current_max)
    
    return max_so_far`;
      break;
      
    case 'string-only':
      defaultCode = `${functionSignature}
    # Handle edge case of empty string
    if not s:
        return ""
    
    # Example implementation for string processing
    # This is a generic template - modify according to specific problem
    
    # For palindrome check:
    # return s == s[::-1]
    
    # For character counting:
    # char_count = {}
    # for char in s:
    #     char_count[char] = char_count.get(char, 0) + 1
    # return char_count
    
    # Default implementation (customize as needed)
    return s`;
      break;
      
    case 'matrix':
      defaultCode = `${functionSignature}
    # Handle edge cases
    if not matrix or not matrix[0]:
        return []
    
    # Get dimensions
    rows, cols = len(matrix), len(matrix[0])
    
    # Example implementation for matrix traversal
    result = []
    
    # Sample traversal (spiral order)
    top, bottom = 0, rows - 1
    left, right = 0, cols - 1
    
    while top <= bottom and left <= right:
        # Traverse right
        for j in range(left, right + 1):
            result.append(matrix[top][j])
        top += 1
        
        # Traverse down
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        # Traverse left
        if top <= bottom:
            for j in range(right, left - 1, -1):
                result.append(matrix[bottom][j])
            bottom -= 1
        
        # Traverse up
        if left <= right:
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
    
    return result`;
      break;
      
    case 'tree':
      defaultCode = `${functionSignature}
    # Handle edge case of empty tree
    if not root:
        return []
    
    # Example implementation for tree traversal (in-order)
    def in_order_traversal(node, result):
        if not node:
            return
        
        in_order_traversal(node.left, result)
        result.append(node.val)
        in_order_traversal(node.right, result)
    
    result = []
    in_order_traversal(root, result)
    return result`;
      break;
      
    case 'linked-list':
      defaultCode = `${functionSignature}
    # Handle edge case of empty list
    if not head:
        return None
    
    # Example implementation for linked list traversal
    current = head
    result = []
    
    while current:
        result.append(current.val)
        current = current.next
    
    # For problems requiring to return a modified list
    # This is just a placeholder implementation
    return head`;
      break;
      
    default:
      defaultCode = `${functionSignature}
    # Handle edge case of empty input
    if not s:
        return ""
        
    # Default implementation (replace with appropriate solution)
    return s`;
      break;
  }
  
  // Calculate read-only ranges
  const templateLines = template.split('\n');
  const firstEditableLine = templateLines.indexOf(functionSignature) + 1;
  const lastEditableLine = templateLines.findIndex(line => line.startsWith('# ---------'));
  
  return {
    template,
    defaultCode,
    readOnlyRanges: [[1, firstEditableLine - 1], [lastEditableLine, templateLines.length]] as Array<[number, number]>,
    startingLine: firstEditableLine,
    endLine: lastEditableLine - 1
  };
}

// JavaScript template generator based on problem type
function getJavaScriptTemplate(problem: CodingProblem, problemName: string, problemType: string): CodeTemplate {
  let functionSignature = '';
  let inputParsing = '';
  let resultHandling = '';
  
  switch (problemType) {
    case 'array-target':
      functionSignature = `function solve_${problemName}(nums, target) {`;
      inputParsing = `
    // Read input
    const line = readline().trim();
    const parts = line.split('::');
    const nums = JSON.parse(parts[0]);
    const target = parseInt(parts[1], 10);
    
    // Solve the problem
    const result = solve_${problemName}(nums, target);`;
      resultHandling = `
    // Print output
    console.log(result.join(' '));`;
      break;
      
    case 'string-validation':
      functionSignature = `function solve_${problemName}(s) {`;
      inputParsing = `
    // Read input (a string)
    let s = readline().trim();
    
    // Remove quotes if present
    if (s.startsWith('"') && s.endsWith('"')) {
        s = s.substring(1, s.length - 1);
    }
    
    // Solve the problem
    const result = solve_${problemName}(s);`;
      resultHandling = `
    // Print output (boolean result as string)
    console.log(result.toString().toLowerCase());`;
      break;
      
    case 'array-only':
      functionSignature = `function solve_${problemName}(nums) {`;
      inputParsing = `
    // Read input
    const line = readline().trim();
    // Handle different input formats
    let numsStr;
    if (line.includes('::')) {
        numsStr = line.split('::')[0];
    } else {
        numsStr = line;
    }
    // Parse JSON array
    const nums = JSON.parse(numsStr);
    
    // Solve the problem
    const result = solve_${problemName}(nums);`;
      resultHandling = `
    // Print output
    console.log(result);`;
      break;
      
    case 'string-only':
      functionSignature = `function solve_${problemName}(s) {`;
      inputParsing = `
    // Read input
    let s = readline().trim();
    
    // Remove quotes if present
    if (s.startsWith('"') && s.endsWith('"')) {
        s = s.substring(1, s.length - 1);
    }
    
    // Solve the problem
    const result = solve_${problemName}(s);`;
      resultHandling = `
    // Print output
    console.log(result);`;
      break;
      
    case 'matrix':
      functionSignature = `function solve_${problemName}(matrix) {`;
      inputParsing = `
    // Read input (a matrix/2D array)
    const line = readline().trim();
    // Parse the JSON matrix
    const matrix = JSON.parse(line);
    
    // Solve the problem
    const result = solve_${problemName}(matrix);`;
      resultHandling = `
    // Print output
    if (Array.isArray(result)) {
        if (Array.isArray(result[0])) {
            // 2D result
            console.log(JSON.stringify(result));
        } else {
            // 1D result
            console.log(JSON.stringify(result));
        }
    } else {
        console.log(result);
    }`;
      break;
      
    case 'tree':
      functionSignature = `function solve_${problemName}(root) {`;
      inputParsing = `
    // Read input (a binary tree in level-order format)
    const line = readline().trim();
    
    // TreeNode definition
    class TreeNode {
        constructor(val = 0, left = null, right = null) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }
    
    // Parse the tree from level-order representation
    const values = line.replace('[', '').replace(']', '').split(',');
    
    // Build the tree
    let root = null;
    if (values.length > 0 && values[0] !== 'null') {
        root = new TreeNode(parseInt(values[0], 10));
        const queue = [root];
        let i = 1;
        while (queue.length > 0 && i < values.length) {
            const node = queue.shift();
            
            // Left child
            if (i < values.length && values[i] !== 'null') {
                node.left = new TreeNode(parseInt(values[i], 10));
                queue.push(node.left);
            }
            i++;
            
            // Right child
            if (i < values.length && values[i] !== 'null') {
                node.right = new TreeNode(parseInt(values[i], 10));
                queue.push(node.right);
            }
            i++;
        }
    }
    
    // Solve the problem
    const result = solve_${problemName}(root);`;
      resultHandling = `
    // Print output
    console.log(result);`;
      break;
      
    case 'linked-list':
      functionSignature = `function solve_${problemName}(head) {`;
      inputParsing = `
    // Read input (a linked list in array format)
    const line = readline().trim();
    
    // ListNode definition
    class ListNode {
        constructor(val = 0, next = null) {
            this.val = val;
            this.next = next;
        }
    }
    
    // Parse the linked list from array representation
    const values = line.replace('[', '').replace(']', '').split(',');
    
    // Build the linked list
    const dummy = new ListNode(0);
    let current = dummy;
    
    for (const val of values) {
        if (val !== 'null' && val.trim()) {
            current.next = new ListNode(parseInt(val.trim(), 10));
            current = current.next;
        }
    }
    
    const head = dummy.next;
    
    // Solve the problem
    const result = solve_${problemName}(head);`;
      resultHandling = `
    // Print output
    if (result instanceof ListNode) {
        // Convert result back to array for printing
        const resultArray = [];
        let current = result;
        while (current) {
            resultArray.push(current.val);
            current = current.next;
        }
        console.log(JSON.stringify(resultArray));
    } else {
        console.log(result);
    }`;
      break;
      
    default:
      // Default to string input if we can't determine
      functionSignature = `function solve_${problemName}(s) {`;
      inputParsing = `
    // Read input
    const s = readline().trim();
    
    // Solve the problem
    const result = solve_${problemName}(s);`;
      resultHandling = `
    // Print output
    console.log(result);`;
      break;
  }
  
  // Function implementation (default placeholder)
  const functionBody = `
    // Write your solution here
    return null;`;
  
  // Combine to create full template
  const template = `/**
 * ${problem.description}
 *
 * Example:
 * Input:
 * ${problem.testCases[0]?.input || ''}
 *
 * Output:
 * ${problem.testCases[0]?.output || ''}
 */

${functionSignature}${functionBody}}

// --------- DO NOT MODIFY BELOW THIS LINE ----------
function main() {${inputParsing}${resultHandling}}

// Helper function to read input
function readline() {
    return "";
}

// Execute the solution
main();`;
  
  // Create default implementation based on problem type
  let defaultCode = '';
  switch (problemType) {
    case 'array-target':
      defaultCode = `${functionSignature}
    // Create a map to store values and their indices
    const numMap = new Map();
    
    // Iterate through the array
    for (let i = 0; i < nums.length; i++) {
        // Calculate the complement
        const complement = target - nums[i];
        
        // Check if complement exists in the map
        if (numMap.has(complement)) {
            // Return indices of the pair
            return [numMap.get(complement), i];
        }
        
        // Store current number and its index
        numMap.set(nums[i], i);
    }
    
    // No solution found
    return [-1, -1];
}`;
      break;
      
    case 'string-validation':
      defaultCode = `${functionSignature}
    // Initialize a stack to keep track of opening brackets
    const stack = [];
    
    // Define a mapping of closing brackets to their opening counterparts
    const bracketsMap = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    // Iterate through each character in the string
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        
        // If character is a closing bracket
        if (char in bracketsMap) {
            // Pop the top element from stack if not empty, else assign a dummy value
            const topElement = stack.length ? stack.pop() : '#';
            
            // Check if the popped element matches the corresponding opening bracket
            if (bracketsMap[char] !== topElement) {
                return false;
            }
        } else {
            // If character is an opening bracket, push it onto the stack
            stack.push(char);
        }
    }
    
    // If stack is empty, all brackets were matched properly
    return stack.length === 0;
}`;
      break;
      
    case 'array-only':
      defaultCode = `${functionSignature}
    // Handle edge case of empty array
    if (nums.length === 0) {
        return 0;
    }
    
    // Initialize variables for maximum subarray tracking
    let maxSoFar = nums[0];
    let currentMax = nums[0];
    
    // Iterate through the array starting from the second element
    for (let i = 1; i < nums.length; i++) {
        // Update currentMax to be either the current element or the sum
        currentMax = Math.max(nums[i], currentMax + nums[i]);
        
        // Update maxSoFar if currentMax becomes larger
        maxSoFar = Math.max(maxSoFar, currentMax);
    }
    
    return maxSoFar;
}`;
      break;
      
    case 'string-only':
      defaultCode = `${functionSignature}
    // Handle edge case of empty string
    if (!s) {
        return "";
    }
    
    // Example implementation for string processing
    // This is a generic template - modify according to specific problem
    
    // For palindrome check:
    // return s === s.split('').reverse().join('');
    
    // For character counting:
    // const charCount = {};
    // for (const char of s) {
    //     charCount[char] = (charCount[char] || 0) + 1;
    // }
    // return charCount;
    
    // Default implementation (customize as needed)
    return s;
}`;
      break;
      
    case 'matrix':
      defaultCode = `${functionSignature}
    // Handle edge cases
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        return [];
    }
    
    // Get dimensions
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Example implementation for matrix traversal
    const result = [];
    
    // Sample traversal (spiral order)
    let top = 0, bottom = rows - 1;
    let left = 0, right = cols - 1;
    
    while (top <= bottom && left <= right) {
        // Traverse right
        for (let j = left; j <= right; j++) {
            result.push(matrix[top][j]);
        }
        top++;
        
        // Traverse down
        for (let i = top; i <= bottom; i++) {
            result.push(matrix[i][right]);
        }
        right--;
        
        // Traverse left
        if (top <= bottom) {
            for (let j = right; j >= left; j--) {
                result.push(matrix[bottom][j]);
            }
            bottom--;
        }
        
        // Traverse up
        if (left <= right) {
            for (let i = bottom; i >= top; i--) {
                result.push(matrix[i][left]);
            }
            left++;
        }
    }
    
    return result;
}`;
      break;
      
    case 'tree':
      defaultCode = `${functionSignature}
    // Handle edge case of empty tree
    if (!root) {
        return [];
    }
    
    // Example implementation for tree traversal (in-order)
    function inOrderTraversal(node, result) {
        if (!node) {
            return;
        }
        
        inOrderTraversal(node.left, result);
        result.push(node.val);
        inOrderTraversal(node.right, result);
    }
    
    const result = [];
    inOrderTraversal(root, result);
    return result;
}`;
      break;
      
    case 'linked-list':
      defaultCode = `${functionSignature}
    // Handle edge case of empty list
    if (!head) {
        return null;
    }
    
    // Example implementation for linked list traversal
    let current = head;
    const result = [];
    
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    
    // For problems requiring to return a modified list
    // This is just a placeholder implementation
    return head;
}`;
      break;
      
    default:
      defaultCode = `${functionSignature}
    // Handle edge case of empty input
    if (!s) {
        return "";
    }
        
    // Default implementation (replace with appropriate solution)
    return s;
}`;
      break;
  }
  
  // Calculate read-only ranges
  const templateLines = template.split('\n');
  const firstEditableLine = templateLines.indexOf(functionSignature) + 1;
  const lastEditableLine = templateLines.findIndex(line => line.includes('// ---------'));
  
  return {
    template,
    defaultCode,
    readOnlyRanges: [[1, firstEditableLine - 1], [lastEditableLine, templateLines.length]] as Array<[number, number]>,
    startingLine: firstEditableLine,
    endLine: lastEditableLine - 1
  };
}

async function executePythonCode(code: string, testInput: string): Promise<string> {
  try {
    console.log('Executing Python code with input:', testInput);
    
    // Parse input format to match CodeChef format
    let formattedInput = testInput;
    if (testInput.includes('=')) {
      // Convert from LeetCode-style format "nums = [2,7,11,15], target = 9"
      // to CodeChef format "[2,7,11,15] 9"
      const numsMatch = testInput.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = testInput.match(/target\s*=\s*(\d+)/);
      
      if (numsMatch && targetMatch) {
        formattedInput = `${numsMatch[1]} ${targetMatch[1]}`;
      }
    }
    
    console.log('Formatted input for CodeChef format:', formattedInput);
    
    // Simulate Python environment in JavaScript
    // Create a complete function that takes the code and input
    const execFunc = new Function(`
      try {
        // Python builtin functions to simulate
        function input() {
          return "${formattedInput}";
        }
        function print(value) {
          return value;
        }
        function map(func, iterable) {
          return Array.from(iterable).map(func);
        }
        function str(value) {
          return String(value);
        }
        function int(value) {
          return parseInt(value);
        }
        function list(iterable) {
          return Array.from(iterable);
        }
        
        // Create a mock console.log to capture output
        let capturedOutput = null;
        const originalConsoleLog = console.log;
        console.log = function(...args) {
          capturedOutput = args.join(' ');
          originalConsoleLog.apply(console, args);
        };
        
        // Convert Python code to JavaScript
        let jsCode = \`${code}\`.replace(/def\\s+solve_\\w+\\(([^)]+)\\):/g, 'function solve_$1) {')
          .replace(/for\\s+(\\w+),\\s*(\\w+)\\s+in\\s+enumerate\\((\\w+)\\):/g, 'for (let [$2, $1] of $3.entries()) {')
          .replace(/if\\s+(.+?)\\s+in\\s+(.+?):/g, 'if ($2.hasOwnProperty($1)) {')
          .replace(/^\\s*pass\\s*$/gm, '/* pass */')
          .replace(/\\bmap\\(int, ([^)]+)\\)/g, 'Array.from($1).map(x => parseInt(x))')
          .replace(/input\\(\\)\\.strip\\(\\)/g, 'input().trim()')
          .replace(/print\\(([^)]+)\\)/g, 'console.log($1)')
          .replace(/if\\s+__name__\\s*==\\s*"__main__":/g, 'function __main__() {')
          .replace(/\\bNone\\b/g, 'null')
          .replace(/\\bTrue\\b/g, 'true')
          .replace(/\\bFalse\\b/g, 'false');
        
        // Execute the code
        eval(jsCode);
        
        // Run the main function
        if (typeof main === 'function') {
          main();
        } else if (typeof __main__ === 'function') {
          __main__();
        } else {
          // If no main function, try to call the solve function directly
          const solveFunctionMatches = /def\\s+(solve_\\w+)\\(/.exec(\`${code}\`);
          if (solveFunctionMatches && solveFunctionMatches[1]) {
            const solveFunctionName = solveFunctionMatches[1];
            const parts = "${formattedInput}".split(' ');
            const numsStr = parts[0];
            const target = parseInt(parts[1]);
            const nums = JSON.parse(numsStr);
            
            // Call the solve function with parsed inputs
            const result = eval(solveFunctionName)(nums, target);
            console.log(Array.isArray(result) ? result.join(' ') : result);
          }
        }
        
        // Restore console.log
        console.log = originalConsoleLog;
        
        return capturedOutput;
      } catch (e) {
        console.error("Python execution error:", e);
        return "Error: " + e.message;
      }
    `);
    
    const result = execFunc();
    console.log('Python execution result:', result);
    
    return result || '';
  } catch (error) {
    console.error('Python execution error:', error);
    throw new Error(`Execution error: ${error.message}`);
  }
}

async function executeJavaScriptCode(code: string, testInput: string): Promise<string> {
  try {
    console.log('Executing JavaScript code with input:', testInput);
    
    // Parse input format to match CodeChef format
    let formattedInput = testInput;
    if (testInput.includes('=')) {
      // Convert from LeetCode-style format "nums = [2,7,11,15], target = 9"
      // to CodeChef format "[2,7,11,15] 9"
      const numsMatch = testInput.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = testInput.match(/target\s*=\s*(\d+)/);
      
      if (numsMatch && targetMatch) {
        formattedInput = `${numsMatch[1]} ${targetMatch[1]}`;
      }
    }
    
    console.log('Formatted input for CodeChef format:', formattedInput);
    
    // Create a function to execute the JS code with the simulated stdin/stdout
    const execFunc = new Function(`
      try {
        // Create a mock process object
        const process = {
          stdin: {
            resume: function() {},
            setEncoding: function() {},
            on: function(event, callback) {
              if (event === 'data') {
                callback("${formattedInput}");
              } else if (event === 'end') {
                callback();
              }
            }
          },
          stdout: {
            write: function(data) {
              return data;
            }
          }
        };
        
        // Create a mock console to capture output
        let capturedOutput = null;
        const originalConsoleLog = console.log;
        console.log = function(...args) {
          capturedOutput = args.join(' ');
          originalConsoleLog.apply(console, args);
        };
        
        // Extract the solve function
        ${code}
        
        // Restore console.log
        console.log = originalConsoleLog;
        
        return capturedOutput;
      } catch (e) {
        console.error("JavaScript execution error:", e);
        return "Error: " + e.message;
      }
    `);
    
    const result = execFunc();
    console.log('JavaScript execution result:', result);
    
    return result || '';
  } catch (error) {
    console.error('JavaScript execution error:', error);
    throw new Error(`Execution error: ${error.message}`);
  }
}

// Function to compare expected and actual output, normalizing strings, arrays, and other data types
function compareOutputs(expected: string, actual: string): boolean {
  console.log('Comparing:', { expected, actual });
  
  // Handle null/undefined values
  if (!expected && !actual) return true;
  if (!expected || !actual) return false;
  
  // Normalize both strings by removing whitespace and converting to lowercase
  const normalizeString = (str: string) => str.replace(/\s+/g, '').toLowerCase();
  
  // First try direct string comparison after normalization
  if (normalizeString(expected) === normalizeString(actual)) {
    return true;
  }
  
  // Try parsing as JSON if it looks like an array or object
  try {
    if ((expected.startsWith('[') && expected.endsWith(']')) ||
        (expected.startsWith('{') && expected.endsWith('}'))) {
      
      // Parse both as JSON if possible, replacing single quotes with double quotes
      let expectedJson;
      let actualJson;
      
      try {
        expectedJson = JSON.parse(expected.replace(/'/g, '"'));
      } catch (e) {
        // If expected can't be parsed directly, try normalizing it
        try {
          expectedJson = JSON.parse(normalizeString(expected).replace(/'/g, '"'));
        } catch (e2) {
          console.log('Failed to parse expected JSON:', e2);
          return false;
        }
      }
      
      try {
        actualJson = JSON.parse(actual.replace(/'/g, '"'));
      } catch (e) {
        // If actual can't be parsed, try to normalize it first
        try {
          actualJson = JSON.parse(normalizeString(actual).replace(/'/g, '"'));
        } catch (e2) {
          console.log('Failed to parse actual JSON:', e2);
          return false;
        }
      }
      
      // For arrays, check if they have the same elements regardless of order
      if (Array.isArray(expectedJson) && Array.isArray(actualJson)) {
        if (expectedJson.length !== actualJson.length) {
          return false;
        }
        
        // Special case for arrays of arrays (like the 3Sum problem)
        if (expectedJson.length > 0 && Array.isArray(expectedJson[0])) {
          // Sort inner arrays and then compare
          const sortedExpected = expectedJson.map(arr => Array.isArray(arr) ? [...arr].sort((a, b) => a - b) : arr).sort();
          const sortedActual = actualJson.map(arr => Array.isArray(arr) ? [...arr].sort((a, b) => a - b) : arr).sort();
          
          const expectedStr = JSON.stringify(sortedExpected);
          const actualStr = JSON.stringify(sortedActual);
          
          return expectedStr === actualStr;
        }
        
        // For simple arrays, sort and compare
        const sortedExpected = [...expectedJson].sort((a, b) => a - b);
        const sortedActual = [...actualJson].sort((a, b) => a - b);
        
        const expectedStr = JSON.stringify(sortedExpected);
        const actualStr = JSON.stringify(sortedActual);
        
        return expectedStr === actualStr;
      }
      
      // For objects, compare stringified versions
      return JSON.stringify(expectedJson) === JSON.stringify(actualJson);
    }
  } catch (error) {
    console.log('Error parsing JSON:', error);
  }
  
  // Handle "true" and "false" string comparisons
  if (expected.toLowerCase() === "true" || expected.toLowerCase() === "false") {
    return expected.toLowerCase() === actual.toLowerCase();
  }
  
  // Handle numeric comparisons
  if (!isNaN(Number(expected)) && !isNaN(Number(actual))) {
    return Number(expected) === Number(actual);
  }
  
  // If all else fails, try a more lenient string comparison
  // Remove all whitespace, quotes, brackets and compare
  const strictNormalize = (str: string) => 
    str.replace(/\s+/g, '')
       .replace(/["']/g, '')
       .replace(/[\[\]{}()]/g, '')
       .toLowerCase();
       
  return strictNormalize(expected) === strictNormalize(actual);
}

export default function CodeBuddy() {
  // Create a fallback problem in case mockProblems is empty or undefined
  const fallbackProblem: CodingProblem = {
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
  };

  // Initialize with fallback if mockProblems is empty
  const initialProblem = (mockProblems && mockProblems.length > 0) ? mockProblems[0] : fallbackProblem;
  
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(initialProblem);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [solution, setSolution] = useState('');
  const [codeTemplate, setCodeTemplate] = useState<CodeTemplate | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Log mock problems data immediately
  console.log('Available mockProblems:', mockProblems);
  console.log('Initial selected problem:', selectedProblem);
  console.log('Fallback problem:', fallbackProblem);

  // Initialize the problem and template when the component mounts
  useEffect(() => {
    console.log('Component mounted, mockProblems:', mockProblems);
    
    const probToUse = (mockProblems && mockProblems.length > 0) ? mockProblems[0] : fallbackProblem;
    console.log('Using problem:', probToUse);
    
    setSelectedProblem(probToUse);
    
    if (probToUse) {
      const template = getCodeTemplate(probToUse, selectedLanguage);
      console.log('Initial template:', template);
      setCodeTemplate(template);
      setSolution(template.defaultCode);
    }
  }, []);

  // Update template when problem or language changes
  useEffect(() => {
    if (selectedProblem) {
      const template = getCodeTemplate(selectedProblem, selectedLanguage);
      setCodeTemplate(template);
      
      const savedSolution = localStorage.getItem(`codeBuddySolution_${selectedProblem.id}`);
      if (savedSolution) {
        setSolution(savedSolution);
      } else {
        setSolution(template.defaultCode);
      }
    }
  }, [selectedProblem, selectedLanguage]);

  // Special handling for Two Sum problem during test execution
  const isTwoSumProblem = (problem: CodingProblem) => {
    return problem.id === 'two-sum' || problem.title.toLowerCase().includes('two sum');
  };

  // Completely standalone test runner function that doesn't rely on imports
  const directExecuteTest = async () => {
    console.log('Starting test execution with problem:', selectedProblem?.id);
    
    if (!selectedProblem) {
      console.error('Missing problem - falling back to default problem');
      setSelectedProblem(fallbackProblem);
      
      // Show error in the UI
      setTestResults({
        success: false,
        results: [{
          passed: false,
          input: "",
          expected: "",
          actual: "Problem not found - Using fallback problem. Please try again.",
          time: "0ms"
        }]
      });
      
      return;
    }
    
    // For debugging - verify the problem being used
    console.log('Using problem for test execution:', selectedProblem);
    
    if (!solution) {
      console.error('Missing solution');
      
      // Show error in the UI
      setTestResults({
        success: false,
        results: [{
          passed: false,
          input: "",
          expected: "",
          actual: "Missing solution code",
          time: "0ms"
        }]
      });
      
      return;
    }
    
    if (!selectedProblem.testCases || selectedProblem.testCases.length === 0) {
      console.error('No test cases found for problem:', selectedProblem.id);
      
      // Show error in the UI
      setTestResults({
        success: false,
        results: [{
          passed: false,
          input: "",
          expected: "",
          actual: "No test cases found for this problem",
          time: "0ms"
        }]
      });
      
      return;
    }
    
    setIsRunning(true);
    setTestResults(null);
    
    try {
      // Use the first test case
      const testCase = selectedProblem.testCases[0];
      console.log('Using test case:', testCase);

      // Special case for Two Sum problem to ensure input is correctly formatted
      let codechefInput = testCase.input;
      const numsMatch = testCase.input.match(/nums\s*=\s*(\[.*?\])/);
      const targetMatch = testCase.input.match(/target\s*=\s*(\d+)/);
      
      if (numsMatch && targetMatch) {
        codechefInput = `${numsMatch[1]} ${targetMatch[1]}`;
        console.log('Converted to CodeChef format input:', codechefInput);
      } else {
        console.warn('Could not parse input in the expected format. Using as-is:', testCase.input);
      }
      
      // Prepare the expected output in CodeChef format
      let codechefExpectedOutput = testCase.output;
      try {
        // Try to convert LeetCode format [0,1] to CodeChef format 0 1
        const parsedOutput = JSON.parse(testCase.output);
        if (Array.isArray(parsedOutput)) {
          codechefExpectedOutput = parsedOutput.join(' ');
          console.log('Converted output to space-separated format:', codechefExpectedOutput);
        }
      } catch (e) {
        // If not a valid JSON, keep as is
        console.log('Could not parse output as JSON, keeping as is:', testCase.output);
      }
      
      console.log('Expected output in CodeChef format:', codechefExpectedOutput);
      
      // Create a complete program with the user's solution
      // Use a sanitized title that works for CodeChef naming conventions
      const problemTitle = selectedProblem.title.replace(/\s+/g, '');
      let fullCode = '';
      
      if (selectedLanguage === 'javascript') {
        fullCode = `
function solve${problemTitle}(nums, target) {
${solution}
}

// Process input and call the solution
function processData(input) {
  try {
    console.log("Processing input:", input);
    // Parse input
    const parts = input.trim().split(' ');
    if (parts.length < 2) {
      console.error("Invalid input format. Expected '[nums] target'");
      return;
    }
    
    let nums;
    try {
      nums = JSON.parse(parts[0]);
    } catch (e) {
      console.error("Failed to parse nums array:", e);
      return;
    }
    
    const target = parseInt(parts[1]);
    if (isNaN(target)) {
      console.error("Target is not a valid number");
      return;
    }
    
    console.log("Parsed input:", { nums, target });
    
    // Solve the problem
    const result = solve${problemTitle}(nums, target);
    console.log("Solution result:", result);
    
    // Print output
    console.log(Array.isArray(result) ? result.join(' ') : result);
  } catch (e) {
    console.error("Error in processData:", e);
  }
}

// Simulate input
const input_string = "${codechefInput}";
processData(input_string);
`;
      } else {
        fullCode = `
def solve_${problemTitle.toLowerCase()}(nums, target):
${solution}

# Process input and call the solution
def main():
  try:
    # Parse input
    parts = input().strip().split()
    if len(parts) < 2:
      print("Invalid input format. Expected '[nums] target'")
      return
      
    nums_str = parts[0]
    # Remove brackets for parsing
    nums_content = nums_str[1:-1] if nums_str.startswith('[') and nums_str.endswith(']') else nums_str
    nums = [int(x) for x in nums_content.split(',')] if nums_content else []
    
    target = int(parts[1])
    
    # Call solution
    result = solve_${problemTitle.toLowerCase()}(nums, target)
    
    # Print output
    if isinstance(result, list):
      print(" ".join(map(str, result)))
    else:
      print(result)
  except Exception as e:
    print(f"Error in main: {str(e)}")

# Simulate input
input = lambda: "${codechefInput}"
main()
`;
      }
      
      console.log('Executing full code:', fullCode);
      
      // Execute the code
      let executionResult;
      try {
        if (selectedLanguage === 'javascript') {
          executionResult = await executeJavaScriptCode(fullCode, codechefInput);
        } else {
          executionResult = await executePythonCode(fullCode, codechefInput);
        }
        
        console.log('Execution result:', executionResult);
        
        // Check if we got a valid result
        if (!executionResult || executionResult.includes('Error:')) {
          throw new Error(executionResult || 'Execution failed with no output');
        }
        
        // Compare the result with expected output
        const outputMatches = compareOutputs(codechefExpectedOutput, executionResult);
        console.log(`Comparing output: '${executionResult.trim()}' === '${codechefExpectedOutput.trim()}' => ${outputMatches}`);
        
        // Set test results
        setTestResults({
          success: outputMatches,
          results: [{
            passed: outputMatches,
            input: testCase.input,
            expected: testCase.output,
            actual: executionResult,
            time: "1ms"
          }]
        });
      } catch (error) {
        console.error('Code execution error:', error);
        setTestResults({
          success: false,
          results: [{
            passed: false,
            input: testCase.input, 
            expected: testCase.output,
            actual: `Error: ${error.message}`,
            time: "0ms"
          }]
        });
      }
    } catch (error) {
      console.error('Test runner error:', error);
      setTestResults({
        success: false,
        results: [{
          passed: false,
          input: selectedProblem.testCases[0]?.input || "",
          expected: selectedProblem.testCases[0]?.output || "",
          actual: `Error: ${error.message}`,
          time: "0ms"
        }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Update the component's return statement to log problems and handle fallback better
  console.log('Rendering CodeBuddy component, mockProblems:', mockProblems);
  console.log('Current selectedProblem:', selectedProblem);
  
  // Before returning UI, ensure we have a valid problem
  useEffect(() => {
    if (!selectedProblem) {
      console.log('No problem selected, using fallback');
      setSelectedProblem(fallbackProblem);
    }
  }, [selectedProblem]);

  // Update the problem selection handler to handle case where problem is not found
  const handleProblemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const problemId = e.target.value;
    console.log('Trying to select problem ID:', problemId);
    const problem = mockProblems.find(p => p.id === problemId);
    
    if (problem) {
      console.log('Found problem:', problem);
      setSelectedProblem(problem);
    } else {
      console.warn('Problem not found with ID:', problemId, 'using fallback');
      setSelectedProblem(fallbackProblem);
    }
    
    setTestResults(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center">
        <select 
          value={selectedProblem?.id || ''} 
          onChange={handleProblemChange}
          className="p-2 rounded border border-gray-300"
        >
          {[...mockProblems, fallbackProblem].map(problem => (
            <option key={problem.id} value={problem.id}>
              {problem.title} - {problem.difficulty}
            </option>
          ))}
        </select>
        
        <select
          value={selectedLanguage}
          onChange={(e) => {
            setSelectedLanguage(e.target.value);
            setTestResults(null);
          }}
          className="p-2 rounded border border-gray-300"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        <button
          onClick={() => directExecuteTest()}
          disabled={isRunning || !selectedProblem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      {selectedProblem && (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 text-white p-4 rounded">
            <h2 className="text-xl font-bold mb-2">{selectedProblem.title}</h2>
            <p className="mb-2">{selectedProblem.description}</p>
            <div className="text-sm">
              <p>Difficulty: {selectedProblem.difficulty}</p>
              <p>Acceptance Rate: {selectedProblem.acceptanceRate}%</p>
              <div className="mt-2">
                <span className="font-medium">Tags:</span> {selectedProblem.tags.join(', ')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded">
              <Editor
                value={solution}
                onChange={setSolution}
                language={selectedLanguage}
                readOnlyRanges={codeTemplate?.readOnlyRanges || []}
                template={codeTemplate?.template || ''}
                startingLine={codeTemplate?.startingLine || 1}
                endLine={codeTemplate?.endLine || 1}
              />
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800 text-white p-4 rounded">
                <h3 className="text-lg font-bold mb-2">Example Test Cases</h3>
                <div className="space-y-2">
                  {selectedProblem.testCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded">
                      <div><span className="font-medium">Input:</span> {testCase.input}</div>
                      <div><span className="font-medium">Output:</span> {testCase.output}</div>
                      <div className="text-gray-400 text-sm mt-1">{testCase.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {testResults && (
                <div className="mt-5 p-4 space-y-3">
                  <h3 className="text-lg font-medium mb-2">
                    {testResults.success ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 className="mr-2" size={20} />
                        All Tests Passed!
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center">
                        <XCircle className="mr-2" size={20} />
                        Some Tests Failed
                      </span>
                    )}
                  </h3>

                  <div className="space-y-4">
                    {testResults.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          result.passed ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700" : 
                                         "bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {result.passed ? (
                              <CheckCircle className="text-green-500 mr-2" size={18} />
                            ) : (
                              <XCircle className="text-red-500 mr-2" size={18} />
                            )}
                            <span className="font-medium">Test Case {index + 1}</span>
                          </div>
                          {result.time && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Timer className="mr-1" size={14} />
                              {result.time}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                              {result.input}
                            </pre>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                              {result.expected}
                            </pre>
                          </div>
                          
                          <div className="text-sm">
                            <span className={`font-medium ${result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              Your Output:
                            </span>
                            <pre className={`mt-1 p-2 rounded text-xs overflow-x-auto ${
                              result.passed 
                                ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" 
                                : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                            }`}>
                              {result.actual}
                            </pre>
                            
                            {!result.passed && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <p>
                                  <strong>Note:</strong> Make sure your output format matches exactly. 
                                  Check for spaces, brackets, and commas.
                                </p>
                                <p className="mt-1">
                                  <strong>Tip:</strong> Try using the compareOutputs function which normalizes both outputs.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {testResults.stats && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
                          <span className="ml-1 font-medium">{testResults.stats.totalTests}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Passed:</span>
                          <span className="ml-1 font-medium">{testResults.stats.passedTests}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Execution Time:</span>
                          <span className="ml-1 font-medium">{testResults.stats.executionTime}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Memory Used:</span>
                          <span className="ml-1 font-medium">{testResults.stats.memoryUsed}KB</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-gray-800 text-white p-4 rounded">
                <h3 className="text-lg font-bold mb-2">Hints</h3>
                <p className="text-gray-300">
                  {selectedProblem.id === 'two-sum' ? (
                    <>Use a hash map/dictionary to store values you've seen and their indices.</>
                  ) : selectedProblem.id === 'palindrome-number' ? (
                    <>Convert to string and check, or reverse the digits without string conversion.</>
                  ) : (
                    <>Try breaking down the problem into smaller steps.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 