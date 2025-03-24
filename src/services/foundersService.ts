/**
 * Founders Service
 * Retrieves information about the founders from the "Meet Our Founders" module
 */

// Structure matching the one used in AIBuddyAssistant
export interface FounderInfo {
  name: string;
  role: string;
  background: string;
}

export interface FoundersData {
  founders: FounderInfo[];
  founded: string;
  mission: string;
}

// Get the actual founders from the Hero component
const heroFounders = [
  { 
    name: "Raghava", 
    role: "Full Stack & UI UX", 
    background: "Expert in creating beautiful and functional user interfaces"
  },
  { 
    name: "Deekshith", 
    role: "Full Stack & Backend", 
    background: "Specialist in robust backend architecture and database management"
  },
  { 
    name: "Vikas", 
    role: "Chief Evangelist", 
    background: "Technology advocate and community builder focused on promoting StudyBuddy's mission"
  },
  { 
    name: "Rajkumar", 
    role: "CSS Stylist", 
    background: "Creating pixel-perfect designs and responsive layouts"
  },
  { 
    name: "Anji", 
    role: "Data Analyst", 
    background: "Data science expert focusing on analytics and insights"
  }
];

const foundersData: FoundersData = {
  founders: heroFounders,
  founded: "2023",
  mission: "To make learning accessible, interactive, and personalized through AI technology"
};

/**
 * Fetches information about the company's founders
 * @returns Promise with founders data
 */
export async function getFoundersInfo(): Promise<FoundersData> {
  // Simulate an API call with a small delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(foundersData);
    }, 300);
  });
}

/**
 * Gets a founder by name
 * @param name The founder's name to look for
 * @returns The founder info or null if not found
 */
export function getFounderByName(name: string): FounderInfo | null {
  const founder = heroFounders.find(f => 
    f.name.toLowerCase() === name.toLowerCase()
  );
  
  return founder || null;
} 