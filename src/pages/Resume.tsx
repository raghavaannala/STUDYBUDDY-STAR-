import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography, Stepper, Step, StepLabel, Alert } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';
import { Sparkles } from 'lucide-react';

import PersonalInfoForm from '../components/resume/PersonalInfoForm';
import ExperienceForm from '../components/resume/ExperienceForm';
import EducationForm from '../components/resume/EducationForm';
import JobTargetForm from '../components/resume/JobTargetForm';
import ResumePreview from '../components/resume/ResumePreview';

// Define the steps for resume creation
const steps = [
  { label: 'Personal Info', icon: <PersonIcon /> },
  { label: 'Experience', icon: <WorkIcon /> },
  { label: 'Education', icon: <SchoolIcon /> },
  { label: 'Job Target', icon: <DescriptionIcon /> },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(12px)',
  backgroundColor: 'rgba(30, 41, 59, 0.85)',
  border: '1px solid rgba(147, 51, 234, 0.2)',
  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.15)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.25)',
    transform: 'translateY(-2px)',
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
}));

// Custom stepper styling
const StepIconContainer = styled(Box)(({ active }: { active?: boolean }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: active ? 'rgba(147, 51, 234, 0.9)' : 'rgba(147, 51, 234, 0.3)',
  color: active ? 'white' : 'rgba(255, 255, 255, 0.8)',
  boxShadow: active ? '0 4px 10px rgba(147, 51, 234, 0.3)' : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: active ? 'rgba(147, 51, 234, 1)' : 'rgba(147, 51, 234, 0.4)',
  },
}));

// Main ResumeBuddy Component
const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: '',
      summary: '',
      skills: [] as string[],
    },
    experience: [] as any[],
    education: [] as any[],
    jobTarget: {
      position: '',
      company: '',
      description: '',
      selectedTemplate: 'minimal',
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Update resume data
  const updateResumeData = (section: string, data: any) => {
    setResumeData({
      ...resumeData,
      [section]: data,
    });
    handleNext();
  };

  // Handle form rendering based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PersonalInfoForm data={resumeData.personalInfo} onSave={(data) => updateResumeData('personalInfo', data)} />;
      case 1:
        return <ExperienceForm data={resumeData.experience} onSave={(data) => updateResumeData('experience', data)} />;
      case 2:
        return <EducationForm data={resumeData.education} onSave={(data) => updateResumeData('education', data)} />;
      case 3:
        return <JobTargetForm data={resumeData.jobTarget} onSave={(data) => updateResumeData('jobTarget', data)} />;
      case 4:
        return <ResumePreview resumeData={resumeData} isGenerating={isGenerating} error={generationError} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 relative overflow-hidden">
      {/* Animated background gradients - similar to Hero section */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-purple-800/20" />
        <div className="absolute h-[40rem] w-[40rem] -top-40 -left-20 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow opacity-50"></div>
        <div className="absolute h-[30rem] w-[30rem] -bottom-20 -right-20 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow opacity-40"></div>
      </div>
      
      <StyledContainer maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center" sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 12px rgba(147, 51, 234, 0.15)',
          fontSize: '2.5rem',
          animation: 'pulse 2s infinite ease-in-out',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.8 }
          },
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '3px',
            background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
            borderRadius: '4px'
          }
        }}>
          ResumeBuddy
        </Typography>

        {/* Progress indicator */}
        {activeStep < 4 && (
          <StyledPaper sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel StepIconComponent={() => (
                    <StepIconContainer active={activeStep >= index}>
                      {step.icon}
                    </StepIconContainer>
                  )}>
                    <Typography sx={{ color: 'white', fontWeight: activeStep >= index ? 'medium' : 'normal' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </StyledPaper>
        )}

        {/* Form section */}
        <StyledPaper>
          {renderStepContent()}

          {/* Navigation buttons */}
          {activeStep < 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="contained" 
                disabled={activeStep === 0} 
                onClick={handleBack}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.3s ease',
                  opacity: activeStep === 0 ? 0.5 : 1,
                  '&:hover': {
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Back
              </Button>
              <Box>
                {/* Only show in first step */}
                {activeStep === 0 && (
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(-1)}
                    sx={{ 
                      mr: 2, 
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.8) 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
                        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </StyledPaper>

        {/* Information panel */}
        <Alert 
          severity="info" 
          sx={{ 
            mt: 3,
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            color: 'rgb(219, 234, 254)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.1)',
            '& .MuiAlert-icon': {
              color: 'rgb(167, 139, 250)'
            },
            padding: 2
          }}
          icon={<Sparkles className="h-6 w-6" />}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'rgb(196, 181, 253)' }}>
            ResumeBuddy AI-Powered Resume Generator
          </Typography>
          <Typography variant="body2">
            Create an ATS-friendly resume that stands out to recruiters. Our AI analyzes job descriptions to tailor your resume for maximum visibility and impact with top companies.
          </Typography>
        </Alert>
      </StyledContainer>
    </div>
  );
};

export default Resume; 