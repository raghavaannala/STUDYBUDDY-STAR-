import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function getChatResponse(prompt: string): Promise<string> {
  try {
    console.log('API Key available:', !!API_KEY);
    console.log('Sending prompt to Gemini:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini:', text);
    return text;
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    if (!API_KEY) {
      throw new Error('Missing API key. Please add VITE_GEMINI_API_KEY to your .env file');
    }
    throw error;
  }
} 