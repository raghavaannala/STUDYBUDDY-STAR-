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
  Divider,
  Alert,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
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
  const [keywordsExtracted, setKeywordsExtracted] = useState<string[]>([]);

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
    
    // Extract keywords when job description changes
    if (name === 'description' && value.length > 50) {
      extractKeywords(value);
    }
  };

  const extractKeywords = (description: string) => {
    // This is a simple keyword extraction - in a real app this would be more sophisticated
    // or use an AI-based service
    const commonSkillKeywords = [
      'javascript', 'react', 'node', 'python', 'java', 'aws', 'cloud', 'agile',
      'scrum', 'project management', 'leadership', 'communication', 'teamwork',
      'problem solving', 'analytical', 'sql', 'database', 'frontend', 'backend',
      'full stack', 'development', 'testing', 'devops', 'ci/cd', 'docker', 'kubernetes'
    ];
    
    const words = description.toLowerCase().split(/\s+/);
    const foundKeywords = commonSkillKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword)
    );
    
    setKeywordsExtracted([...new Set(foundKeywords)]);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Job Target
        </Typography>
        <Tooltip title="Targeting a specific job helps the ATS algorithm match your resume to the position">
          <InfoIcon color="info" sx={{ cursor: 'pointer' }} />
        </Tooltip>
      </Box>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>ATS Tip:</strong> Paste the full job description to automatically optimize your resume for Applicant Tracking Systems (ATS)
        </Typography>
      </Alert>
      
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
            helperText={errors.position ? "Target position is required" : "Match the exact job title from the posting"}
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
            helperText="Mentioning the company can help customize your resume"
            InputProps={{
              startAdornment: <BusinessIcon color="primary" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
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
              helperText={errors.description ? "Job description is required" : "Paste the FULL job description to optimize your resume for ATS"}
              placeholder="Paste the full job description here. Our AI will analyze it to optimize your resume for ATS systems."
              InputProps={{
                startAdornment: <DescriptionIcon color="primary" sx={{ mt: 1, mr: 1 }} />,
              }}
            />
            {jobTarget.description.length > 0 && (
              <Box sx={{ position: 'absolute', right: 10, bottom: 35 }}>
                <Tooltip title="Our AI is analyzing this job description for keywords">
                  <TipsAndUpdatesIcon color="primary" />
                </Tooltip>
              </Box>
            )}
          </Box>
        </Grid>
        
        {keywordsExtracted.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormatListBulletedIcon sx={{ mr: 1, fontSize: 20 }} color="primary" />
                Detected Keywords (Make sure these appear in your resume)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {keywordsExtracted.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} color="primary" />
            Resume Template (ATS-Friendly Options)
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
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#4a90e2',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {template.id === 'minimal' && (
                        <Chip 
                          label="Best for ATS" 
                          size="small" 
                          color="primary"
                          sx={{ 
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 2
                          }}
                        />
                      )}
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
                            height: 140, 
                            backgroundColor: '#f5f5f5', 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                            overflow: 'hidden'
                          }}
                        >
                          {template.previewUrl ? (
                            <img 
                              src={template.previewUrl} 
                              alt={template.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {template.isPremium ? '✨ Premium' : 'Template Preview'}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="subtitle1" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {template.description}
                        </Typography>
                        {template.atsScore && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="textSecondary">
                              ATS Compatibility: {template.atsScore}%
                            </Typography>
                          </Box>
                        )}
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
          Generate ATS Resume
        </Button>
      </Box>
    </form>
  );
};

export default JobTargetForm; 