import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import { resumeTemplates } from '../../services/resumeGenerator';

interface JobTargetProps {
  data: {
    position: string;
    company: string;
    description: string;
    selectedTemplate: string;
  };
  onSave: (data: any) => void;
}

const JobTargetForm: React.FC<JobTargetProps> = ({ data, onSave }) => {
  const [jobTarget, setJobTarget] = useState({ ...data });
  const [errors, setErrors] = useState({
    position: false,
    description: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobTarget({
      ...jobTarget,
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

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTarget({
      ...jobTarget,
      selectedTemplate: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      position: !jobTarget.position.trim(),
      description: !jobTarget.description.trim(),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(Boolean)) {
      return; // Stop if validation fails
    }
    
    onSave(jobTarget);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Job Target
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target Position"
            name="position"
            value={jobTarget.position}
            onChange={handleChange}
            required
            error={errors.position}
            helperText={errors.position ? "Target position is required" : ""}
            placeholder="e.g., Software Engineer, Product Manager"
            InputProps={{
              startAdornment: <WorkIcon color="primary" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Target Company (Optional)"
            name="company"
            value={jobTarget.company}
            onChange={handleChange}
            placeholder="e.g., Google, Microsoft, etc."
            InputProps={{
              startAdornment: <BusinessIcon color="primary" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Job Description"
            name="description"
            value={jobTarget.description}
            onChange={handleChange}
            required
            error={errors.description}
            helperText={errors.description ? "Job description is required" : "Paste the job description here to optimize your resume for ATS"}
            placeholder="Paste the full job description here. Our AI will analyze it to optimize your resume for ATS systems."
            InputProps={{
              startAdornment: <DescriptionIcon color="primary" sx={{ mt: 1, mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Resume Template
          </Typography>
          
          <FormControl component="fieldset">
            <FormLabel component="legend">Select a template for your resume</FormLabel>
            <RadioGroup
              name="selectedTemplate"
              value={jobTarget.selectedTemplate}
              onChange={handleTemplateChange}
              sx={{ mt: 2 }}
            >
              <Grid container spacing={2}>
                {resumeTemplates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderColor: jobTarget.selectedTemplate === template.id ? '#4a90e2' : '#e0e0e0',
                        borderWidth: jobTarget.selectedTemplate === template.id ? 2 : 1,
                        height: '100%',
                        position: 'relative'
                      }}
                    >
                      <FormControlLabel
                        value={template.id}
                        control={<Radio />}
                        label=""
                        sx={{ 
                          position: 'absolute', 
                          right: 0, 
                          top: 0, 
                          m: 1,
                          zIndex: 1
                        }}
                      />
                      <CardContent>
                        <Box 
                          sx={{ 
                            height: 120, 
                            backgroundColor: '#f5f5f5', 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #ddd'
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            {template.isPremium ? '✨ Premium' : 'Template Preview'}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          Generate Resume
        </Button>
      </Box>
    </form>
  );
};

export default JobTargetForm; 