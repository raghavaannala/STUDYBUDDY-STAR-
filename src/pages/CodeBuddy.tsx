import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Code, Calendar, ExternalLink, Timer, Filter, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CodingProblem, 
  ContestInfo, 
  codingService 
} from '@/services/codingProblems';
import { useAuth } from '@/contexts/AuthContext';

export default function CodeBuddy() {
  console.log("CodeBuddy component rendering - start");
  
  // State management
  const [activeTab, setActiveTab] = useState("problems");
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [solution, setSolution] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch problems and contests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('CodeBuddy: Starting to fetch data...');
        
        // Wrap in try-catch to catch any issues with the service
        try {
          // Fetch problems
          console.log('CodeBuddy: About to fetch problems...');
          const problemsData = await codingService.getProblems();
          console.log('CodeBuddy: Problems fetched:', problemsData?.length);
          setProblems(problemsData || []);
        } catch (problemError) {
          console.error("Error fetching problems:", problemError);
          setProblems([]);
        }
        
        try {
          // Fetch contests
          console.log('CodeBuddy: About to fetch contests...');
          const contestsData = await codingService.getContests();
          console.log('CodeBuddy: Contests fetched:', contestsData?.length);
          setContests(contestsData || []);
        } catch (contestError) {
          console.error("Error fetching contests:", contestError);
          setContests([]);
        }
        
      } catch (error) {
        console.error("CodeBuddy: Error in main fetch data block:", error);
        setError(error instanceof Error ? error.message : "Failed to load data");
        toast({
          title: "Error",
          description: "Failed to fetch coding problems and contests",
          variant: "destructive"
        });
      } finally {
        console.log('CodeBuddy: Fetch complete, setting isLoading to false');
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      console.log('CodeBuddy: Component unmounting');
    };
  }, [toast]);
  
  // Safe filter problems based on search and filters
  const filteredProblems = useMemo(() => {
    console.log('CodeBuddy: Filtering problems, count:', problems?.length);
    if (!problems || problems.length === 0) return [];
    
    return problems.filter(problem => {
      try {
        const matchesSearch = searchQuery === "" || 
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
        const matchesSource = !selectedSource || problem.source === selectedSource;
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.every(tag => problem.tags.includes(tag));
        
        return matchesSearch && matchesDifficulty && matchesSource && matchesTags;
      } catch (filterError) {
        console.error("Error filtering problem:", filterError, problem);
        return false;
      }
    });
  }, [problems, searchQuery, selectedDifficulty, selectedSource, selectedTags]);
  
  // Get unique sources for filter - safely
  const sources = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    try {
      return Array.from(new Set(problems.map(p => p.source)));
    } catch (error) {
      console.error("Error getting sources:", error);
      return [];
    }
  }, [problems]);
  
  // Get unique tags for filter
  const allTags = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    try {
      const tagSet = new Set<string>();
      problems.forEach(problem => {
        problem.tags.forEach(tag => tagSet.add(tag));
      });
      return Array.from(tagSet);
    } catch (error) {
      console.error("Error getting tags:", error);
      return [];
    }
  }, [problems]);
  
  // Handle contest registration
  const handleRegisterContest = async (contestId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for contests",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await codingService.registerForContest(user.uid, contestId);
      setContests(prev => prev.map(contest => 
        contest.id === contestId ? {...contest, registered: true} : contest
      ));
      
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the contest"
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the contest",
        variant: "destructive"
      });
    }
  };
  
  // Render problem difficulty label
  const renderProblemDifficulty = (difficulty: string) => {
    const colorMap = {
      'Easy': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Hard': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded border ${colorMap[difficulty as keyof typeof colorMap]}`}>
        {difficulty}
      </span>
    );
  };
  
  // Render contest difficulty label
  const renderContestDifficulty = (difficulty: string) => {
    const colorMap = {
      'Beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded border ${colorMap[difficulty as keyof typeof colorMap]}`}>
        {difficulty}
      </span>
    );
  };

  // Use a variant of toast that works with our theme
  const showToast = (title: string, description: string, type: "default" | "destructive") => {
    toast({
      title,
      description,
      variant: type
    });
  };

  // Handle running tests for a solution
  const handleRunTests = async () => {
    if (!selectedProblem || !solution.trim()) return;
    
    setIsRunningTests(true);
    setTestResults(null);
    
    try {
      const results = await codingService.runTests(
        selectedProblem.id,
        solution,
        selectedLanguage
      );
      
      setTestResults(results);
      
      if (results.success) {
        showToast(
          "Tests Passed",
          "All test cases passed successfully!",
          "default"
        );
      } else {
        showToast(
          "Tests Failed",
          "Some test cases failed. Check the results.",
          "destructive"
        );
      }
    } catch (error) {
      showToast(
        "Test Error",
        "Failed to run tests",
        "destructive"
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // Handle solution submission
  const handleSubmitSolution = async () => {
    if (!user || !selectedProblem) return;
    
    setIsSubmitting(true);
    
    try {
      await codingService.submitSolution({
        userId: user.uid,
        problemId: selectedProblem.id,
        code: solution,
        language: selectedLanguage,
        status: "Accepted", // This would be determined by testing in a real implementation
      });
      
      // Run tests first to show results
      const results = await codingService.runTests(
        selectedProblem.id,
        solution,
        selectedLanguage
      );
      
      setTestResults(results);
      
      if (results.success) {
        showToast(
          "Solution Submitted",
          "Your solution has been submitted successfully!",
          "default"
        );
      } else {
        showToast(
          "Submission Failed",
          "Your solution failed some test cases.",
          "destructive"
        );
      }
    } catch (error) {
      showToast(
        "Submission Failed",
        "Failed to submit your solution",
        "destructive"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // If a problem is selected, show the full problem solving interface
  if (selectedProblem) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => {
              setSelectedProblem(null);
              setSolution("");
              setTestResults(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to problems
          </Button>
          
          <h2 className="text-2xl font-bold">{selectedProblem.title}</h2>
          <div className="ml-3">
            {renderProblemDifficulty(selectedProblem.difficulty)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {selectedProblem.tags && selectedProblem.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-purple-950/30">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs bg-blue-950/30">
            {selectedProblem.source}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Problem description and test cases */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p>{selectedProblem.description}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProblem.testCases && selectedProblem.testCases.map((testCase, index) => (
                    <div key={index} className="rounded-md bg-gray-800/50 p-4 text-sm">
                      <h4 className="text-sm font-medium mb-2">Test Case {index + 1}</h4>
                      <div className="mb-2">
                        <span className="text-gray-400">Input:</span> 
                        <code className="text-xs bg-gray-700 p-1 rounded ml-2 block mt-1 whitespace-pre-wrap">{testCase.input}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Expected Output:</span> 
                        <code className="text-xs bg-gray-700 p-1 rounded ml-2 block mt-1 whitespace-pre-wrap">{testCase.output}</code>
                      </div>
                      {testCase.explanation && (
                        <div className="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
                          <span className="font-medium">Explanation:</span> {testCase.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Test Results Section */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    Test Results
                    {testResults.success ? (
                      <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="ml-2 h-5 w-5 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-auto">
                    {testResults.results.map((result: any, index: number) => (
                      <div 
                        key={index} 
                        className={`rounded-md ${result.passed ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'} p-3 text-sm`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            Test Case {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          {result.time && (
                            <span className="text-xs text-gray-400">
                              {result.time}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="text-gray-400">Input:</span> 
                            <code className="ml-2 bg-gray-800 p-1 rounded block mt-1">{result.input}</code>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Expected:</span> 
                            <code className="ml-2 bg-gray-800 p-1 rounded block mt-1">{result.expected}</code>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-400">Actual:</span> 
                            <code className={`ml-2 bg-gray-800 p-1 rounded block mt-1 ${!result.passed ? 'text-red-400' : ''}`}>
                              {result.actual}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Badge 
                      variant={testResults.success ? "default" : "destructive"} 
                      className="text-sm px-4 py-1"
                    >
                      {testResults.success ? 'All Tests Passed' : 'Some Tests Failed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right side - Code editor and controls */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Your Solution</CardTitle>
                  <Select 
                    defaultValue="javascript" 
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-2">
                <Textarea 
                  className="font-mono text-sm h-[calc(100vh-350px)] min-h-64 bg-gray-800/70 resize-none"
                  placeholder={getLanguageTemplate(selectedLanguage, selectedProblem.title)}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                />
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-4 space-x-4">
                <Button 
                  variant="outline"
                  onClick={handleRunTests}
                  disabled={isRunningTests || !solution.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {isRunningTests ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Running Tests...
                    </>
                  ) : (
                    'Run Tests'
                  )}
                </Button>
                
                <Button 
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting || !solution.trim()}
                  size="lg"
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Solution'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          CodeBuddy
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Practice competitive coding problems, participate in contests, and improve your algorithmic skills
        </p>
      </div>
      
      {error && (
        <div className="p-4 mb-6 border border-red-500/30 bg-red-500/10 rounded-md text-center">
          <p className="text-red-400 mb-2">Error loading content:</p>
          <p className="text-red-300 text-sm">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/20"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading coding problems and contests...</p>
        </div>
      ) : (
        <>
          <Tabs 
            defaultValue="problems" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="problems" className="text-sm">
                <Code className="h-4 w-4 mr-2" />
                Practice Problems
              </TabsTrigger>
              <TabsTrigger value="contests" className="text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Contests
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="problems">
              <div className="flex flex-col gap-4 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search problems by title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select onValueChange={(value) => setSelectedDifficulty(value === "all" ? null : value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {sources && sources.length > 0 && (
                    <Select onValueChange={(value) => setSelectedSource(value === "all" ? null : value)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {sources.map((source) => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTags([])}
                      className="text-xs"
                    >
                      Clear Tags
                    </Button>
                  )}
                </div>
                
                {/* Tag selector */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant={selectedTags.includes(tag) ? "default" : "outline"} 
                      className={`text-xs cursor-pointer hover:bg-purple-950/30 ${
                        selectedTags.includes(tag) ? 'bg-purple-600/60' : 'bg-purple-950/10'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProblems && filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <Card key={problem.id} className="hover:shadow-md hover:border-purple-500/50 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{problem.title}</CardTitle>
                          {renderProblemDifficulty(problem.difficulty)}
                        </div>
                        <CardDescription className="flex items-center text-xs">
                          <span className="mr-2">{problem.source}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {problem.tags && problem.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-purple-950/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm line-clamp-2 text-gray-400">
                          {problem.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={() => {
                            setSelectedProblem(problem);
                            setSolution("");
                            setTestResults(null);
                          }}
                        >
                          Solve Problem
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                    <Filter className="h-12 w-12 mb-2 opacity-30" />
                    <p>No problems match your filters</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedDifficulty(null);
                        setSelectedSource(null);
                        setSelectedTags([]);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="contests">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Upcoming Contests</h2>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contests && contests.length > 0 ? (
                  contests.map((contest) => (
                    <Card key={contest.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{contest.title}</CardTitle>
                          {renderContestDifficulty(contest.difficulty)}
                        </div>
                        <CardDescription>
                          <div className="flex items-center text-xs mt-1">
                            <span className="font-semibold text-purple-400">{contest.platform}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {format(new Date(contest.startTime), 'PPP')}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Timer className="h-4 w-4 mr-2 text-gray-400" />
                            Duration: {contest.duration} minutes
                          </div>
                          {contest.description && (
                            <p className="text-gray-400 mt-2">
                              {contest.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        {contest.url && (
                          <Button variant="link" className="p-0" asChild>
                            <a href={contest.url} target="_blank" rel="noopener noreferrer">
                              Visit <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                        
                        <Button 
                          variant={contest.registered ? "outline" : "secondary"}
                          disabled={contest.registered}
                          onClick={() => handleRegisterContest(contest.id)}
                        >
                          {contest.registered ? "Registered" : "Register"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                    <Calendar className="h-12 w-12 mb-2 opacity-30" />
                    <p>No contests available at the moment</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Past Contests</h2>
                <Card className="bg-gray-800/50">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-gray-400">Past contests will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Function to generate code templates based on language
function getLanguageTemplate(language: string, problemTitle: string): string {
  const title = problemTitle.replace(/\s+/g, ''); // Remove spaces for function name
  
  switch (language) {
    case 'javascript':
      return `/**
 * ${problemTitle} Solution
 */
function solve${title}(input) {
  // Your solution here
  
  return result;
}

// Example usage:
// solve${title}([1, 2, 3]);`;

    case 'python':
      return `# ${problemTitle} Solution

def solve_${title.toLowerCase()}(input):
    # Your solution here
    
    return result

# Example usage:
# solve_${title.toLowerCase()}([1, 2, 3])`;

    case 'java':
      return `/**
 * ${problemTitle} Solution
 */
public class Solution {
    public static void main(String[] args) {
        // Example usage
        // int[] input = {1, 2, 3};
        // System.out.println(solve${title}(input));
    }
    
    public static int solve${title}(int[] input) {
        // Your solution here
        
        return result;
    }
}`;

    case 'cpp':
      return `#include <iostream>
#include <vector>
using namespace std;

/**
 * ${problemTitle} Solution
 */
int solve${title}(vector<int>& input) {
    // Your solution here
    
    return result;
}

int main() {
    // Example usage
    // vector<int> input = {1, 2, 3};
    // cout << solve${title}(input) << endl;
    return 0;
}`;

    default:
      return `// Write your solution for ${problemTitle} here`;
  }
} 