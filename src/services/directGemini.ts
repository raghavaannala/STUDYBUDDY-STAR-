/**
 * Direct integration with Gemini API
 * This service provides functions to generate code using the Gemini API
 * with optimizations for speed and reliability
 */

// Define interfaces for API responses
interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  operations: { n: number; time: number; }[];
}

interface CodeResponse {
  code: string;
  explanation: string;
}

// Cache for complexity analysis to avoid repeated calculations
const complexityCache = new Map<string, ComplexityAnalysis>();

// Keep track of ongoing API requests to manage concurrency
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

/**
 * Generate code using the Gemini API
 * @param prompt The prompt to send to the API
 * @returns A promise with the generated code and complexity analysis
 */
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
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    let code = '';
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      code = data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid API response format');
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

/**
 * Analyze the time and space complexity of code
 * @param code The code to analyze
 * @returns A promise with the complexity analysis
 */
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
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    let resultText = '';
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      resultText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid API response format');
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

/**
 * Optimize code using the Gemini API
 * @param code The code to optimize
 * @returns A promise with the optimized code
 */
export async function optimizeCode(code: string): Promise<string> {
  try {
    const prompt = `Optimize this code for better performance and readability:\n${code}`;
    
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
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error optimizing code:', error);
    throw error;
  }
}

/**
 * Explain code using the Gemini API
 * @param code The code to explain
 * @returns A promise with the explanation
 */
export async function explainCode(code: string): Promise<string> {
  try {
    const prompt = `Explain this code in detail:\n${code}`;
    
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
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "text/plain",
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error explaining code:', error);
    throw error;
  }
}

// Compatibility functions for the existing interface

export function resetChat(): Promise<boolean> {
  // No chat session to reset in this implementation
  return Promise.resolve(true);
}

export async function verifyApiConnection(): Promise<boolean> {
  try {
    // Send a simple prompt to verify the API connection
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('API connection verification failed:', error);
    return false;
  }
} 