import { createContext, useContext, useEffect, useState } from 'react';

// Define types for the AI context
interface AIAwareContextType {
  isAIActive: boolean;
  toggleAI: () => void;
  aiSuggestion: string | null;
  setSuggestion: (suggestion: string | null) => void;
  lastUserAction: string | null;
  recordUserAction: (action: string) => void;
  activateAssistant: () => void;
}

// Create the context
const AIAwareContext = createContext<AIAwareContextType | null>(null);

export function AIAwareProvider({ children }: { children: React.ReactNode }) {
  const [isAIActive, setIsAIActive] = useState<boolean>(true);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [lastUserAction, setLastUserAction] = useState<string | null>(null);
  const [shouldActivateAssistant, setShouldActivateAssistant] = useState<boolean>(false);

  // Toggle AI active state
  const toggleAI = () => {
    setIsAIActive(prev => !prev);
    // Store preference in localStorage
    localStorage.setItem('aiAssistantEnabled', (!isAIActive).toString());
  };

  // Set AI suggestion
  const setSuggestion = (suggestion: string | null) => {
    setAiSuggestion(suggestion);
  };

  // Record user action for AI context
  const recordUserAction = (action: string) => {
    setLastUserAction(action);
    // Could store recent actions in an array for context
  };

  // Trigger assistant activation
  const activateAssistant = () => {
    setShouldActivateAssistant(true);
    // Reset after a delay
    setTimeout(() => {
      setShouldActivateAssistant(false);
    }, 500);
  };

  // Load AI preferences from localStorage on initial load
  useEffect(() => {
    const storedPreference = localStorage.getItem('aiAssistantEnabled');
    if (storedPreference !== null) {
      setIsAIActive(storedPreference === 'true');
    }
  }, []);

  return (
    <AIAwareContext.Provider 
      value={{ 
        isAIActive, 
        toggleAI, 
        aiSuggestion, 
        setSuggestion,
        lastUserAction,
        recordUserAction,
        activateAssistant
      }}
    >
      {children}
    </AIAwareContext.Provider>
  );
}

export function useAIAware() {
  const context = useContext(AIAwareContext);
  if (!context) {
    throw new Error('useAIAware must be used within an AIAwareProvider');
  }
  return context;
} 