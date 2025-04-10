import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlgorithmById } from "@/lib/algorithm-definitions";
import { useParameterStore } from "@/lib/parameter-store";
import { Header } from "@/components/layout/Header";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { AlgorithmStep } from "@/components/algorithms/AlgorithmStep";
import { AlgorithmResult } from "@/components/algorithms/AlgorithmResult";
import { AlgorithmVisualizer } from "@/components/algorithms/AlgorithmVisualizer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GitBranch, ArrowRight, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AlgorithmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parameters, getParameterValue } = useParameterStore();
  
  const algorithm = id ? getAlgorithmById(id) : undefined;
  
  const [currentStepId, setCurrentStepId] = useState<string>("");
  const [pathHistory, setPathHistory] = useState<Array<{
    stepId: string;
    stepTitle: string;
    inputs: Record<string, any>;
    parameterLabels: Record<string, string>;
  }>>([]);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"algorithm" | "visualization">("algorithm");
  
  // Initialize with the first step
  useEffect(() => {
    if (algorithm) {
      setCurrentStepId(algorithm.initialStep);
      setPathHistory([]);
      setResult(null);
    }
  }, [algorithm]);
  
  if (!algorithm) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Algorithm Not Found</h1>
            <p className="mb-6">The algorithm you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const currentStep = algorithm.steps[currentStepId];
  
  // Create a mapping of parameter IDs to their display names for the current step
  const parameterLabels: Record<string, string> = {};
  currentStep?.parameters.forEach(param => {
    parameterLabels[param.id] = param.name;
  });
  
  const handleStepComplete = (inputs: Record<string, any>) => {
    // Add current step to path history
    setPathHistory(prev => [
      ...prev,
      {
        stepId: currentStepId,
        stepTitle: currentStep.title,
        inputs,
        parameterLabels: { ...parameterLabels }
      }
    ]);
    
    // Determine next step
    const nextStepId = currentStep.nextStep(inputs);
    
    if (nextStepId === null) {
      // End of algorithm reached without a specific result
      setResult({
        title: "Algorithm Complete",
        description: "The algorithm has been completed without a specific recommendation.",
        recommendation: "Please use clinical judgment for further management.",
        severity: "moderate"
      });
    } else if (algorithm.steps[nextStepId]) {
      // Move to next step
      setCurrentStepId(nextStepId);
    } else if (algorithm.results[nextStepId]) {
      // Show result
      setResult(algorithm.results[nextStepId]);
    } else {
      // Invalid next step
      console.error(`Invalid next step ID: ${nextStepId}`);
    }
  };
  
  const handleReset = () => {
    setCurrentStepId(algorithm.initialStep);
    setPathHistory([]);
    setResult(null);
    setActiveTab("algorithm");
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex">
        {/* Sidebar for stored parameters */}
        <aside className="hidden md:block w-64 border-r p-4 bg-muted/30">
          <StoredParametersList />
        </aside>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Algorithms
              </Button>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-full">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{algorithm.name}</h1>
                <p className="text-muted-foreground">{algorithm.description}</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "algorithm" | "visualization")}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                </TabsList>
                
                {(pathHistory.length > 0 || result) && (
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Algorithm
                  </Button>
                )}
              </div>
              
              <TabsContent value="algorithm" className="mt-2">
                {result ? (
                  <AlgorithmResult 
                    algorithmName={algorithm.name}
                    result={result}
                    pathHistory={pathHistory}
                  />
                ) : currentStep ? (
                  <AlgorithmStep 
                    step={currentStep}
                    onComplete={handleStepComplete}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Error</CardTitle>
                      <CardDescription>
                        Could not find the current step in the algorithm.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>There was an error processing the algorithm. Please try again.</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Algorithm
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                
                {pathHistory.length > 0 && !result && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Decision Path</h3>
                    <div className="border rounded-md p-4">
                      <ol className="space-y-4">
                        {pathHistory.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{step.stepTitle}</h4>
                              <ul className="mt-1 space-y-1">
                                {Object.entries(step.inputs).map(([key, value]) => {
                                  const label = step.parameterLabels[key] || key;
                                  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
                                  return (
                                    <li key={key} className="text-sm text-muted-foreground">
                                      {label}: <span className="font-medium text-foreground">{displayValue}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </li>
                        ))}
                        {!result && (
                          <li className="flex items-start">
                            <div className="flex-shrink-0 bg-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-xs font-medium text-primary-foreground">{pathHistory.length + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{currentStep?.title}</h4>
                              <p className="text-sm text-muted-foreground">Current step</p>
                            </div>
                          </li>
                        )}
                      </ol>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="visualization" className="mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Algorithm Visualization</CardTitle>
                    <CardDescription>
                      Visual representation of the algorithm flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlgorithmVisualizer 
                      algorithm={algorithm}
                      currentStepId={currentStepId}
                      pathHistory={pathHistory.map(step => step.stepId)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}