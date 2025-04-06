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
  atsCompatibility?: number; // 0-100 score for ATS compatibility
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  previewUrl?: string;
  atsScore?: number; // ATS compatibility score
}

// Available resume templates
export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design with excellent ATS compatibility',
    thumbnail: '/resume-templates/minimal.png',
    previewUrl: '/resume-templates/minimal.png',
    isPremium: false,
    atsScore: 98
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional format preferred by established companies',
    thumbnail: '/resume-templates/professional.png',
    previewUrl: '/resume-templates/professional.png',
    isPremium: false,
    atsScore: 95
  },
  {
    id: 'modern',
    name: 'StudyBuddy Purple',
    description: 'Contemporary design with the StudyBuddy color scheme',
    thumbnail: '/resume-templates/modern.png',
    previewUrl: '/resume-templates/modern.png',
    isPremium: false,
    atsScore: 90
  },
  {
    id: 'tech',
    name: 'Tech Focused',
    description: 'Highlights technical skills with code-inspired design',
    thumbnail: '/resume-templates/tech.png',
    previewUrl: '/resume-templates/tech.png',
    isPremium: true,
    atsScore: 85
  },
  {
    id: 'executive',
    name: 'CodeDiploMate Premium',
    description: 'Sophisticated layout with AI-optimized design',
    thumbnail: '/resume-templates/executive.png',
    previewUrl: '/resume-templates/executive.png',
    isPremium: true,
    atsScore: 88
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
As an expert resume writer specializing in ATS optimization, create an ATS-friendly resume for the following person, tailored to the job description.

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
1. Create a highly ATS-optimized resume that will pass automated screening systems by:
   - Using standard section headers (Summary, Experience, Education, Skills)
   - Using a clean, simple format with no tables, columns, headers/footers, or graphics
   - Placing important information in the main body of the document
   - Including exact keywords and phrases from the job description
   - Using standard fonts and simple bullet points
   - Ensuring contact information is at the top and clearly visible

2. Format the resume in a clean, professional layout using the "${getTemplateName(templateId)}" template style.

3. Tailor the content specifically to the job description by:
   - Highlighting relevant skills and experience that match the job requirements
   - Using industry-specific terminology from the job posting
   - Prioritizing the most relevant experience and skills
   - Quantifying achievements with metrics where possible
   - Using strong action verbs to describe accomplishments

4. Return the formatted resume as HTML that can be rendered directly, with clean semantic markup.
   - Use appropriate HTML tags (<h1>, <h2>, <p>, <ul>, <li>, etc.)
   - Use simple CSS for minimal styling (font, spacing, etc.)
   - Avoid complex layouts that might confuse ATS systems

5. Also provide:
   - A list of 3-5 specific suggestions for improving ATS optimization
   - A job match score (0-100) based on alignment with the job description
   - A list of keywords from the job that were successfully matched in the resume
   - A list of important keywords from the job that are missing in the resume
   - An ATS compatibility score (0-100) based on format, keyword density, and structure

OUTPUT FORMAT:
Format your response as a JSON with the following structure:
{
  "content": "The full resume as HTML with appropriate semantic markup",
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "jobMatch": 85,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword3", "keyword4", ...]
  },
  "atsCompatibility": 90
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
          suggestions: [
            "Include more keywords from the job description", 
            "Quantify your achievements with specific metrics",
            "Use industry-standard section headers for better ATS recognition",
            "Ensure your contact information is clearly visible at the top",
            "Remove any special characters or formatting that may confuse ATS systems"
          ],
          jobMatch: 70,
          keywords: {
            matched: [],
            missing: []
          },
          atsCompatibility: 80
        };
      }
    } catch (error) {
      console.error("Error parsing resume response:", error);
      return {
        content: response.code,
        suggestions: [
          "Include more keywords from the job description", 
          "Quantify your achievements with specific metrics",
          "Use industry-standard section headers for better ATS recognition",
          "Ensure your contact information is clearly visible at the top",
          "Remove any special characters or formatting that may confuse ATS systems"
        ],
        jobMatch: 70,
        keywords: {
          matched: [],
          missing: []
        },
        atsCompatibility: 80
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
As an expert resume optimizer specializing in ATS systems, improve the following resume to make it more ATS-friendly and tailored to the job description.

EXISTING RESUME:
${existingResume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Optimize the resume to pass ATS screening systems by:
   - Using standard section headers (Summary, Experience, Education, Skills)
   - Creating a clean, simple format with no tables, columns, headers/footers, or graphics
   - Placing important information in the main body of the document
   - Including exact keywords and phrases from the job description
   - Using standard fonts and simple bullet points
   - Ensuring contact information is at the top and clearly visible

2. Enhance the content to better match the job requirements:
   - Incorporate relevant keywords naturally throughout the text
   - Improve bullet points with strong action verbs and quantifiable achievements
   - Highlight the most relevant experience and skills for this specific job
   - Remove or downplay irrelevant information
   - Ensure proper chronological order and consistent formatting

3. Return the formatted resume as HTML that can be rendered directly, with clean semantic markup.
   - Use appropriate HTML tags (<h1>, <h2>, <p>, <ul>, <li>, etc.)
   - Use simple CSS for minimal styling (font, spacing, etc.)
   - Avoid complex layouts that might confuse ATS systems

4. Also provide:
   - A list of 3-5 specific suggestions for improving ATS optimization
   - A job match score (0-100) based on alignment with the job description
   - A list of keywords from the job that were successfully matched in the resume
   - A list of important keywords from the job that are missing in the resume
   - An ATS compatibility score (0-100) based on format, keyword density, and structure

OUTPUT FORMAT:
Format your response as a JSON with the following structure:
{
  "content": "The full optimized resume as HTML with appropriate semantic markup",
  "suggestions": ["Suggestion 1", "Suggestion 2", ...],
  "jobMatch": 85,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword3", "keyword4", ...]
  },
  "atsCompatibility": 90
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
        // If JSON parsing fails, return a basic response
        return {
          content: response.code,
          suggestions: [
            "Include more keywords from the job description", 
            "Quantify your achievements with specific metrics",
            "Use industry-standard section headers for better ATS recognition",
            "Ensure your contact information is clearly visible at the top",
            "Remove any special characters or formatting that may confuse ATS systems"
          ],
          jobMatch: 75,
          keywords: {
            matched: [],
            missing: []
          },
          atsCompatibility: 85
        };
      }
    } catch (error) {
      console.error("Error parsing resume optimization response:", error);
      return {
        content: response.code,
        suggestions: [
          "Include more keywords from the job description", 
          "Quantify your achievements with specific metrics",
          "Use industry-standard section headers for better ATS recognition",
          "Ensure your contact information is clearly visible at the top",
          "Remove any special characters or formatting that may confuse ATS systems"
        ],
        jobMatch: 75,
        keywords: {
          matched: [],
          missing: []
        },
        atsCompatibility: 85
      };
    }
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw new Error("Failed to optimize resume. Please try again.");
  }
}

function getTemplateName(templateId: string): string {
  const template = resumeTemplates.find(t => t.id === templateId);
  return template ? template.name : 'Minimal';
} 