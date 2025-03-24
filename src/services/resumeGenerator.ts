/**
 * Resume Generator Service
 * This service uses the Gemini API to generate ATS-friendly resumes
 * based on user inputs and optimize them for specific job positions.
 */

import { ComplexityAnalysis } from "./codeDiplomate";

// Define the resume data interface
export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
  github?: string;
  summary: string;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    achievements?: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

// Define the response interface
export interface ResumeGenerationResponse {
  content: string;
  suggestedImprovements: string[];
  atsScore: number;
  keywordMatches: string[];
}

/**
 * Generate an ATS-friendly resume based on user data and target job
 * @param resumeData User's resume information
 * @param jobDescription Target job description to tailor the resume for
 * @returns Generated resume content, improvements, and ATS score
 */
export async function generateAtsResume(
  resumeData: ResumeData,
  jobDescription: string
): Promise<ResumeGenerationResponse> {
  try {
    console.log('Generating ATS-friendly resume...');
    
    // Create a prompt for the AI to generate the resume
    const prompt = buildResumePrompt(resumeData, jobDescription);
    
    // Call the Gemini API directly
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
          maxOutputTokens: 4096,
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
      
      const result = data.candidates[0].content.parts[0].text;
      
      // Parse the AI response to extract resume content, suggestions, and score
      return parseAiResponse(result);
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
}

/**
 * Optimize an existing resume for ATS
 * @param resumeContent Current resume content
 * @param jobDescription Target job description
 * @returns Optimized resume with suggestions
 */
export async function optimizeResumeForAts(
  resumeContent: string,
  jobDescription: string
): Promise<ResumeGenerationResponse> {
  try {
    const prompt = `I have the following resume:

${resumeContent}

And I want to apply for this job:

${jobDescription}

Please optimize my resume for ATS (Applicant Tracking Systems) by:
1. Reformatting it to be ATS-friendly with a clean structure
2. Incorporating relevant keywords from the job description
3. Highlighting my most relevant qualifications
4. Removing any elements that might confuse ATS systems
5. Adding any missing sections that would improve my chances

Please respond in the following structured format:
---RESUME CONTENT---
[The optimized resume content]
---END RESUME CONTENT---

---SUGGESTED IMPROVEMENTS---
[Bullet points of suggested improvements]
---END SUGGESTED IMPROVEMENTS---

---ATS SCORE---
[A score from 1-100 indicating how well the resume would perform with ATS]
---END ATS SCORE---

---KEYWORD MATCHES---
[List of keywords from the job description that are now included in the resume]
---END KEYWORD MATCHES---`;

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
          maxOutputTokens: 4096,
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
      
      const result = data.candidates[0].content.parts[0].text;
      return parseAiResponse(result);
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error optimizing resume:', error);
    throw error;
  }
}

/**
 * Generate personalized job-specific content for a resume
 * @param resumeData User's resume information
 * @param jobDescription Target job description
 * @returns Generated bullet points for specific job applications
 */
export async function generateJobSpecificContent(
  resumeData: ResumeData,
  jobDescription: string
): Promise<string[]> {
  try {
    const prompt = `Based on my background and the job description, generate 5-7 tailored bullet points highlighting my most relevant experiences and skills for this specific job.

My background:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Please focus on quantifiable achievements and skills that directly relate to the job requirements. Format each bullet point to be concise, impactful, and begin with a strong action verb.`;

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
      
      const result = data.candidates[0].content.parts[0].text;
      
      // Split by bullet points and clean up
      return result
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[•-]\s*/, '').trim())
        .filter(line => line.length > 0);
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Error generating job-specific content:', error);
    throw error;
  }
}

/**
 * Build the prompt for the Gemini API to generate a resume
 * @param data User resume data
 * @param jobDescription Target job description
 * @returns Formatted prompt string
 */
function buildResumePrompt(data: ResumeData, jobDescription: string): string {
  return `Generate an ATS-friendly resume based on the following information and job description:

PERSONAL INFO:
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
${data.linkedIn ? `LinkedIn: ${data.linkedIn}` : ''}
${data.portfolio ? `Portfolio: ${data.portfolio}` : ''}
${data.github ? `GitHub: ${data.github}` : ''}

SUMMARY:
${data.summary}

SKILLS:
${data.skills.join(', ')}

WORK EXPERIENCE:
${data.experiences.map(exp => `
Title: ${exp.title}
Company: ${exp.company}
Location: ${exp.location}
Duration: ${exp.startDate} - ${exp.endDate}
Description: ${exp.description}
Achievements:
${exp.achievements.map(a => `- ${a}`).join('\n')}
`).join('\n')}

EDUCATION:
${data.education.map(edu => `
Degree: ${edu.degree}
Institution: ${edu.institution}
Location: ${edu.location}
Graduation Date: ${edu.graduationDate}
${edu.gpa ? `GPA: ${edu.gpa}` : ''}
${edu.achievements?.length ? `Achievements:\n${edu.achievements.map(a => `- ${a}`).join('\n')}` : ''}
`).join('\n')}

${data.projects?.length ? `PROJECTS:
${data.projects.map(proj => `
Name: ${proj.name}
Description: ${proj.description}
Technologies: ${proj.technologies.join(', ')}
${proj.link ? `Link: ${proj.link}` : ''}
`).join('\n')}` : ''}

${data.certifications?.length ? `CERTIFICATIONS:
${data.certifications.map(cert => `
Name: ${cert.name}
Issuer: ${cert.issuer}
Date: ${cert.date}
`).join('\n')}` : ''}

JOB DESCRIPTION:
${jobDescription}

Please create an ATS-friendly resume that:
1. Follows a clean, standard format that will parse well in ATS systems
2. Tailors the skills and experience to match the job description
3. Uses relevant keywords from the job description
4. Quantifies achievements when possible
5. Is concise and easy to scan

Format your response as follows:

---RESUME CONTENT---
[The resume content in plain text format, properly formatted for ATS systems]
---END RESUME CONTENT---

---SUGGESTED IMPROVEMENTS---
[Bullet points of suggested improvements to make the resume even better]
---END SUGGESTED IMPROVEMENTS---

---ATS SCORE---
[A score from 1-100 indicating how well the resume would perform with ATS]
---END ATS SCORE---

---KEYWORD MATCHES---
[List of keywords from the job description that are included in the resume]
---END KEYWORD MATCHES---`;
}

/**
 * Parse the AI response to extract structured data
 * @param responseText The raw text response from Gemini API
 * @returns Structured resume generation response
 */
function parseAiResponse(responseText: string): ResumeGenerationResponse {
  // Extract resume content
  const contentMatch = responseText.match(/---RESUME CONTENT---([\s\S]*?)---END RESUME CONTENT---/);
  const content = contentMatch ? contentMatch[1].trim() : '';

  // Extract suggested improvements
  const improvementMatch = responseText.match(/---SUGGESTED IMPROVEMENTS---([\s\S]*?)---END SUGGESTED IMPROVEMENTS---/);
  const improvementText = improvementMatch ? improvementMatch[1].trim() : '';
  const suggestedImprovements = improvementText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(line => line.length > 0);

  // Extract ATS score
  const scoreMatch = responseText.match(/---ATS SCORE---([\s\S]*?)---END ATS SCORE---/);
  const scoreText = scoreMatch ? scoreMatch[1].trim() : '75';
  const atsScore = parseInt(scoreText, 10) || 75;

  // Extract keyword matches
  const keywordMatch = responseText.match(/---KEYWORD MATCHES---([\s\S]*?)---END KEYWORD MATCHES---/);
  const keywordText = keywordMatch ? keywordMatch[1].trim() : '';
  const keywordMatches = keywordText
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(line => line.length > 0);

  return {
    content,
    suggestedImprovements,
    atsScore,
    keywordMatches
  };
} 