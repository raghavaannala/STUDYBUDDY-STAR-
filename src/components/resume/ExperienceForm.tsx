import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip,
  Chip,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme, active }: { theme: any, active?: boolean }) => ({
  transition: 'all 0.3s ease',
  border: active ? '2px solid rgba(147, 51, 234, 0.7)' : '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: active 
    ? '0 8px 16px rgba(147, 51, 234, 0.15)' 
    : '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.2)',
    transform: 'translateY(-3px)',
  },
}));

const AnimatedBox = styled(Box)({
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
});

const GlowButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    zIndex: -1,
    background: 'linear-gradient(45deg, #9333EA, #4F46E5, #9333EA)',
    backgroundSize: '200% 200%',
    animation: 'glowing 3s linear infinite',
    borderRadius: '14px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
  '&:hover': {
    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
    transform: 'translateY(-2px)'
  },
  '@keyframes glowing': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  }
}));

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ExperienceFormProps {
  data: Experience[];
  onSave: (data: Experience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onSave }) => {
  const [experiences, setExperiences] = useState<Experience[]>(
    data.length > 0 ? data : []
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: '',
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [errors, setErrors] = useState({
    title: false,
    company: false,
    startDate: false,
  });
  const [showNoExperienceAlert, setShowNoExperienceAlert] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentExperience({
      ...currentExperience,
      [name]: value,
    });
    
    // Clear error when field is being edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentExperience({
      ...currentExperience,
      current: e.target.checked,
      endDate: e.target.checked ? 'Present' : currentExperience.endDate,
    });
  };

  const validateForm = () => {
    const newErrors = {
      title: !currentExperience.title.trim(),
      company: !currentExperience.company.trim(),
      startDate: !currentExperience.startDate.trim()
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddExperience = () => {
    if (!validateForm()) return;

    const newExperience = {
      ...currentExperience,
      id: isEditing ? currentExperience.id : Date.now().toString(),
    };

    setAnimateForm(true);
    setTimeout(() => setAnimateForm(false), 500);

    if (isEditing) {
      setExperiences(experiences.map(exp => 
        exp.id === newExperience.id ? newExperience : exp
      ));
    } else {
      setExperiences([...experiences, newExperience]);
    }

    // Reset form
    setCurrentExperience({
      id: '',
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setIsEditing(false);
  };

  const handleEditExperience = (experience: Experience) => {
    setCurrentExperience(experience);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
    if (currentExperience.id === id) {
      setCurrentExperience({
        id: '',
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      setIsEditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(experiences);
  };

  const handleSkip = () => {
    onSave([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.9), rgba(79, 70, 229, 0.9))', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent',
        }}>
          <WorkIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'rgba(147, 51, 234, 0.9)' }} />
          Work Experience
        </Typography>
        <Tooltip title="Adding relevant work experience helps make your resume ATS-friendly and more likely to match job requirements">
          <InfoIcon color="info" sx={{ cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      
      {showNoExperienceAlert && (
        <Fade in={showNoExperienceAlert}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
            onClose={() => setShowNoExperienceAlert(false)}
          >
            Please add at least one experience or click "Skip This Section" if you have no work experience
          </Alert>
        </Fade>
      )}

      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          mb: 4, 
          borderRadius: '10px',
          backgroundColor: 'rgba(25, 118, 210, 0.12)',
          borderLeft: '4px solid rgba(25, 118, 210, 0.7)',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          <strong>ATS Tip:</strong> Add quantifiable achievements and relevant keywords from the job description in your experience section for better results
        </Typography>
      </Alert>

      {/* Experience input form */}
      <StyledCard active={isEditing} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontWeight: 'bold',
              color: isEditing ? 'rgb(147, 51, 234)' : 'inherit'
            }}
          >
            <WorkIcon sx={{ mr: 1, color: isEditing ? 'rgb(147, 51, 234)' : 'inherit' }} />
            {isEditing ? 'Edit Experience' : 'Add Experience'}
          </Typography>
          
          <AnimatedBox sx={{ transition: 'all 0.3s ease', transform: animateForm ? 'scale(0.98)' : 'scale(1)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={currentExperience.title}
                  onChange={handleChange}
                  required
                  error={errors.title}
                  helperText={errors.title ? "Job title is required" : "Use the exact job title from your previous role"}
                  InputProps={{
                    startAdornment: <WorkIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={currentExperience.company}
                  onChange={handleChange}
                  required
                  error={errors.company}
                  helperText={errors.company ? "Company name is required" : ""}
                  InputProps={{
                    startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={currentExperience.location}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                  InputProps={{
                    startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="month"
                  value={currentExperience.startDate}
                  onChange={handleChange}
                  required
                  error={errors.startDate}
                  helperText={errors.startDate ? "Start date is required" : ""}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRangeIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="month"
                  value={currentExperience.endDate}
                  onChange={handleChange}
                  disabled={currentExperience.current}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRangeIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentExperience.current}
                      onChange={handleSwitchChange}
                      name="current"
                      color="primary"
                    />
                  }
                  label="Current Position"
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={currentExperience.description}
                  onChange={handleChange}
                  placeholder="Describe your responsibilities, achievements, and relevant technologies used..."
                  InputProps={{
                    startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(147, 51, 234, 0.8)',
                      },
                    },
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                  Pro tip: Include numbers and specific achievements (e.g. "Increased sales by 20%")
                </Typography>
              </Grid>
            </Grid>
          </AnimatedBox>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <GlowButton
                variant="contained"
                color={isEditing ? "secondary" : "primary"}
                onClick={handleAddExperience}
                startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                sx={{ 
                  mt: 3,
                  background: isEditing 
                    ? 'linear-gradient(45deg, #9333EA, #4F46E5)' 
                    : 'linear-gradient(45deg, #4F46E5, #9333EA)',
                }}
              >
                {isEditing ? 'Update Experience' : 'Add Experience'}
              </GlowButton>
            </Box>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Instructions card */}
      {experiences.length === 0 && (
        <Fade in={experiences.length === 0}>
          <StyledCard sx={{ mb: 4, borderLeft: '4px solid #4a90e2' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1, color: '#4a90e2' }} />
                How to add your experience
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', mt: 2 }}>
                <Box sx={{ 
                  flex: 1, 
                  p: 2, 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(74, 144, 226, 0.05)',
                  mb: isMobile ? 2 : 0,
                  mr: isMobile ? 0 : 2
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    1. Fill out the form
                  </Typography>
                  <Typography variant="body2">
                    Enter your job details in the form above
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  p: 2, 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(74, 144, 226, 0.05)',
                  mb: isMobile ? 2 : 0,
                  mr: isMobile ? 0 : 2
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    2. Click <strong>Add Experience</strong>
                  </Typography>
                  <Typography variant="body2">
                    Save that job to your list
                  </Typography>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  p: 2, 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(74, 144, 226, 0.05)'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    3. Click <strong>Continue</strong>
                  </Typography>
                  <Typography variant="body2">
                    When you're done adding all experiences
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Fade>
      )}

      {/* List of experiences */}
      {experiences.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center',
            mb: 2
          }}>
            <WorkIcon sx={{ mr: 1 }} />
            Your Experience ({experiences.length})
          </Typography>
          
          <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
            {experiences.map((exp, index) => (
              <Fade key={exp.id} in={true} timeout={300 + index * 100}>
                <StyledCard sx={{ 
                  mb: 2, 
                  borderLeft: '4px solid #4a90e2',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(74, 144, 226, 0.7), rgba(147, 51, 234, 0.3))',
                    borderTopRightRadius: '12px',
                    borderBottomRightRadius: '12px',
                  },
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'rgb(219, 234, 254)' }}>
                          {exp.title}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {exp.company}{exp.location ? `, ${exp.location}` : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
                          <DateRangeIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }} />
                          <Typography variant="body2" color="textSecondary">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </Typography>
                          {exp.current && (
                            <Chip 
                              label="Current" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: 'rgba(74, 222, 128, 0.2)', 
                                color: 'rgb(74, 222, 128)',
                                height: '20px'
                              }} 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                          {exp.description}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton 
                          onClick={() => handleEditExperience(exp)} 
                          size="small" 
                          color="primary"
                          sx={{ 
                            bgcolor: 'rgba(79, 70, 229, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(79, 70, 229, 0.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteExperience(exp.id)} 
                          size="small" 
                          color="error"
                          sx={{ 
                            ml: 1,
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(239, 68, 68, 0.2)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Fade>
            ))}
          </Box>
        </Box>
      )}

      {experiences.length === 0 && (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            border: '1px dashed rgba(147, 51, 234, 0.3)', 
            borderRadius: 2,
            mb: 4,
            background: 'rgba(147, 51, 234, 0.05)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <WorkIcon sx={{ fontSize: 40, color: 'rgba(147, 51, 234, 0.4)', mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            No experience added yet. Use the form above to add your work history.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 4, opacity: 0.2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleSkip}
          sx={{ 
            borderRadius: '12px',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            },
          }}
        >
          Skip This Section
        </Button>
        <GlowButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            borderRadius: '12px',
            px: 4,
            background: 'linear-gradient(45deg, #4F46E5, #9333EA)',
          }}
        >
          Continue
        </GlowButton>
      </Box>
    </form>
  );
};

export default ExperienceForm; 