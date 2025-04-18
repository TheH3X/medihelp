import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCalculatorById } from "@/lib/calculator-definitions";
import { useParameterStore } from "@/lib/parameter-store";
import { Header } from "@/components/layout/Header";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { InputField } from "@/components/calculators/InputField";
import { ScreeningChecklist } from "@/components/calculators/ScreeningChecklist";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { AlgorithmDiagram } from "@/components/results/AlgorithmDiagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, AlertCircle, Save, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parameters, getParameterValue } = useParameterStore();
  
  const calculator = id ? getCalculatorById(id) : undefined;
  
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [screeningComplete, setScreeningComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("screening");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Create a mapping of parameter IDs to their display names
  const parameterLabels: Record<string, string> = {};
  calculator?.parameters.forEach(param => {
    parameterLabels[param.id] = param.name;
  });
  
  // Pre-fill inputs with stored parameters
  useEffect(() => {
    if (calculator) {
      const prefilledInputs: Record<string, any> = {};
      
      calculator.parameters.forEach(param => {
        const storedValue = getParameterValue(param.id);
        if (storedValue !== undefined) {
          prefilledInputs[param.id] = storedValue;
        }
      });
      
      setInputs(prev => ({
        ...prev,
        ...prefilledInputs
      }));
    }
  }, [calculator, parameters]);
  
  const handleInputChange = (id: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear validation error when user changes input
    if (validationError) {
      setValidationError(null);
    }
  };
  
  const validateInputs = () => {
    if (!calculator) return false;
    
    const missingInputs = calculator.parameters.filter(param => {
      const value = inputs[param.id];
      return value === undefined || value === null || value === '';
    });
    
    if (missingInputs.length > 0) {
      const missingNames = missingInputs.map(param => param.name).join(', ');
      setValidationError(`Please fill in all required fields: ${missingNames}`);
      return false;
    }
    
    return true;
  };
  
  const handleCalculate = () => {
    if (calculator && validateInputs()) {
      const calculationResult = calculator.calculate(inputs);
      setResult(calculationResult);
      setActiveTab("results");
    }
  };
  
  const handleScreeningComplete = (isEligible: boolean) => {
    setScreeningComplete(true);
    setActiveTab("calculator");
  };
  
  // Check if calculator has any storable parameters
  const hasStorableParameters = calculator?.parameters.some(param => param.storable) || false;
  
  if (!calculator) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Calculator Not Found</h1>
            <p className="mb-6">The calculator you're looking for doesn't exist.</p>
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
        {/* Sidebar toggle button for mobile */}
        <div className="md:hidden fixed bottom-4 left-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full shadow-lg bg-background"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Sidebar for stored parameters */}
        <aside 
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                     md:translate-x-0 transition-transform duration-200 ease-in-out
                     fixed md:static z-20 h-[calc(100vh-4rem)] md:h-auto
                     w-64 border-r p-4 bg-muted/30 shadow-lg md:shadow-none`}
        >
          <StoredParametersList />
        </aside>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Calculators
              </Button>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded-full">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{calculator.name}</h1>
                <p className="text-muted-foreground">{calculator.description}</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="screening">Screening</TabsTrigger>
                <TabsTrigger value="calculator" disabled={!screeningComplete}>Calculator</TabsTrigger>
                <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="screening" className="mt-6">
                {calculator.screeningQuestions.length > 0 ? (
                  <ScreeningChecklist 
                    questions={calculator.screeningQuestions} 
                    onComplete={handleScreeningComplete}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pre-Screening Checklist</CardTitle>
                      <CardDescription>
                        No pre-screening questions are defined for this calculator.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        You can proceed directly to the calculator.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={() => handleScreeningComplete(true)}>
                        Proceed to Calculator
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="calculator" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Input Parameters</CardTitle>
                    <CardDescription>
                      Enter the required information to calculate the {calculator.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasStorableParameters && (
                      <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-800 dark:text-blue-300">
                          Some parameters can be saved for reuse across calculators. Look for the "Save for reuse" button next to input fields.
                        </AlertDescription>
                      </Alert>
                    )}
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {calculator.parameters.map((param) => (
                          <InputField
                            key={param.id}
                            parameter={param}
                            value={inputs[param.id]}
                            onChange={(value) => handleInputChange(param.id, value)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex flex-col items-end gap-2">
                    {validationError && (
                      <Alert variant="destructive" className="w-full">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {validationError}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button onClick={handleCalculate}>
                      Calculate Score
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="results" className="mt-6">
                {result && (
                  <>
                    <ResultsDisplay
                      calculatorName={calculator.name}
                      result={result}
                      inputs={inputs}
                      parameterLabels={parameterLabels}
                    />
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Algorithm Visualization</h3>
                      <AlgorithmDiagram 
                        calculatorId={calculator.id}
                        result={result}
                        inputs={inputs}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">References</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {calculator.references.map((reference, index) => (
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