import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

// Initialize the Gemini API
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
  model: "gemini-1.5-flash-8b",
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

export async function getChatResponse(prompt: string): Promise<string> {
  if (!chat_session) {
    await initChat();
  }

  try {
    console.log('Sending prompt to Gemini:', prompt);
    const response = await chat_session.sendMessage(prompt);
    const text = response.response.text();
    console.log('Received response:', text);
    return text;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    // If we get a session error, try to reinitialize and retry once
    if (error instanceof Error && error.message.includes('session')) {
      await initChat();
      const response = await chat_session.sendMessage(prompt);
      return response.response.text();
    }
    throw error;
  }
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

// Reset chat session if needed
export async function resetChat() {
  chat_session = await model.startChat({
    history: [],
    generationConfig: generation_config,
  });
} 