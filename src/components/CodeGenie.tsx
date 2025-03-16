import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import { generateCode, optimizeCode, explainCode, resetChatSession } from '../services/codeDiploMate';
import { Loader2, Code, Zap, HelpCircle, RefreshCw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ComplexityChart } from './ComplexityChart';

interface CodeOutput {
  code: string;
  explanation: string;
  complexity?: {
    timeComplexity: string;
    spaceComplexity: string;
    operations: { n: number; time: number; }[];
  };
}

export function CodeGenie() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<CodeOutput | null>(null);
  const [language, setLanguage] = useState('javascript');
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCode(prompt);
      setOutput({
        code: result.code,
        explanation: '',
        complexity: result.complexity,
      });
      
      toast({
        title: "Success",
        description: "Code generated successfully!",
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeCode = async () => {
    if (!output?.code) {
      toast({
        title: "Error",
        description: "No code to optimize",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await optimizeCode(output.code);
      setOutput({
        code: result,
        explanation: ''
      });
      toast({
        title: "Success",
        description: "Code optimized successfully!",
      });
    } catch (error) {
      console.error('Error optimizing code:', error);
      toast({
        title: "Error",
        description: "Failed to optimize code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = async () => {
    if (!output?.code) {
      toast({
        title: "Error",
        description: "No code to explain",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const explanation = await explainCode(output.code);
      setOutput({ ...output, explanation });
      toast({
        title: "Success",
        description: "Code explanation generated!",
      });
    } catch (error) {
      console.error('Error explaining code:', error);
      toast({
        title: "Error",
        description: "Failed to explain code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = async () => {
    try {
      await resetChatSession();
      toast({
        title: "Success",
        description: "Chat session reset successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset chat session",
        variant: "destructive",
      });
    }
  };

  const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080');

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">CodeDiplomate</h2>
          <p className="text-muted-foreground">
            Powered by Gemini AI - Ask me to generate, optimize, or explain code
          </p>
        </div>
        <Button onClick={handleResetSession} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Session
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Textarea
            placeholder="Describe what you want to do... (e.g., 'Write a function to find the fibonacci sequence using dynamic programming')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-32 font-mono"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateCode}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Code className="mr-2 h-4 w-4" />
              )}
              Generate Code
            </Button>
            <Button
              onClick={handleOptimizeCode}
              disabled={isLoading || !output}
              variant="secondary"
            >
              <Zap className="mr-2 h-4 w-4" />
              Optimize
            </Button>
            <Button
              onClick={handleExplainCode}
              disabled={isLoading || !output}
              variant="secondary"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Explain
            </Button>
          </div>
        </div>

        {output && (
          <Card className="p-4 space-y-6">
            <div>
              <h3 className="font-medium mb-2">Generated Code:</h3>
              <div className="rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={language}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                  }}
                >
                  {output.code}
                </SyntaxHighlighter>
              </div>
            </div>
            
            {output.complexity && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Complexity Analysis:</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Time Complexity</p>
                    <p className="text-lg font-mono">{output.complexity.timeComplexity}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Space Complexity</p>
                    <p className="text-lg font-mono">{output.complexity.spaceComplexity}</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ComplexityChart 
                    operations={output.complexity.operations}
                    timeComplexity={output.complexity.timeComplexity}
                  />
                </div>
              </div>
            )}
            
            {output.explanation && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Explanation:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {output.explanation}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 