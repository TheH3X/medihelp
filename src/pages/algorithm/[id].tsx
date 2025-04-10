import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlgorithmById } from "@/lib/algorithm-definitions";
import { Header } from "@/components/layout/Header";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { AlgorithmNavigator } from "@/components/algorithms/AlgorithmNavigator";
import { AlgorithmFlowchart } from "@/components/algorithms/AlgorithmFlowchart";
import { AlgorithmResults } from "@/components/algorithms/AlgorithmResults";
import { AlgorithmPreparation } from "@/components/algorithms/AlgorithmPreparation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitBranch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AlgorithmNode } from "@/lib/algorithm-definitions";

export default function AlgorithmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const algorithm = id ? getAlgorithmById(id) : undefined;
  
  const [activeTab, setActiveTab] = useState<"preparation" | "algorithm" | "results">("preparation");
  const [algorithmStarted, setAlgorithmStarted] = useState(false);
  const [algorithmCompleted, setAlgorithmCompleted] = useState(false);
  const [result, setResult] = useState<{
    path: string[];
    inputs: Record<string, any>;
    finalNode: AlgorithmNode;
  } | null>(null);
  
  const handleStartAlgorithm = () => {
    setAlgorithmStarted(true);
    setActiveTab("algorithm");
  };
  
  const handleAlgorithmComplete = (result: {
    path: string[];
    inputs: Record<string, any>;
    finalNode: AlgorithmNode;
  }) => {
    setResult(result);
    setAlgorithmCompleted(true);
    setActiveTab("results");
  };
  
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
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="algorithm" disabled={!algorithmStarted}>Algorithm</TabsTrigger>
                <TabsTrigger value="results" disabled={!algorithmCompleted}>Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preparation" className="mt-6">
                <AlgorithmPreparation 
                  algorithm={algorithm}
                  onStart={handleStartAlgorithm}
                />
              </TabsContent>
              
              <TabsContent value="algorithm" className="mt-6">
                <AlgorithmNavigator 
                  algorithm={algorithm}
                  onComplete={handleAlgorithmComplete}
                />
              </TabsContent>
              
              <TabsContent value="results" className="mt-6">
                {result && (
                  <>
                    <AlgorithmResults
                      algorithm={algorithm}
                      path={result.path}
                      inputs={result.inputs}
                      finalNode={result.finalNode}
                    />
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Algorithm Visualization</h3>
                      <AlgorithmFlowchart 
                        algorithm={algorithm}
                        path={result.path}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">References</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {algorithm.references.map((reference, index) => (
                          <li key={index}>{reference}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}