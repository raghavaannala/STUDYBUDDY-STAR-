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
  Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Work Experience
      </Typography>

      {/* Experience input form */}
      <Card variant="outlined" sx={{ mb: 3, borderColor: '#e0e0e0' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ mr: 1 }} />
            {isEditing ? 'Edit Experience' : 'Add Experience'}
          </Typography>
          
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
                helperText={errors.title ? "Job title is required" : ""}
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
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color={isEditing ? "secondary" : "primary"}
                  onClick={handleAddExperience}
                  startIcon={isEditing ? <EditIcon /> : <AddIcon />}
                >
                  {isEditing ? 'Update Experience' : 'Add Experience'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* List of experiences */}
      {experiences.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Your Experience
          </Typography>
          
          {experiences.map((exp, index) => (
            <Card key={exp.id} sx={{ mb: 2, borderLeft: '4px solid #4a90e2' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {exp.title}
                    </Typography>
                    <Typography variant="subtitle1">
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {exp.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleEditExperience(exp)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteExperience(exp.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {experiences.length === 0 && (
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
            No experience added yet. Add your work history to create a comprehensive resume.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
          disabled={experiences.length === 0}
        >
          Continue
        </Button>
      </Box>
    </form>
  );
};

export default ExperienceForm; 