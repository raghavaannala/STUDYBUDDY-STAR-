import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
  themeColor?: string;
}

/**
 * Component to add proper meta tags for SEO and mobile responsiveness
 */
export function Meta({
  title = 'StudyBuddy - AI-Powered Learning Platform',
  description = 'Experience seamless collaborative learning with our AI-powered platform that adapts to your learning style.',
  keywords = 'education, learning, AI, study groups, resume builder, coding',
  ogImage = '/og-image.png',
  noIndex = false,
  themeColor = '#7c3aed'
}: MetaProps) {
  // Ensure viewport is properly set when component is mounted
  useEffect(() => {
    // Add viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
      document.head.appendChild(meta);
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover');
    }
    
    // Add mobile web app capability meta tags
    const appleWebApp = document.createElement('meta');
    appleWebApp.name = 'apple-mobile-web-app-capable';
    appleWebApp.content = 'yes';
    document.head.appendChild(appleWebApp);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(appleWebApp);
    };
  }, []);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Touch icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* No index if specified */}
      {noIndex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
} 