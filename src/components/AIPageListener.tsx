import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAIAware } from '@/contexts/AIAwareContext';

/**
 * AIPageListener - A component that observes page navigation and triggers AI suggestions
 * based on the current page the user is viewing.
 */
export function AIPageListener() {
  const location = useLocation();
  const { isAIActive, setSuggestion, recordUserAction } = useAIAware();

  useEffect(() => {
    if (!isAIActive) return;

    // Record page navigation
    recordUserAction(`page_viewed_${location.pathname}`);
    
    // Clear any previous suggestions
    setTimeout(() => setSuggestion(null), 300);
    
    // Generate contextual suggestions based on current page
    const path = location.pathname;
    
    setTimeout(() => {
      if (path === '/resume') {
        // When viewing Resume page
        if (Math.random() > 0.7) { // Only show suggestions occasionally
          setSuggestion("✨ Working on your resume? I can provide tips for optimizing it for ATS systems or suggest improvements!");
        }
      } else if (path === '/code') {
        // When viewing Code page
        if (Math.random() > 0.7) {
          setSuggestion("✨ Need help with coding? I can explain algorithms, provide code examples, or help troubleshoot errors!");
        }
      } else if (path === '/groups') {
        // When viewing Groups page
        if (Math.random() > 0.7) {
          setSuggestion("✨ Looking to collaborate? I can help you find study groups based on your interests or create your own!");
        }
      } else if (path === '/study') {
        // When viewing Study page
        if (Math.random() > 0.7) {
          setSuggestion("✨ Ready to study? I can create practice questions, explain concepts, or help you create study notes!");
        }
      } else if (path === '/games') {
        // When viewing Games page
        if (Math.random() > 0.7) {
          setSuggestion("✨ Want a learning challenge? I can recommend coding games based on your skill level or learning goals!");
        }
      }
    }, 3000); // Delay suggestions to not overwhelm the user
    
  }, [location.pathname, isAIActive, setSuggestion, recordUserAction]);

  // This component doesn't render anything visible
  return null;
} 