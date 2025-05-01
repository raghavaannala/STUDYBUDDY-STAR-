# CodeDiplomate: AI-Powered Code Generation System

## Table of Contents
1. Introduction  
    1.1 Overview  
    1.2 Project Scope  
2. System Requirements  
    2.1 Software Requirements  
    2.2 Hardware Requirements  
3. Implementation  
    3.1 Project Code  
4. Output Snippets of Project  
5. Conclusion  
6. References  

---

### 1. **Introduction**

#### 1.1 **Overview**
CodeDiplomate is an AI-powered code generation tool integrated with StudyBuddy. It utilizes **Google's Generative AI (Gemini Pro)** to generate code from natural language descriptions, provide code explanations, and suggest improvements. The system aims to assist students and developers by improving their understanding of code and reducing the effort needed to write and debug code. The key functionalities of CodeDiplomate are:
- **Code Generation**: Converts natural language prompts into functional code with complexity analysis
- **Code Explanation**: Provides detailed analysis and breakdown of the generated or provided code
- **Code Optimization**: Suggests improvements or optimizations to the code
- **Complexity Analysis**: Automatically analyzes time and space complexity of generated code

#### 1.2 **Project Scope**
This project aims to improve coding practices by providing intelligent assistance for both beginners and experienced programmers. It supports a variety of programming languages and includes advanced features like complexity analysis and code optimization. The project is integrated into StudyBuddy, a platform designed for student learning and development, enabling seamless interaction with the tool.

---

### 2. **System Requirements**

#### 2.1 **Software Requirements**
- **Operating System**: Windows/Linux/MacOS
- **Frontend Framework**: React.js with TypeScript
- **State Management**: React Context API
- **CSS Framework**: Tailwind CSS
- **Build Tool**: Vite
- **Backend/AI Integration**: Google Generative AI (Gemini Pro)
- **API Client**: Fetch API
- **Text Editor**: VS Code, Sublime Text, or any IDE with support for JavaScript/TypeScript
- **Version Control**: Git
- **Package Manager**: npm (Node.js)

#### 2.2 **Hardware Requirements**
- **Processor**: Intel Core i3 or equivalent (minimum requirement)
- **RAM**: 4GB (8GB recommended for smooth development)
- **Disk Space**: 5GB free space for project files and dependencies
- **Network**: A stable internet connection for API communication with Google's Generative AI

---

### 3. **Implementation**

#### 3.1 **Project Code**
The project code is implemented using React.js with TypeScript for the frontend, integrated with Google's Generative AI for code generation and explanations. Below is a detailed example of the key components:

##### **CodeDiplomate Service Interface**
```typescript
export interface CodeResponse {
  code: string;
  explanation: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  operations: { n: number; time: number; }[];
}
```

##### **CodeDiplomate Service Implementation**
```typescript
import * as directApi from './directGemini';

export async function generateCode(prompt: string): Promise<{
  code: string;
  complexity: ComplexityAnalysis;
}> {
  // Forward to the optimized implementation
  return directApi.generateCode(prompt);
}

export async function optimizeCode(code: string): Promise<string> {
  return directApi.optimizeCode(code);
}

export async function explainCode(code: string): Promise<string> {
  return directApi.explainCode(code);
}

export async function verifyApiConnection(): Promise<boolean> {
  return directApi.verifyApiConnection();
}

export async function queuedGenerateCode(prompt: string, priority = 1): Promise<CodeResponse> {
  const result = await directApi.generateCode(prompt);
  return {
    code: result.code,
    explanation: ''
  };
}
```

##### **Direct Gemini API Integration**
```typescript
// Cache for complexity analysis to avoid repeated calculations
const complexityCache = new Map<string, ComplexityAnalysis>();

// Keep track of ongoing API requests to manage concurrency
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

export async function generateCode(prompt: string): Promise<{
  code: string;
  complexity: ComplexityAnalysis;
}> {
  // Wait if too many active requests
  while (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  activeRequests++;
  
  try {
    console.log('Generating code with optimized client...');
    
    // Initial response
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "text/plain",
          stopSequences: []
        }
      })
    });
    
    // Process response and extract code
    const data = await response.json();
    let code = '';
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      code = data.candidates[0].content.parts[0].text;
    }
    
    // Get complexity analysis (with caching)
    const codeKey = code.trim();
    let complexity: ComplexityAnalysis;
    
    if (complexityCache.has(codeKey)) {
      complexity = complexityCache.get(codeKey)!;
    } else {
      complexity = await analyzeComplexity(code);
      // Cache the result
      complexityCache.set(codeKey, complexity);
    }
    
    return { code, complexity };
    
  } catch (error) {
    console.error('Error in generateCode:', error);
    throw error;
  } finally {
    activeRequests--;
  }
}

async function analyzeComplexity(code: string): Promise<ComplexityAnalysis> {
  try {
    const prompt = `Analyze this code and respond ONLY with a JSON object with timeComplexity, spaceComplexity and operations array: ${code}`;
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
          responseMimeType: "text/plain",
        }
      })
    });
    
    // Process response and extract complexity analysis
    const data = await response.json();
    let resultText = '';
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      resultText = data.candidates[0].content.parts[0].text;
    }
    
    // Extract JSON from the response
    const jsonStr = resultText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
    
  } catch (error) {
    console.error('Error analyzing code complexity:', error);
    // Return default values if parsing fails
    return {
      timeComplexity: "O(?)",
      spaceComplexity: "O(?)",
      operations: [
        {n: 10, time: 10},
        {n: 100, time: 100},
        {n: 1000, time: 1000},
        {n: 10000, time: 10000}
      ]
    };
  }
}
```

##### **Frontend Component Example**
```typescript
import { useState } from 'react';
import { generateCode, explainCode, optimizeCode } from '../services/codeDiplomate';

const CodeGenerationForm = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [complexity, setComplexity] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const result = await generateCode(prompt);
      setGeneratedCode(result.code);
      setComplexity(result.complexity);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = async () => {
    if (!generatedCode) return;
    
    setIsLoading(true);
    try {
      const explanation = await explainCode(generatedCode);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error explaining code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeCode = async () => {
    if (!generatedCode) return;
    
    setIsLoading(true);
    try {
      const optimizedCode = await optimizeCode(generatedCode);
      setGeneratedCode(optimizedCode);
    } catch (error) {
      console.error('Error optimizing code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the code you want to generate"
          rows={4}
        />
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleGenerateCode}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>
      
      {generatedCode && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Generated Code</h3>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {generatedCode}
          </pre>
          
          {complexity && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Complexity Analysis</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p><strong>Time Complexity:</strong> {complexity.timeComplexity}</p>
                  <p><strong>Space Complexity:</strong> {complexity.spaceComplexity}</p>
                </div>
                <div>
                  <h4 className="font-bold">Performance for Different Input Sizes:</h4>
                  <ul>
                    {complexity.operations.map((op, index) => (
                      <li key={index}>n={op.n}: {op.time}ms</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={handleExplainCode}
              disabled={isLoading}
            >
              Explain Code
            </button>
            <button 
              className="px-4 py-2 bg-purple-500 text-white rounded"
              onClick={handleOptimizeCode}
              disabled={isLoading}
            >
              Optimize Code
            </button>
          </div>
          
          {explanation && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Code Explanation</h3>
              <div className="bg-gray-100 p-4 rounded mt-2">
                {explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

This implementation showcases the actual CodeDiplomate service with its direct integration to Google's Gemini API, including features like complexity analysis, code optimization, and explanation.

---

### 4. **Output Snippets of Project**

Here are some example outputs from the project:

#### Example 1: Code Generation with Complexity Analysis
- **Prompt**: "Create a function to sort an array in ascending order using quicksort algorithm."
- **Generated Code** (JavaScript):
  ```javascript
  function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = [];
    const middle = [];
    const right = [];
    
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] < pivot) {
        left.push(arr[i]);
      } else if (arr[i] > pivot) {
        right.push(arr[i]);
      } else {
        middle.push(arr[i]);
      }
    }
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
  }
  ```
- **Complexity Analysis**:
  ```json
  {
    "timeComplexity": "O(n log n) average, O(n²) worst",
    "spaceComplexity": "O(log n)",
    "operations": [
      {"n": 10, "time": 0.5},
      {"n": 100, "time": 5},
      {"n": 1000, "time": 50},
      {"n": 10000, "time": 500}
    ]
  }
  ```

#### Example 2: Code Explanation Output
- **Code**: 
  ```python
  def fibonacci(n):
      if n <= 1:
          return n
      return fibonacci(n-1) + fibonacci(n-2)
  ```
- **Explanation**: "This function calculates the nth Fibonacci number using recursion. The base case is when n is 0 or 1, in which case it returns n directly. For other values, it recursively calls itself to calculate the sum of the (n-1)th and (n-2)th Fibonacci numbers. This implementation has exponential time complexity O(2^n) due to the repeated calculations of the same subproblems."

#### Example 3: Code Optimization
- **Original Code**:
  ```javascript
  function findDuplicates(arr) {
    const duplicates = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] === arr[j]) {
          duplicates.push(arr[i]);
        }
      }
    }
    return duplicates;
  }
  ```
- **Optimized Code**:
  ```javascript
  function findDuplicates(arr) {
    const seen = new Set();
    const duplicates = new Set();
    
    for (const num of arr) {
      if (seen.has(num)) {
        duplicates.add(num);
      } else {
        seen.add(num);
      }
    }
    
    return Array.from(duplicates);
  }
  ```

These outputs showcase how the system translates user inputs into code, provides complexity analysis, explanations, and optimizations.

---

### 5. **Conclusion**
CodeDiplomate represents a significant advancement in AI-assisted code generation and learning. By incorporating Google's Generative AI with advanced features like complexity analysis and code optimization, this system enables quick and accurate code generation, real-time explanations, and suggestions for code improvement. The direct integration with the Gemini API, combined with caching and concurrency management, ensures efficient and reliable performance. As an integral part of the StudyBuddy platform, CodeDiplomate provides students and developers with a powerful tool to enhance their coding skills and productivity.

---

### 6. **References**
1. Google's Generative AI Documentation. (https://cloud.google.com/ai)
2. React.js Documentation. (https://reactjs.org/docs/getting-started.html)
3. Tailwind CSS Documentation. (https://tailwindcss.com/docs)
4. StudyBuddy Platform Documentation. (Internal)
5. Gemini API Documentation. (https://ai.google.dev/docs/gemini_api_overview) 