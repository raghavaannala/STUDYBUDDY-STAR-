import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography, Stepper, Step, StepLabel, Alert, useTheme, useMediaQuery } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  borderRadius: '16px',
  backdropFilter: 'blur(12px)',
  backgroundColor: 'rgba(30, 41, 59, 0.85)',
  border: '1px solid rgba(147, 51, 234, 0.2)',
  boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
    zIndex: 1,
  },
  '&:hover': {
    boxShadow: '0 15px 35px rgba(147, 51, 234, 0.25)',
    transform: 'translateY(-5px)',
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
  position: 'relative',
  zIndex: 10,
}));

// Custom stepper styling
const StepIconContainer = styled(Box)(({ active, completed }: { active?: boolean; completed?: boolean }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: active 
    ? 'rgba(147, 51, 234, 0.9)' 
    : completed 
      ? 'rgba(79, 70, 229, 0.8)' 
      : 'rgba(147, 51, 234, 0.3)',
  color: active || completed ? 'white' : 'rgba(255, 255, 255, 0.8)',
  boxShadow: active 
    ? '0 4px 15px rgba(147, 51, 234, 0.5)' 
    : completed
      ? '0 4px 10px rgba(79, 70, 229, 0.4)'
      : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: active 
      ? 'rgba(147, 51, 234, 1)' 
      : completed
        ? 'rgba(79, 70, 229, 0.9)'
        : 'rgba(147, 51, 234, 0.4)',
    transform: 'scale(1.05)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
    transform: 'translateY(-2px)'
  }
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
  const [completedSteps, setCompletedSteps] = useState<{[key: string]: boolean}>({
    personalInfo: false,
    experience: false,
    education: false,
    jobTarget: false
  });
  const [animateTitle, setAnimateTitle] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Animation effect for title
  useEffect(() => {
    setAnimateTitle(true);
    const timer = setTimeout(() => setAnimateTitle(false), 1000);
    return () => clearTimeout(timer);
  }, [activeStep]);

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update resume data
  const updateResumeData = (section: string, data: any) => {
    setResumeData({
      ...resumeData,
      [section]: data,
    });
    
    // Mark this step as completed
    setCompletedSteps({
      ...completedSteps,
      [section]: true
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

  // Get current step title
  const getCurrentStepTitle = () => {
    if (activeStep === 4) return "Resume Preview";
    return steps[activeStep]?.label || "";
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 relative overflow-hidden">
      {/* Enhanced animated background with multiple elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-purple-800/30" />
        
        {/* Animated gradient orbs */}
        <div className="absolute h-[45rem] w-[45rem] -top-40 -left-20 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow opacity-60"></div>
        <div className="absolute h-[35rem] w-[35rem] -bottom-20 -right-20 bg-indigo-500/15 rounded-full blur-3xl animate-pulse-slow opacity-50"></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>
      
      <StyledContainer maxWidth="lg">
        <Box sx={{ 
          mb: 6, 
          textAlign: 'center',
          transform: animateTitle ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.5s ease-in-out'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 12px rgba(147, 51, 234, 0.15)',
              mb: 1,
              letterSpacing: '-0.5px',
              position: 'relative',
              display: 'inline-block',
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
            }}
          >
            ResumeBuddy<sup style={{ fontSize: '0.4em', verticalAlign: 'super', marginLeft: '2px' }}>ATS</sup>
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              fontWeight: 'normal',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {getCurrentStepTitle()} {activeStep < 4 && <span>({activeStep + 1}/{steps.length})</span>}
          </Typography>
        </Box>

        {/* Progress indicator */}
        {activeStep < 4 && (
          <StyledPaper sx={{ mb: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{ py: 2 }}
            >
              {steps.map((step, index) => (
                <Step 
                  key={step.label} 
                  completed={
                    index === 0 ? completedSteps.personalInfo : 
                    index === 1 ? completedSteps.experience : 
                    index === 2 ? completedSteps.education : 
                    index === 3 ? completedSteps.jobTarget : 
                    false
                  }
                >
                  <StepLabel 
                    StepIconComponent={() => (
                      <StepIconContainer 
                        active={activeStep === index}
                        completed={
                          index === 0 ? completedSteps.personalInfo : 
                          index === 1 ? completedSteps.experience : 
                          index === 2 ? completedSteps.education : 
                          index === 3 ? completedSteps.jobTarget : 
                          false
                        }
                      >
                        {step.icon}
                      </StepIconContainer>
                    )}
                  >
                    <Typography 
                      sx={{ 
                        color: 'white', 
                        fontWeight: activeStep === index ? 'bold' : 'normal',
                        fontSize: activeStep === index ? '1rem' : '0.9rem',
                        textShadow: activeStep === index ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </StyledPaper>
        )}

        {/* Form section with animated entry */}
        <StyledPaper 
          sx={{ 
            position: 'relative',
            '&::after': activeStep < 4 ? {
              content: '""',
              position: 'absolute',
              bottom: '15px',
              right: '15px',
              width: '120px',
              height: '120px',
              background: `url(/icons/step-${activeStep + 1}.svg) no-repeat center center`,
              backgroundSize: 'contain',
              opacity: 0.05,
              zIndex: 0,
            } : {}
          }}
        >
          <Box sx={{ 
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}>
            {renderStepContent()}
          </Box>

          {/* Navigation buttons */}
          {activeStep < 4 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}>
              <StyledButton 
                variant="outlined" 
                disabled={activeStep === 0} 
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  color: activeStep === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                  borderColor: activeStep === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(147, 51, 234, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(147, 51, 234, 0.8)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)'
                  },
                  opacity: activeStep === 0 ? 0.5 : 1,
                }}
              >
                Back
              </StyledButton>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  bottom: '-24px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.75rem',
                  fontStyle: 'italic'
                }}
              >
                Fill in your details and click Continue
              </Typography>
              
              <Box>
                {/* Only show in first step */}
                {activeStep === 0 && (
                  <StyledButton 
                    variant="outlined" 
                    onClick={() => navigate(-1)}
                    sx={{ 
                      mr: 2, 
                      color: 'rgba(239, 68, 68, 0.9)',
                      borderColor: 'rgba(239, 68, 68, 0.5)',
                      '&:hover': {
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    Cancel
                  </StyledButton>
                )}
              </Box>
            </Box>
          )}
        </StyledPaper>

        {/* Information panel with enhanced styling */}
        <Alert 
          severity="info" 
          sx={{ 
            mt: 4,
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            color: 'rgb(219, 234, 254)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)',
            backdropFilter: 'blur(8px)',
            '& .MuiAlert-icon': {
              color: 'rgb(167, 139, 250)'
            },
            padding: 2,
            animation: 'glow 3s infinite alternate',
            '@keyframes glow': {
              '0%': { boxShadow: '0 4px 20px rgba(124, 58, 237, 0.15)' },
              '100%': { boxShadow: '0 4px 25px rgba(124, 58, 237, 0.25)' }
            }
          }}
          icon={<Sparkles className="h-6 w-6" />}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'rgb(196, 181, 253)' }}>
            ResumeBuddy AI-Powered ATS Resume Generator
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