import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

// Configure Gemini with exact same configuration
const genAI = new GoogleGenerativeAI(API_KEY || '');

const generation_config = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Using the flash model as specified
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",  // Changed to flash model
  generationConfig: generation_config,
});

// Chat session with empty history
let chat_session: any = null;

async function initChat() {
  chat_session = await model.startChat({
    history: [],
    generationConfig: generation_config,
  });
}

// Initialize chat when service loads
initChat();

export interface CodeResponse {
  code: string;
  explanation: string;
}

interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  operations: { n: number; time: number; }[];
}

async function analyzeComplexity(code: string): Promise<ComplexityAnalysis> {
  if (!chat_session) {
    await initChat();
  }
  
  const prompt = `Analyze the following code and respond ONLY with a JSON object in this exact format:
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "operations": [
    {"n": 10, "time": 10},
    {"n": 100, "time": 100},
    {"n": 1000, "time": 1000},
    {"n": 10000, "time": 10000}
  ]
}

Code to analyze:
${code}`;

  try {
    const response = await chat_session.sendMessage(prompt);
    const text = response.response.text();
    
    // Clean the response to ensure valid JSON
    const jsonStr = text.trim().replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse complexity analysis:', error);
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

export async function generateCode(prompt: string): Promise<{
  code: string;
  complexity: ComplexityAnalysis;
}> {
  if (!chat_session) {
    await initChat();
  }
  const response = await chat_session.sendMessage(prompt);
  const code = response.response.text();
  const complexity = await analyzeComplexity(code);
  
  return { code, complexity };
}

export async function resetChatSession() {
  return initChat();
}

export async function optimizeCode(code: string): Promise<string> {
  if (!chat_session) {
    await initChat();
  }
  const response = await chat_session.sendMessage(`Optimize this code:\n${code}`);
  return response.response.text();
}

export async function explainCode(code: string): Promise<string> {
  if (!chat_session) {
    await initChat();
  }
  const response = await chat_session.sendMessage(`Explain this code:\n${code}`);
  return response.response.text();
}

// Retry logic helper
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Optional: Add request queuing to prevent multiple simultaneous requests
const queue: (() => Promise<void>)[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  while (queue.length > 0) {
    const task = queue.shift();
    if (task) {
      await task();
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  isProcessing = false;
}

// Example of how to use the queue (optional implementation)
export async function queuedGenerateCode(prompt: string): Promise<CodeResponse> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await generateCode(prompt);
        resolve({
          code: result.code,
          explanation: ''
        });
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

// Optional: Reset chat session if needed
export async function resetChat() {
  chat_session = await model.startChat({
    history: [],
    generationConfig: generation_config,
  });
} 