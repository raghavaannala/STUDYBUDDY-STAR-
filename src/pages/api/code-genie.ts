import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Google AI model
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      }
    });

    const result = await model.generateContentStream(prompt);

    // Stream the response
    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Code Genie Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
} 