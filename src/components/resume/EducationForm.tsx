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
  Alert,
  Tooltip,
  Fade,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GradeIcon from '@mui/icons-material/Grade';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.2)',
    transform: 'translateY(-3px)',
  },
}));

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

const AnimatedBox = styled(Box)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  achievements?: string;
}

interface EducationFormProps {
  data: Education[];
  onSave: (data: Education[]) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ data, onSave }) => {
  const [educations, setEducations] = useState<Education[]>(
    data.length > 0 ? data : []
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEducation, setCurrentEducation] = useState<Education>({
    id: '',
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    gpa: '',
    achievements: ''
  });
  const [errors, setErrors] = useState({
    degree: false,
    institution: false,
    graduationDate: false,
  });
  const [showNoEducationAlert, setShowNoEducationAlert] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation({
      ...currentEducation,
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

  const validateForm = () => {
    const newErrors = {
      degree: !currentEducation.degree.trim(),
      institution: !currentEducation.institution.trim(),
      graduationDate: !currentEducation.graduationDate.trim()
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddEducation = () => {
    if (!validateForm()) return;

    const newEducation = {
      ...currentEducation,
      id: isEditing ? currentEducation.id : Date.now().toString(),
    };

    if (isEditing) {
      setEducations(educations.map(edu => 
        edu.id === newEducation.id ? newEducation : edu
      ));
    } else {
      setEducations([...educations, newEducation]);
    }

    // Reset form
    setCurrentEducation({
      id: '',
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
      achievements: ''
    });
    setIsEditing(false);
  };

  const handleEditEducation = (education: Education) => {
    setCurrentEducation(education);
    setIsEditing(true);
  };

  const handleDeleteEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
    if (currentEducation.id === id) {
      setCurrentEducation({
        id: '',
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
        achievements: ''
      });
      setIsEditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(educations);
  };

  const handleSkip = () => {
    onSave([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Education
        </Typography>
        <Tooltip title="Adding your education helps make your resume more comprehensive and ATS-friendly">
          <InfoIcon color="info" sx={{ cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      
      {showNoEducationAlert && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          onClose={() => setShowNoEducationAlert(false)}
        >
          Please add at least one education entry or click "Skip This Section" if you have no education to add
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>ATS Tip:</strong> Include relevant coursework and achievements that align with the job requirements for better ATS matching
        </Typography>
      </Alert>

      {/* Education input form */}
      <Card variant="outlined" sx={{ mb: 3, borderColor: '#e0e0e0' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            {isEditing ? 'Edit Education' : 'Add Education'}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={currentEducation.degree}
                onChange={handleChange}
                required
                error={errors.degree}
                helperText={errors.degree ? "Degree is required" : ""}
                placeholder="e.g., Bachelor of Science in Computer Science"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Institution"
                name="institution"
                value={currentEducation.institution}
                onChange={handleChange}
                required
                error={errors.institution}
                helperText={errors.institution ? "Institution name is required" : ""}
                placeholder="e.g., University of Technology"
                InputProps={{
                  startAdornment: <SchoolIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={currentEducation.location}
                onChange={handleChange}
                placeholder="City, State, Country"
                InputProps={{
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Graduation Date"
                name="graduationDate"
                type="month"
                value={currentEducation.graduationDate}
                onChange={handleChange}
                required
                error={errors.graduationDate}
                helperText={errors.graduationDate ? "Graduation date is required" : ""}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <DateRangeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GPA (Optional)"
                name="gpa"
                value={currentEducation.gpa}
                onChange={handleChange}
                placeholder="e.g., 3.8/4.0"
                InputProps={{
                  startAdornment: <GradeIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Achievements/Activities (Optional)"
                name="achievements"
                value={currentEducation.achievements}
                onChange={handleChange}
                placeholder="Honors, scholarships, relevant coursework, academic achievements..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color={isEditing ? "secondary" : "primary"}
                  onClick={handleAddEducation}
                  startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                  sx={{ mt: 2 }}
                >
                  {isEditing ? 'Update Education' : 'Add Education'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructions card */}
      {educations.length === 0 && (
        <Card variant="outlined" sx={{ mb: 3, borderLeft: '4px solid #4a90e2', bgcolor: 'rgba(74, 144, 226, 0.05)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: '#4a90e2' }} />
              How to add your education
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              1. Fill out the form above with your education details
            </Typography>
            <Typography variant="body2">
              2. Click the <strong>Add Education</strong> button to save that entry
            </Typography>
            <Typography variant="body2">
              3. Repeat for each degree or certification you want to include
            </Typography>
            <Typography variant="body2">
              4. Click <strong>Continue</strong> when you've added all your education
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* List of education entries */}
      {educations.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            Your Education ({educations.length})
          </Typography>
          
          {educations.map((edu) => (
            <Card key={edu.id} sx={{ mb: 2, borderLeft: '4px solid #4a90e2' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {edu.degree}
                    </Typography>
                    <Typography variant="subtitle1">
                      {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Graduated: {edu.graduationDate}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                    </Typography>
                    {edu.achievements && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {edu.achievements}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleEditEducation(edu)} size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEducation(edu.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {educations.length === 0 && (
        <Box 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            border: '1px dashed #aaa', 
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="body1" color="textSecondary">
            No education added yet. Use the form above to add your educational background.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleSkip}
          sx={{ borderRadius: 2 }}
        >
          Skip This Section
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
          endIcon={<ArrowForwardIcon />}
        >
          Continue
        </Button>
      </Box>
    </form>
  );
};

export default EducationForm; 