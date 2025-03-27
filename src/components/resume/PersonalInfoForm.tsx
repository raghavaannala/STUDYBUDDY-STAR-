import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(147, 51, 234, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(147, 51, 234, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(147, 51, 234, 0.7)',
    },
    '& .MuiInputAdornment-root': {
      color: 'rgba(147, 51, 234, 0.7)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'rgba(147, 51, 234, 0.9)',
  },
  '& .MuiInput-input': {
    color: 'white',
  },
});

const StyledButton = styled(Button)({
  background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
  color: 'white',
  fontWeight: 'bold',
  '&:hover': {
    backgroundImage: 'linear-gradient(90deg, #7E22CE 0%, #4338CA 100%)',
    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
  },
});

interface PersonalInfoProps {
  data: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
    summary: string;
    skills: string[];
  };
  onSave: (data: any) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoProps> = ({ data, onSave }) => {
  const [personalInfo, setPersonalInfo] = useState({ ...data });
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    location: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
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

  const handleAddSkill = () => {
    if (newSkill.trim() && !personalInfo.skills.includes(newSkill.trim())) {
      setPersonalInfo({
        ...personalInfo,
        skills: [...personalInfo.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setPersonalInfo({
      ...personalInfo,
      skills: personalInfo.skills.filter((skill) => skill !== skillToDelete),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      fullName: !personalInfo.fullName.trim(),
      email: !personalInfo.email.trim() || !/.+@.+\..+/.test(personalInfo.email),
      phone: !personalInfo.phone.trim(),
      location: !personalInfo.location.trim(),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(Boolean)) {
      return; // Stop if validation fails
    }
    
    onSave(personalInfo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom sx={{ 
        color: 'white',
        background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
      }}>
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={personalInfo.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
            helperText={errors.fullName ? "Full name is required" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={personalInfo.email}
            onChange={handleChange}
            required
            error={errors.email}
            helperText={errors.email ? "Valid email is required" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="Phone"
            name="phone"
            value={personalInfo.phone}
            onChange={handleChange}
            required
            error={errors.phone}
            helperText={errors.phone ? "Phone number is required" : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Location"
            name="location"
            value={personalInfo.location}
            onChange={handleChange}
            required
            error={errors.location}
            helperText={errors.location ? "Location is required" : ""}
            placeholder="City, State, Country"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="LinkedIn Profile"
            name="linkedIn"
            value={personalInfo.linkedIn}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/your-profile"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedInIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="Portfolio/Website"
            name="portfolio"
            value={personalInfo.portfolio}
            onChange={handleChange}
            placeholder="https://your-website.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      
        <Grid item xs={12}>
          <Divider sx={{ my: 2, borderColor: 'rgba(147, 51, 234, 0.2)' }} />
        </Grid>
        
        {/* Professional Summary */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ 
            color: 'white',
            fontWeight: 'medium'
          }}>
            Professional Summary
          </Typography>
          <StyledTextField
            fullWidth
            multiline
            rows={4}
            name="summary"
            value={personalInfo.summary}
            onChange={handleChange}
            placeholder="Write a compelling professional summary highlighting your strengths and experience..."
          />
        </Grid>
        
        {/* Skills */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, borderColor: 'rgba(147, 51, 234, 0.2)' }} />
          <Typography variant="subtitle1" gutterBottom sx={{ 
            color: 'white',
            fontWeight: 'medium'
          }}>
            Skills
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <StyledTextField
              fullWidth
              label="Add Skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g., JavaScript, Project Management, etc."
            />
            <Button 
              variant="contained" 
              onClick={handleAddSkill} 
              sx={{ 
                ml: 1, 
                height: 56, 
                minWidth: 56, 
                borderRadius: 2,
                background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
                '&:hover': {
                  backgroundImage: 'linear-gradient(90deg, #7E22CE 0%, #4338CA 100%)',
                  boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
                }
              }}
            >
              <AddIcon />
            </Button>
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={1}>
            {personalInfo.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{
                  bgcolor: 'rgba(147, 51, 234, 0.15)',
                  color: 'white',
                  borderColor: 'rgba(147, 51, 234, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(147, 51, 234, 0.25)',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      color: 'white',
                    }
                  }
                }}
              />
            ))}
            {personalInfo.skills.length === 0 && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.5)' }}>
                Add your key skills to stand out to employers
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <StyledButton
          type="submit"
          variant="contained"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          Continue
        </StyledButton>
      </Box>
    </form>
  );
};

export default PersonalInfoForm; 