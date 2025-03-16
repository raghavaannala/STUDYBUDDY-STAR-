
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Play, Code, Save, Download, ArrowRight } from 'lucide-react';
import GlassMorphCard from '../ui/GlassMorphCard';

const CodeEditor = () => {
  const [code, setCode] = useState(`function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}`);

  const [analysis, setAnalysis] = useState({
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    recommendation: 'Consider using quicksort for better average-case performance.',
    optimizedCode: `// Optimized version using quicksort
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}`
  });
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">CodeDiploMate</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Supercharge your coding with AI-powered assistance, optimization, and analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassMorphCard isDark>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span className="font-medium">Code Editor</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex items-center">
                    <Save className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                  <Button size="sm" variant="default" className="flex items-center">
                    <Play className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Run</span>
                  </Button>
                </div>
              </div>
              
              <div className="bg-black/90 rounded-lg code-block">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[400px] bg-transparent text-white p-4 font-mono text-sm resize-none focus:outline-none"
                />
              </div>
            </GlassMorphCard>
          </div>
          
          <div className="lg:col-span-1">
            <Tabs defaultValue="analysis">
              <TabsList className="w-full mb-4 grid grid-cols-2">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis">
                <GlassMorphCard className="h-full">
                  <h3 className="text-lg font-medium mb-4">Code Analysis</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Time Complexity</span>
                        <span className="text-sm text-primary font-mono">{analysis.timeComplexity}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Space Complexity</span>
                        <span className="text-sm text-primary font-mono">{analysis.spaceComplexity}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-1/4"></div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Recommendation:</h4>
                      <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                    </div>
                    
                    <Button className="w-full mt-4 btn-hover">
                      View Detailed Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </GlassMorphCard>
              </TabsContent>
              
              <TabsContent value="optimization">
                <GlassMorphCard className="h-full">
                  <h3 className="text-lg font-medium mb-4">Optimized Solution</h3>
                  
                  <div className="bg-black/90 rounded-lg code-block p-3 mb-4 max-h-[356px] overflow-auto">
                    <pre className="text-xs md:text-sm">
                      <code>{analysis.optimizedCode}</code>
                    </pre>
                  </div>
                  
                  <Button className="w-full btn-hover">
                    Apply Optimization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </GlassMorphCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeEditor;
