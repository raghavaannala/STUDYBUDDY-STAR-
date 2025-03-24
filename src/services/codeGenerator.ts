/**
 * Unified code generation service that integrates our optimized direct API implementation
 * while maintaining compatibility with the existing codebase
 */

// Import our optimized direct API implementation
import * as directApi from './directGemini';

// Types for code generation
export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  operations: { n: number; time: number; }[];
}

export interface CodeResponse {
  code: string;
  explanation: string;
}

/**
 * Generate code using the optimized Gemini API implementation
 * @param prompt The prompt for code generation
 * @returns Promise with code and complexity analysis
 */
export async function generateCode(prompt: string): Promise<{
  code: string;
  complexity: ComplexityAnalysis;
}> {
  try {
    console.log('Using optimized Gemini API for code generation...');
    return await directApi.generateCode(prompt);
  } catch (error) {
    console.error('Error in optimized code generation:', error);
    throw error;
  }
}

/**
 * Optimize given code for better performance
 * @param code The code to optimize
 * @returns Promise with optimized code
 */
export async function optimizeCode(code: string): Promise<string> {
  return directApi.optimizeCode(code);
}

/**
 * Explain the given code in detail
 * @param code The code to explain
 * @returns Promise with explanation
 */
export async function explainCode(code: string): Promise<string> {
  return directApi.explainCode(code);
}

/**
 * Reset the chat session (compatibility method)
 * @returns Promise with success status
 */
export async function resetChat(): Promise<boolean> {
  return directApi.resetChat();
}

/**
 * Queue a code generation request with priority
 * @param prompt The prompt for code generation
 * @param priority Priority level (higher = more important)
 * @returns Promise with code response
 */
export async function queuedGenerateCode(prompt: string, priority = 1): Promise<CodeResponse> {
  const result = await directApi.generateCode(prompt);
  return {
    code: result.code,
    explanation: ''
  };
}

/**
 * Verify the API connection is working
 * @returns Promise with connection status
 */
export async function verifyApiConnection(): Promise<boolean> {
  return directApi.verifyApiConnection();
} 