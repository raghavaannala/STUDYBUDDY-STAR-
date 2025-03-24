/**
 * CodeDiplomate Service
 * 
 * This service has been updated to use the optimized direct API implementation
 * for faster code generation and better reliability.
 */

import * as directApi from './directGemini';

// Export interfaces for compatibility with existing code
export interface CodeResponse {
  code: string;
  explanation: string;
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  operations: { n: number; time: number; }[];
}

// Service initialization message
console.log('CodeDiplomate: Using optimized direct API implementation');

/**
 * Generate code using the Gemini API
 * This function now uses the optimized direct API implementation
 * 
 * @param prompt The prompt to generate code from
 * @returns A promise with the generated code and complexity analysis
 */
export async function generateCode(prompt: string): Promise<{
  code: string;
  complexity: ComplexityAnalysis;
}> {
  // Forward to the optimized implementation
  return directApi.generateCode(prompt);
}

/**
 * Reset the chat session
 * This function is kept for backward compatibility
 * 
 * @returns A promise that resolves when the chat session is reset
 */
export async function resetChatSession(): Promise<boolean> {
  // The direct API implementation doesn't use chat sessions,
  // but we keep this function for compatibility
  return directApi.resetChat();
}

/**
 * Optimize code using the Gemini API
 * 
 * @param code The code to optimize
 * @returns A promise with the optimized code
 */
export async function optimizeCode(code: string): Promise<string> {
  return directApi.optimizeCode(code);
}

/**
 * Explain code using the Gemini API
 * 
 * @param code The code to explain
 * @returns A promise with the explanation
 */
export async function explainCode(code: string): Promise<string> {
  return directApi.explainCode(code);
}

/**
 * Verify API connection
 * 
 * @returns A promise that resolves to true if the API is working
 */
export async function verifyApiConnection(): Promise<boolean> {
  return directApi.verifyApiConnection();
}

/**
 * Queue a code generation request with priority
 * This implementation now uses the direct API which is faster
 * 
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
 * Reset chat session (alias for resetChatSession for API compatibility)
 */
export function resetChat(): Promise<boolean> {
  return resetChatSession();
} 