import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider,
  Grid,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsightsIcon from '@mui/icons-material/Insights';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';

import * as resumeService from '../../services/resumeGenerator';
import { ResumeData } from '../../services/resumeGenerator';

interface ResumePreviewProps {
  resumeData: {
    personalInfo: any;
    experience: any[];
    education: any[];
    jobTarget: {
      position: string;
      company: string;
      description: string;
      selectedTemplate: string;
    }
  };
  isGenerating: boolean;
  error: string;
}

// Styled components for resume preview
const ResumeContainer = styled(Paper)`
  padding: 30px;
  margin-bottom: 20px;
  font-family: 'Roboto', sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  position: relative;
  min-height: 500px;
  overflow-y: auto;
  max-height: 800px;
`;

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, isGenerating, error }) => {
  const [resumeContent, setResumeContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  
  useEffect(() => {
    generateResume();
  }, []);
  
  // Format resume data for API
  const formatResumeData = (): ResumeData => {
    const { personalInfo, experience, education } = resumeData;
    
    return {
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      linkedIn: personalInfo.linkedIn,
      portfolio: personalInfo.portfolio,
      summary: personalInfo.summary,
      skills: personalInfo.skills,
      experiences: experience.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.current ? 'Present' : exp.endDate,
        description: exp.description
      })),
      education: education.map((edu: any) => ({
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        graduationDate: edu.graduationDate,
        gpa: edu.gpa,
        achievements: edu.achievements
      }))
    };
  };
  
  // Generate resume using API
  const generateResume = async () => {
    setLoading(true);
    setGenerationError('');
    
    try {
      const formattedData = formatResumeData();
      const jobDescription = resumeData.jobTarget.description;
      const templateId = resumeData.jobTarget.selectedTemplate;
      
      const result = await resumeService.generateAtsResume(
        formattedData,
        jobDescription,
        templateId
      );
      
      setResumeContent(result.content);
      setMatchScore(result.jobMatch);
      setSuggestions(result.suggestions);
      setMatchedKeywords(result.keywords.matched);
      setMissingKeywords(result.keywords.missing);
    } catch (error) {
      console.error('Error generating resume:', error);
      setGenerationError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle download resume
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([resumeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Get match score color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Resume Preview
      </Typography>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Generating your ATS-optimized resume...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Our AI is analyzing the job description and creating your tailored resume
          </Typography>
        </Box>
      )}
      
      {/* Error state */}
      {generationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generationError}
          <Button 
            onClick={generateResume} 
            variant="outlined" 
            size="small" 
            sx={{ ml: 2 }}
          >
            Try Again
          </Button>
        </Alert>
      )}
      
      {/* Success state */}
      {!loading && !generationError && resumeContent && (
        <Grid container spacing={3}>
          {/* Resume Content */}
          <Grid item xs={12} md={8}>
            <ResumeContainer elevation={3}>
              {/* Water mark */}
              <Box
                sx={{
                  position: 'absolute',
                  opacity: 0.04,
                  transform: 'rotate(-45deg)',
                  fontSize: '120px',
                  fontWeight: 'bold',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none',
                }}
              >
                ResumeBuddy
              </Box>
              
              <Box sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {resumeContent}
              </Box>
            </ResumeContainer>
            
            {/* Action buttons */}
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ mr: 2, borderRadius: 2 }}
              >
                Download Resume
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={generateResume}
                sx={{ borderRadius: 2 }}
              >
                Regenerate
              </Button>
            </Box>
          </Grid>
          
          {/* Resume Analysis */}
          <Grid item xs={12} md={4}>
            {/* Match Score */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsightsIcon sx={{ mr: 1 }} />
                  Job Match Score
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h3" sx={{ color: getMatchScoreColor(matchScore), fontWeight: 'bold' }}>
                    {matchScore}%
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={matchScore} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getMatchScoreColor(matchScore),
                      borderRadius: 5,
                    }
                  }} 
                />
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {matchScore >= 80 
                    ? 'Excellent match! Your resume is well-aligned with the job requirements.'
                    : matchScore >= 60
                    ? 'Good match. Some improvements could help increase your chances.'
                    : 'Low match. Consider addressing the missing keywords to improve your chances.'}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Suggestions */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LightbulbIcon sx={{ mr: 1 }} />
                  Improvement Suggestions
                </Typography>
                
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            {/* Keywords Analysis */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Keyword Analysis
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Matched Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {matchedKeywords.length > 0 ? (
                    matchedKeywords.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword} 
                        color="success" 
                        size="small"
                        icon={<CheckIcon />}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No matching keywords found.
                    </Typography>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom color="error" sx={{ mt: 2 }}>
                  Missing Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {missingKeywords.length > 0 ? (
                    missingKeywords.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword} 
                        color="error" 
                        size="small"
                        icon={<CloseIcon />}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No missing keywords. Great job!
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ResumePreview; 