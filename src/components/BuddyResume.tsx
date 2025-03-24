import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Download, Check, Plus, Trash } from 'lucide-react';
import { ResumeData, ResumeGenerationResponse, generateAtsResume, optimizeResumeForAts } from '@/services/resumeGenerator';

export function BuddyResume() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  
  // Form state
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeResult, setResumeResult] = useState<ResumeGenerationResponse | null>(null);
  
  // Modal states
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  
  // Skills input state
  const [newSkill, setNewSkill] = useState('');
  
  // Experience form state
  const [experienceForm, setExperienceForm] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: ['']
  });
  
  // Education form state
  const [educationForm, setEducationForm] = useState({
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    gpa: '',
    achievements: ['']
  });
  
  // Optimization tab state
  const [existingResume, setExistingResume] = useState('');
  const [optimizationJobDescription, setOptimizationJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Initial empty resume data
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    experiences: [],
    education: []
  });
  
  // Handle resume generation
  const handleGenerateResume = async () => {
    if (!jobDescription || resumeData.fullName === '' || resumeData.email === '') {
      toast({
        title: "Missing Information",
        description: "Please fill in your personal details and paste a job description.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateAtsResume(resumeData, jobDescription);
      
      setResumeResult(result);
      setActiveTab('result');
      
      toast({
        title: "Resume Generated",
        description: "Your ATS-friendly resume has been created successfully!"
      });
    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'location', 'summary'];
    for (const field of requiredFields) {
      if (!resumeData[field as keyof ResumeData]) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (resumeData.experiences.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one work experience",
        variant: "destructive",
      });
      return false;
    }
    
    if (resumeData.education.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one education entry",
        variant: "destructive",
      });
      return false;
    }
    
    if (!jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please add a job description to tailor your resume",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Handle resume optimization
  const handleOptimizeResume = async () => {
    if (!existingResume || !optimizationJobDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide both your existing resume and the job description.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    
    try {
      const result = await optimizeResumeForAts(existingResume, optimizationJobDescription);
      
      setResumeResult(result);
      setActiveTab('result');
      
      toast({
        title: "Resume Optimized",
        description: "Your resume has been optimized for ATS successfully!"
      });
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast({
        title: "Error",
        description: "Failed to optimize resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!resumeResult) return;
    
    const filename = `resume_${Date.now()}`;
    
    // Default to text download using the browser
    const blob = new Blob([resumeResult.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
    toast({
      title: "Resume Downloaded",
      description: "Your resume has been downloaded as a text file"
    });
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Handle adding an experience
  const handleAddExperience = () => {
    // Validate required fields
    if (!experienceForm.title || !experienceForm.company || !experienceForm.startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out empty achievements
    const achievements = experienceForm.achievements.filter(a => a.trim() !== '');
    
    // Add to resume data
    setResumeData({
      ...resumeData,
      experiences: [
        ...resumeData.experiences,
        {
          ...experienceForm,
          achievements
        }
      ]
    });
    
    // Reset form and close modal
    setExperienceForm({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: ['']
    });
    setShowExperienceModal(false);
  };

  // Handle adding an education entry
  const handleAddEducation = () => {
    // Validate required fields
    if (!educationForm.degree || !educationForm.institution || !educationForm.graduationDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out empty achievements
    const achievements = educationForm.achievements.filter(a => a.trim() !== '');
    
    // Add to resume data
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          ...educationForm,
          achievements
        }
      ]
    });
    
    // Reset form and close modal
    setEducationForm({
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
      achievements: ['']
    });
    setShowEducationModal(false);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">BuddyResume - AI Resume Builder</h1>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Resume</TabsTrigger>
          <TabsTrigger value="optimize">Optimize Existing</TabsTrigger>
          <TabsTrigger value="result" disabled={!resumeResult}>View Result</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create ATS-Friendly Resume</CardTitle>
              <CardDescription>Fill in your details to generate a tailored resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName">Full Name</label>
                      <Input 
                        id="fullName" 
                        value={resumeData.fullName} 
                        onChange={(e) => setResumeData({...resumeData, fullName: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={resumeData.email} 
                        onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone">Phone</label>
                      <Input 
                        id="phone" 
                        value={resumeData.phone} 
                        onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="location">Location</label>
                      <Input 
                        id="location" 
                        value={resumeData.location} 
                        onChange={(e) => setResumeData({...resumeData, location: e.target.value})}
                        placeholder="New York, NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="linkedin">LinkedIn (optional)</label>
                      <Input 
                        id="linkedin" 
                        value={resumeData.linkedIn || ''} 
                        onChange={(e) => setResumeData({...resumeData, linkedIn: e.target.value})}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="portfolio">Portfolio (optional)</label>
                      <Input 
                        id="portfolio" 
                        value={resumeData.portfolio || ''} 
                        onChange={(e) => setResumeData({...resumeData, portfolio: e.target.value})}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Summary</h3>
                  <div className="space-y-2">
                    <label htmlFor="summary">Write a brief summary of your professional background</label>
                    <Textarea 
                      id="summary" 
                      value={resumeData.summary} 
                      onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                      placeholder="Experienced software developer with 5+ years in web development..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <SkillsInput 
                      onAddSkill={handleAddSkill}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                        <button 
                          className="ml-2 text-gray-500 hover:text-red-500"
                          onClick={() => {
                            const newSkills = [...resumeData.skills];
                            newSkills.splice(index, 1);
                            setResumeData({...resumeData, skills: newSkills});
                          }}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {resumeData.skills.length === 0 && (
                      <div className="text-gray-500 italic">Add your skills to enhance your resume</div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowExperienceModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {resumeData.experiences.map((exp, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-bold">{exp.title}</h4>
                              <p className="text-gray-600">{exp.company} • {exp.location}</p>
                              <p className="text-gray-500 text-sm">{exp.startDate} - {exp.endDate}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newExperiences = [...resumeData.experiences];
                                newExperiences.splice(index, 1);
                                setResumeData({...resumeData, experiences: newExperiences});
                              }}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <p className="mt-2">{exp.description}</p>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {exp.achievements.map((achievement, idx) => (
                              <li key={idx}>{achievement}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.experiences.length === 0 && (
                      <div className="text-center p-6 border border-dashed rounded-lg">
                        <p className="text-gray-500">No work experience added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowExperienceModal(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Work Experience
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEducationModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-bold">{edu.degree}</h4>
                              <p className="text-gray-600">{edu.institution} • {edu.location}</p>
                              <p className="text-gray-500 text-sm">Graduated: {edu.graduationDate}</p>
                              {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newEducation = [...resumeData.education];
                                newEducation.splice(index, 1);
                                setResumeData({...resumeData, education: newEducation});
                              }}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          {edu.achievements && edu.achievements.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">Achievements:</p>
                              <ul className="list-disc pl-5 mt-1 space-y-1">
                                {edu.achievements.map((achievement, idx) => (
                                  <li key={idx}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {resumeData.education.length === 0 && (
                      <div className="text-center p-6 border border-dashed rounded-lg">
                        <p className="text-gray-500">No education added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowEducationModal(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Education
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Description</h3>
                  <div className="space-y-2">
                    <label htmlFor="jobDescription">
                      Paste the job description you're applying for to tailor your resume
                    </label>
                    <Textarea 
                      id="jobDescription" 
                      value={jobDescription} 
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateResume} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Resume
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimize" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimize Existing Resume</CardTitle>
              <CardDescription>Paste your current resume and a job description to optimize it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="existingResume">Paste Your Current Resume</label>
                  <Textarea 
                    id="existingResume" 
                    value={existingResume} 
                    onChange={(e) => setExistingResume(e.target.value)}
                    placeholder="Paste your current resume content here..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="optimizationJobDescription">Paste The Job Description</label>
                  <Textarea 
                    id="optimizationJobDescription" 
                    value={optimizationJobDescription} 
                    onChange={(e) => setOptimizationJobDescription(e.target.value)}
                    placeholder="Paste the job description you're applying for..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <Button 
                  onClick={handleOptimizeResume} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Optimize for ATS
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="result" className="mt-6">
          {resumeResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Your ATS-Friendly Resume</CardTitle>
                      <CardDescription>Ready to use for job applications</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Text
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] w-full rounded border p-4 bg-white text-black">
                      <pre className="whitespace-pre-wrap font-sans">{resumeResult.content}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>ATS Score</CardTitle>
                    <CardDescription>How well your resume performs with ATS</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold">{resumeResult.atsScore}</span>
                      <span className="text-2xl">/100</span>
                    </div>
                    <Progress value={resumeResult.atsScore} className="h-2" />
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-semibold mb-2">Suggested Improvements</h3>
                    <ul className="space-y-2">
                      {resumeResult.suggestedImprovements.map((suggestion, index) => (
                        <li key={index} className="flex gap-2">
                          <div className="mt-1 text-blue-500">•</div>
                          <div>{suggestion}</div>
                        </li>
                      ))}
                    </ul>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-semibold mb-2">Keyword Matches</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeResult.keywordMatches.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          <Check className="mr-1 h-3 w-3" /> {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Work Experience</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title">Job Title *</label>
                  <Input 
                    id="title" 
                    value={experienceForm.title} 
                    onChange={(e) => setExperienceForm({...experienceForm, title: e.target.value})}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company">Company *</label>
                  <Input 
                    id="company" 
                    value={experienceForm.company} 
                    onChange={(e) => setExperienceForm({...experienceForm, company: e.target.value})}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location">Location</label>
                <Input 
                  id="location" 
                  value={experienceForm.location} 
                  onChange={(e) => setExperienceForm({...experienceForm, location: e.target.value})}
                  placeholder="New York, NY"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate">Start Date *</label>
                  <Input 
                    id="startDate" 
                    value={experienceForm.startDate} 
                    onChange={(e) => setExperienceForm({...experienceForm, startDate: e.target.value})}
                    placeholder="Jan 2020"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate">End Date (or "Present")</label>
                  <Input 
                    id="endDate" 
                    value={experienceForm.endDate} 
                    onChange={(e) => setExperienceForm({...experienceForm, endDate: e.target.value})}
                    placeholder="Present"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description">Job Description</label>
                <Textarea 
                  id="description" 
                  value={experienceForm.description} 
                  onChange={(e) => setExperienceForm({...experienceForm, description: e.target.value})}
                  placeholder="Describe your role and responsibilities..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label>Key Achievements</label>
                {experienceForm.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={achievement} 
                      onChange={(e) => {
                        const newAchievements = [...experienceForm.achievements];
                        newAchievements[index] = e.target.value;
                        setExperienceForm({...experienceForm, achievements: newAchievements});
                      }}
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newAchievements = [...experienceForm.achievements];
                        newAchievements.splice(index, 1);
                        setExperienceForm({...experienceForm, achievements: newAchievements});
                      }}
                      disabled={experienceForm.achievements.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExperienceForm({
                    ...experienceForm, 
                    achievements: [...experienceForm.achievements, '']
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowExperienceModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExperience}>
                Add Experience
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Education</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="degree">Degree/Certificate *</label>
                <Input 
                  id="degree" 
                  value={educationForm.degree} 
                  onChange={(e) => setEducationForm({...educationForm, degree: e.target.value})}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="institution">Institution *</label>
                <Input 
                  id="institution" 
                  value={educationForm.institution} 
                  onChange={(e) => setEducationForm({...educationForm, institution: e.target.value})}
                  placeholder="University of Technology"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="eduLocation">Location</label>
                <Input 
                  id="eduLocation" 
                  value={educationForm.location} 
                  onChange={(e) => setEducationForm({...educationForm, location: e.target.value})}
                  placeholder="New York, NY"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="graduationDate">Graduation Date *</label>
                <Input 
                  id="graduationDate" 
                  value={educationForm.graduationDate} 
                  onChange={(e) => setEducationForm({...educationForm, graduationDate: e.target.value})}
                  placeholder="May 2020"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="gpa">GPA (optional)</label>
                <Input 
                  id="gpa" 
                  value={educationForm.gpa} 
                  onChange={(e) => setEducationForm({...educationForm, gpa: e.target.value})}
                  placeholder="3.8/4.0"
                />
              </div>
              
              <div className="space-y-2">
                <label>Achievements/Activities (optional)</label>
                {educationForm.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={achievement} 
                      onChange={(e) => {
                        const newAchievements = [...educationForm.achievements];
                        newAchievements[index] = e.target.value;
                        setEducationForm({...educationForm, achievements: newAchievements});
                      }}
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newAchievements = [...educationForm.achievements];
                        newAchievements.splice(index, 1);
                        setEducationForm({...educationForm, achievements: newAchievements});
                      }}
                      disabled={educationForm.achievements.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEducationForm({
                    ...educationForm, 
                    achievements: [...educationForm.achievements, '']
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Achievement
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEducationModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEducation}>
                Add Education
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SkillsInput component
interface SkillsInputProps {
  onAddSkill: (skill: string) => void;
}

const SkillsInput = ({ onAddSkill }: SkillsInputProps) => {
  const [skill, setSkill] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skill.trim()) {
        onAddSkill(skill.trim());
        setSkill('');
      }
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Add a skill"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-40"
      />
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          if (skill.trim()) {
            onAddSkill(skill.trim());
            setSkill('');
          }
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}; 