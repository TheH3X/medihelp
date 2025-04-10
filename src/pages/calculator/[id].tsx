import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCalculatorById } from "@/lib/calculator-definitions";
import { useParameterStore } from "@/lib/parameter-store";
import { Header } from "@/components/layout/Header";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { InputField } from "@/components/calculators/InputField";
import { ScreeningChecklist } from "@/components/calculators/ScreeningChecklist";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, AlertCircle } from "lucide-react";
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
  const [screeningEligible, setScreeningEligible] = useState(true);
  const [activeTab, setActiveTab] = useState("screening");
  const [validationError, setValidationError] = useState<string | null>(null);
  
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
    setScreeningEligible(isEligible);
    setActiveTab("calculator");
  };
  
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
                      <CardTitle>Pre-Screening</CardTitle>
                      <CardDescription>
                        No pre-screening questions are required for this calculator.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>You can proceed directly to the calculator.</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => {
                        setScreeningComplete(true);
                        setScreeningEligible(true);
                        setActiveTab("calculator");
                      }}>
                        Continue to Calculator
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
                    {!screeningEligible && (
                      <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Based on the screening questions, this calculator may not be appropriate for your patient.
                          Please interpret results with caution.
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
                  <ResultsDisplay
                    calculatorName={calculator.name}
                    calculatorId={calculator.id}
                    result={result}
                    inputs={inputs}
                    parameterLabels={parameterLabels}
                  />
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">References</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {calculator.references.map((reference, index) => (
                      <li key={index}>{reference}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}