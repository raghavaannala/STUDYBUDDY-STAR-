import * as directApi from './directGemini';

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
  summary: string;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    achievements?: string;
  }[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
}

export interface ResumeGenerationResponse {
  content: string;
  suggestions: string[];
  jobMatch: number; // 0-100 score
  keywords: {
    matched: string[];
    missing: string[];
  };
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
}

// Available resume templates
export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design with excellent ATS compatibility',
    thumbnail: '/resume-templates/minimal.png',
    isPremium: false
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional format preferred by established companies',
    thumbnail: '/resume-templates/professional.png',
    isPremium: false
  },
  {
    id: 'modern',
    name: 'StudyBuddy Purple',
    description: 'Contemporary design with the StudyBuddy color scheme',
    thumbnail: '/resume-templates/modern.png',
    isPremium: false
  },
  {
    id: 'tech',
    name: 'Tech Focused',
    description: 'Highlights technical skills with code-inspired design',
    thumbnail: '/resume-templates/tech.png',
    isPremium: true
  },
  {
    id: 'executive',
    name: 'CodeDiploMate Premium',
    description: 'Sophisticated layout with AI-optimized design',
    thumbnail: '/resume-templates/executive.png',
    isPremium: true
  }
];

/**
 * Generate an ATS-friendly resume based on user data and job description
 */
export async function generateAtsResume(
  resumeData: ResumeData,
  jobDescription: string,
  templateId: string = 'minimal'
): Promise<ResumeGenerationResponse> {
  try {
    // Prepare the prompt for the AI
    const prompt = `
As an expert resume writer, create an ATS-friendly resume for the following person, tailored to the job description.

CANDIDATE INFORMATION:
Full Name: ${resumeData.fullName}
Contact: ${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
${resumeData.linkedIn ? `LinkedIn: ${resumeData.linkedIn}` : ''}
${resumeData.portfolio ? `Portfolio: ${resumeData.portfolio}` : ''}

Summary:
${resumeData.summary}

Skills:
${resumeData.skills.join(', ')}

Experience:
${resumeData.experiences.map(exp => 
  `- ${exp.title} at ${exp.company}, ${exp.location} (${exp.startDate} - ${exp.endDate})
   ${exp.description}`
).join('\n\n')}

Education:
${resumeData.education.map(edu => 
  `- ${edu.degree} from ${edu.institution}, ${edu.location} (${edu.graduationDate})
   ${edu.gpa ? `GPA: ${edu.gpa}` : ''}
   ${edu.achievements ? `Achievements: ${edu.achievements}` : ''}`
).join('\n\n')}

${resumeData.certifications && resumeData.certifications.length > 0 ? 
  `Certifications:
${resumeData.certifications.join('\n')}` : ''}

${resumeData.projects && resumeData.projects.length > 0 ? 
  `Projects:
${resumeData.projects.map(proj => 
  `- ${proj.name}: ${proj.description}
   Technologies: ${proj.technologies.join(', ')}
   ${proj.link ? `Link: ${proj.link}` : ''}`
).join('\n\n')}` : ''}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Create an ATS-friendly resume that will pass automated screening systems.
2. Format the resume in a clean, professional layout using the "${getTemplateName(templateId)}" template style.
3. Highlight relevant skills and experience that match the job description.
4. Use action verbs and quantify achievements where possible.
5. Optimize the content with relevant keywords from the job description.
6. Keep the resume concise and within 1-2 pages.
7. Return the formatted resume in well-structured text format.
8. Also provide:
   - A list of 3-5 suggestions for improvement
   - A job match score (0-100)
   - A list of keywords from the job that were matched in the resume
   - A list of important keywords from the job that are missing in the resume

OUTPUT FORMAT:
Format your response as a JSON with the following structure:
{
  "content": "The full resume text with proper formatting",
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "jobMatch": 85,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword3", "keyword4", ...]
  }
}
`;

    // Call the Gemini API
    const response = await directApi.generateCode(prompt);
    
    try {
      // Parse the response to extract the JSON
      const jsonMatch = response.code.match(/```json\n([\s\S]*?)\n```/) || 
                        response.code.match(/({[\s\S]*})/) ||
                        response.code.match(/(^\{[\s\S]*\}$)/m);
                        
      if (jsonMatch && jsonMatch[1]) {
        const parsedResponse = JSON.parse(jsonMatch[1]);
        return parsedResponse as ResumeGenerationResponse;
    } else {
        // If JSON parsing fails, return a basic response with the content
        return {
          content: response.code,
          suggestions: ["Consider adding more quantifiable achievements", "Ensure all keywords from the job description are included"],
          jobMatch: 70,
          keywords: {
            matched: [],
            missing: []
          }
        };
      }
    } catch (error) {
      console.error("Error parsing resume response:", error);
      return {
        content: response.code,
        suggestions: ["Consider adding more quantifiable achievements", "Ensure all keywords from the job description are included"],
        jobMatch: 70,
        keywords: {
          matched: [],
          missing: []
        }
      };
    }
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to generate resume. Please try again.");
  }
}

/**
 * Optimize an existing resume for ATS based on a job description
 */
export async function optimizeResumeForAts(
  existingResume: string,
  jobDescription: string
): Promise<ResumeGenerationResponse> {
  try {
    // Prepare the prompt for the AI
    const prompt = `
As an expert resume optimizer, improve the following resume to make it more ATS-friendly and tailored to the job description.

EXISTING RESUME:
${existingResume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Optimize the resume to pass ATS screening systems.
2. Maintain the original structure but enhance content and formatting.
3. Incorporate relevant keywords from the job description.
4. Improve bullet points with action verbs and quantifiable achievements.
5. Keep the resume concise and within 1-2 pages.
6. Return the formatted resume in well-structured text format.
7. Also provide:
   - A list of 3-5 suggestions for further improvement
   - A job match score (0-100)
   - A list of keywords from the job that were matched in the resume
   - A list of important keywords from the job that are missing in the resume

OUTPUT FORMAT:
Format your response as a JSON with the following structure:
{
  "content": "The full optimized resume text with proper formatting",
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "jobMatch": 85,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword3", "keyword4", ...]
  }
}
`;

    // Call the Gemini API
    const response = await directApi.generateCode(prompt);
    
    try {
      // Parse the response to extract the JSON
      const jsonMatch = response.code.match(/```json\n([\s\S]*?)\n```/) || 
                        response.code.match(/({[\s\S]*})/) ||
                        response.code.match(/(^\{[\s\S]*\}$)/m);
                        
      if (jsonMatch && jsonMatch[1]) {
        const parsedResponse = JSON.parse(jsonMatch[1]);
        return parsedResponse as ResumeGenerationResponse;
    } else {
        // If JSON parsing fails, return a basic response with the content
        return {
          content: response.code,
          suggestions: ["Consider adding more quantifiable achievements", "Ensure all keywords from the job description are included"],
          jobMatch: 70,
          keywords: {
            matched: [],
            missing: []
          }
        };
    }
  } catch (error) {
      console.error("Error parsing resume optimization response:", error);
      return {
        content: response.code,
        suggestions: ["Consider adding more quantifiable achievements", "Ensure all keywords from the job description are included"],
        jobMatch: 70,
        keywords: {
          matched: [],
          missing: []
        }
      };
    }
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw new Error("Failed to optimize resume. Please try again.");
  }
}

/**
 * Helper to get template name from ID
 */
function getTemplateName(templateId: string): string {
  const template = resumeTemplates.find(t => t.id === templateId);
  return template ? template.name : 'Minimal';
} 