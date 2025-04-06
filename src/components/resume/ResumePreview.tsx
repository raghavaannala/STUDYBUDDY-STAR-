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
import InfoIcon from '@mui/icons-material/Info';

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
  const [atsCompatibilityScore, setAtsCompatibilityScore] = useState<number>(85);
  const [showAtsGuide, setShowAtsGuide] = useState<boolean>(false);
  
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
      
      // Calculate ATS compatibility score
      const atsScore = Math.min(85 + (result.keywords.matched.length * 2) - (result.keywords.missing.length * 3), 100);
      setAtsCompatibilityScore(Math.max(65, atsScore));
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
    element.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.pdf`;
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

  // Toggle ATS guide visibility
  const toggleAtsGuide = () => {
    setShowAtsGuide(!showAtsGuide);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Resume Preview
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          color="info"
          onClick={toggleAtsGuide}
          startIcon={<InfoIcon />}
        >
          ATS Guide
        </Button>
      </Box>
      
      {showAtsGuide && (
        <Card variant="outlined" sx={{ mb: 3, borderLeft: '4px solid #3f51b5', bgcolor: 'rgba(63, 81, 181, 0.05)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              What Makes a Resume ATS-Friendly?
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>1. Simple Formatting:</strong> Avoid complex layouts, tables, graphics, or unusual fonts
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>2. Proper File Format:</strong> Submit as PDF or Word (.docx) as requested by employer
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>3. Standard Section Headers:</strong> Use conventional headings like "Experience," "Education," and "Skills"
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>4. Relevant Keywords:</strong> Include industry-specific terms and skills from the job posting
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>5. No Headers/Footers:</strong> Place all information in the main document body
            </Typography>
            
            <Typography variant="body2">
              <strong>6. Proper Contact Information:</strong> Include name, phone, email, and LinkedIn at the top
            </Typography>
          </CardContent>
        </Card>
      )}
      
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
            <Box sx={{ position: 'relative' }}>
              <Paper sx={{ 
                position: 'absolute', 
                top: '-12px', 
                right: '-12px', 
                zIndex: 2, 
                padding: '8px 16px',
                borderRadius: '16px',
                backgroundColor: '#4a90e2',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                ATS Score: {atsCompatibilityScore}%
              </Paper>
              <ResumeContainer elevation={3}>
                {/* Water mark */}
                <Box
                  sx={{
                    position: 'absolute',
                    opacity: 0.04,
                    transform: 'rotate(-45deg)',
                    fontSize: '120px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  ATS OPTIMIZED
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {resumeData.personalInfo.fullName}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  {resumeData.personalInfo.email && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {resumeData.personalInfo.email}
                    </Typography>
                  )}
                  {resumeData.personalInfo.phone && (
                    <Typography variant="body2">
                      <strong>Phone:</strong> {resumeData.personalInfo.phone}
                    </Typography>
                  )}
                  {resumeData.personalInfo.location && (
                    <Typography variant="body2">
                      <strong>Location:</strong> {resumeData.personalInfo.location}
                    </Typography>
                  )}
                  {resumeData.personalInfo.linkedIn && (
                    <Typography variant="body2">
                      <strong>LinkedIn:</strong> {resumeData.personalInfo.linkedIn}
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <div dangerouslySetInnerHTML={{ __html: resumeContent }} />
              </ResumeContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ borderRadius: 2 }}
              >
                Download ATS Resume (PDF)
              </Button>
            </Box>
          </Grid>
          
          {/* Resume Analytics */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <InsightsIcon sx={{ mr: 1 }} />
                  Resume Analytics
                </Typography>
                
                {/* Job Match Score */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Job Match Score</span>
                    <span style={{ color: getMatchScoreColor(matchScore) }}>{matchScore}%</span>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={matchScore} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getMatchScoreColor(matchScore)
                      }
                    }} 
                  />
                </Box>
                
                {/* ATS Compatibility Score */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <span>ATS Compatibility</span>
                    <span style={{ 
                      color: atsCompatibilityScore >= 90 ? '#4caf50' : 
                              atsCompatibilityScore >= 75 ? '#4a90e2' : 
                              atsCompatibilityScore >= 60 ? '#ff9800' : '#f44336' 
                    }}>
                      {atsCompatibilityScore}%
                    </span>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={atsCompatibilityScore} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: atsCompatibilityScore >= 90 ? '#4caf50' : 
                                atsCompatibilityScore >= 75 ? '#4a90e2' : 
                                atsCompatibilityScore >= 60 ? '#ff9800' : '#f44336'
                      }
                    }} 
                  />
                </Box>
                
                {/* Matched Keywords */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, color: '#4caf50' }} />
                    Matched Keywords ({matchedKeywords.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {matchedKeywords.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword} 
                        size="small" 
                        color="success"
                        icon={<CheckIcon />}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                    {matchedKeywords.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        No keywords matched yet
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Missing Keywords */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <ErrorIcon sx={{ fontSize: 16, mr: 0.5, color: '#f44336' }} />
                    Missing Keywords ({missingKeywords.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {missingKeywords.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword} 
                        size="small" 
                        color="error"
                        icon={<CloseIcon />}
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                    {missingKeywords.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        Great job! No missing keywords
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Improvement Suggestions */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    <LightbulbIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff9800' }} />
                    Improvement Suggestions
                  </Typography>
                  <List dense sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1, p: 1 }}>
                    {suggestions.map((suggestion, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <LightbulbIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={suggestion}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {suggestions.length === 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ p: 1 }}>
                        No suggestions at this time
                      </Typography>
                    )}
                  </List>
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