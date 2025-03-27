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
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GradeIcon from '@mui/icons-material/Grade';

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

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Education
      </Typography>

      {/* Education input form */}
      <Card variant="outlined" sx={{ mb: 3, borderColor: '#e0e0e0' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
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
                >
                  {isEditing ? 'Update Education' : 'Add Education'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* List of education entries */}
      {educations.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Your Education
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
                    <IconButton onClick={() => handleEditEducation(edu)} size="small">
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
            No education added yet. Add your educational background to create a comprehensive resume.
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
          disabled={educations.length === 0}
        >
          Continue
        </Button>
      </Box>
    </form>
  );
};

export default EducationForm; 