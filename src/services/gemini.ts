import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Multiple model fallbacks to handle quota issues - using latest models
const MODELS = [
  "gemini-2.0-flash-exp",      // Latest experimental 2.0 model
  "gemini-2.0-flash",          // Stable 2.0 flash model
  "gemini-1.5-flash",          // Reliable 1.5 flash
  "gemini-1.5-flash-8b",       // Lightweight fallback
  "gemini-1.5-pro"             // High-quality fallback
  // Removed "gemini-pro" as it's deprecated
];

let currentModelIndex = 0;
let models: any[] = [];

// Initialize all models
function initializeModels() {
  console.log('🚀 Initializing Gemini models...');
  models = [];
  
  MODELS.forEach(modelName => {
    try {
      console.log(`Trying to initialize: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      });
      
      models.push({ model, name: modelName });
      console.log(`✅ Successfully initialized: ${modelName}`);
    } catch (error: any) {
      console.warn(`❌ Failed to initialize ${modelName}:`, error.message);
      // Continue with other models even if one fails
    }
  });
  
  if (models.length === 0) {
    console.error('❌ No models could be initialized!');
    // Try to initialize at least one basic model as emergency fallback
    try {
      const emergencyModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b", // Most basic model
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096, // Reduced for emergency
          responseMimeType: "text/plain",
        },
      });
      models.push({ model: emergencyModel, name: "gemini-1.5-flash-8b" });
      console.log('🆘 Emergency fallback model initialized');
    } catch (emergencyError) {
      console.error('💥 Even emergency fallback failed:', emergencyError);
    }
  }
  
  console.log(`✅ Total models initialized: ${models.length}`);
}

// Get next available model
function getNextModel() {
  if (models.length === 0) {
    initializeModels();
  }
  
  const model = models[currentModelIndex % models.length];
  currentModelIndex = (currentModelIndex + 1) % models.length;
  return model;
}

// System prompt for StudyBuddy
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

// Simple cache for responses
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - longer cache to reduce API calls

// Track API usage
let apiCallCount = 0;
const MAX_CALLS_PER_SESSION = 30; // Reduced to be more conservative

// Chat sessions for each model
const chatSessions = new Map<string, any>();

/**
 * Get or create chat session for a model
 */
async function getChatSession(modelObj: any, modelName: string) {
  if (chatSessions.has(modelName)) {
    return chatSessions.get(modelName);
  }
  
  try {
    const chat_session = await modelObj.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Please act as my study assistant according to these instructions" }],
        },
        {
          role: "model",
          parts: [{ text: "I understand and I'm ready to help! ✨" }],
        },
      ],
    });
    
    // Set system prompt
    await chat_session.sendMessage(SYSTEM_PROMPT);
    chatSessions.set(modelName, chat_session);
    console.log(`✅ Chat session initialized for ${modelName}`);
    return chat_session;
  } catch (error) {
    console.error(`Error initializing chat for ${modelName}:`, error);
    return null;
  }
}

/**
 * Main chat response function with aggressive fallback
 */
export async function getChatResponse(prompt: string, context?: string): Promise<string> {
  if (!API_KEY) {
    return "I'm sorry, but the AI assistant is not configured. Please contact support to set up the API key.";
  }

  // Create cache key
  const cacheKey = `${prompt}_${context || ''}`;
  
  // Check cache first (longer cache duration)
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Returning cached response');
    return cached.response;
  }

  // Check if we've exceeded our session limit
  if (apiCallCount >= MAX_CALLS_PER_SESSION) {
    return "I've reached my usage limit for this session to avoid quota issues. Please refresh the page to continue. ✨";
  }

  // Format prompt with context if provided
  let finalPrompt = prompt;
  if (context) {
    finalPrompt = `${context}\n\nUser message: ${prompt}`;
  }

  // Try all models until one works
  let lastError: any = null;
  const maxAttempts = models.length * 2; // Try each model twice
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const model = getNextModel();
    const modelName = model.name;
    
    try {
      console.log(`Attempt ${attempt + 1}: Trying ${modelName}...`);
      
      // Get or create chat session
      const chatSession = await getChatSession(model, modelName);
      if (!chatSession) {
        continue; // Try next model
      }
      
      // Send message with timeout
      const response = await Promise.race([
        chatSession.sendMessage(finalPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 15000)
        )
      ]);
      
      const text = (response as any).response.text();
      
      if (text && text.trim().length > 0) {
        console.log(`✅ Success with ${modelName}`);
        apiCallCount++;
        
        // Cache the response
        responseCache.set(cacheKey, { response: text, timestamp: Date.now() });
        
        return text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`❌ ${modelName} failed:`, error.message);
      
      // If quota exceeded, remove this model's chat session and try next
      if (error?.status === 429 || error?.message?.includes('quota')) {
        chatSessions.delete(modelName);
        console.log(`🔄 Quota exceeded for ${modelName}, trying next model...`);
        continue;
      }
      
      // For other errors, wait a bit before trying next model
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // If all models failed
  console.error('❌ All models failed:', lastError);
  
  if (lastError?.status === 429 || lastError?.message?.includes('quota')) {
    return "I'm sorry, but all AI models have reached their quota limits. This is likely due to high usage. Please try again in a few minutes or refresh the page. ✨";
  }
  
  if (lastError?.message?.includes('safety')) {
    return "I cannot provide a response to that query due to content safety restrictions. Please try asking something else. ✨";
  }
  
  return "I'm sorry, but I'm having trouble connecting to the AI service right now. Please try again in a moment. ✨";
}

/**
 * Reset everything
 */
export async function resetChat(): Promise<boolean> {
  try {
    apiCallCount = 0;
    responseCache.clear();
    chatSessions.clear();
    currentModelIndex = 0;
    initializeModels();
    console.log('✅ Chat service reset successfully');
    return true;
  } catch (error) {
    console.error("Error resetting chat:", error);
    return false;
  }
}

/**
 * Get session info
 */
export function getSessionInfo() {
  return {
    apiCallsUsed: apiCallCount,
    maxCalls: MAX_CALLS_PER_SESSION,
    cacheSize: responseCache.size,
    availableModels: models.length,
    currentModel: models[currentModelIndex % models.length]?.name || 'none'
  };
}

// Initialize models when service loads
initializeModels();