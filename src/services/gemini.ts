import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY || '');

const generation_config = {
  temperature: 0.9,  // Slightly lower temperature for more coherent responses
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

// System prompt to provide context about the app
const SYSTEM_PROMPT = `You are a helpful AI study assistant in the StudyBuddy app, an AI-powered learning platform. 
Your name is Magical Assistant and you should speak in a friendly, slightly magical tone using ✨ emoji occasionally.

The app has these main features that you should know about and can help users with:
1. Smart Code Assistant - AI-powered code completion, debugging, and explanation
2. Study Groups - Join or create study groups to learn together 
3. Interactive Study Modules - AI-generated quizzes, notes, and summaries
4. Real-time Collaboration - Work together with peers in interactive study rooms
5. BuddyResume - Create ATS-friendly resumes tailored to job descriptions
6. Coding Games - Learn through play with interactive coding games and challenges

About StudyBuddy:
- Founded in 2023 by a team of dedicated developers and educators
- Our founders are Raghava (Full Stack & UI UX), Deekshith (Full Stack & Backend), Vikas (Chief Evangelist), Rajkumar (CSS Stylist), and Anji (Data Analyst)
- Mission: To make learning accessible, interactive, and personalized through AI technology

When answering academic questions:
- Be educational and accurate but concise
- For programming questions, provide correct, modern code examples when appropriate
- For math, science, and other academic subjects, provide clear explanations
- If asked about homework, guide the user to understand concepts rather than just giving answers
- When explaining complex topics, break them down into easy-to-understand components

Always be encouraging and supportive of the user's learning journey.`;

// Chat session with empty history
let chat_session: any = null;

async function initChat() {
  try {
    chat_session = await model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Please act as my study assistant according to these instructions" }],
        },
        {
          role: "model",
          parts: [{ text: "I understand and I'm ready to help" }],
        },
      ],
      generationConfig: generation_config,
    });
    
    // Set system prompt
    await chat_session.sendMessage(SYSTEM_PROMPT);
  } catch (error) {
    console.error("Error initializing chat:", error);
    // If initialization fails, we'll try again on the first message
  }
}

// Initialize chat when service loads
initChat();

export async function getChatResponse(prompt: string): Promise<string> {
  if (!chat_session) {
    await initChat();
  }

  try {
    console.log('Sending prompt to Gemini:', prompt);
    const response = await withRetry(() => chat_session.sendMessage(prompt));
    const text = (response as any).response.text();
    console.log('Received response:', text);
    return text;
  } catch (error) {
    console.error('Error in getChatResponse:', error);
    // If we get a session error, try to reinitialize and retry once
    if (error instanceof Error && (error.message.includes('session') || error.message.includes('model'))) {
      console.log('Session error, reinitializing...');
      await initChat();
      const response = await chat_session.sendMessage(prompt);
      return (response as any).response.text();
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
  try {
    await initChat();
    return true;
  } catch (error) {
    console.error("Error resetting chat:", error);
    return false;
  }
} 