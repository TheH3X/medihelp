import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/calculators/InputField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AlgorithmStep as AlgorithmStepType } from "@/lib/algorithm-definitions";

interface AlgorithmStepProps {
  step: AlgorithmStepType;
  onComplete: (inputs: Record<string, any>) => void;
}

export function AlgorithmStep({ step, onComplete }: AlgorithmStepProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  
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
    const missingInputs = step.parameters.filter(param => {
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
  
  const handleNext = () => {
    if (validateInputs()) {
      onComplete(inputs);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>
          {step.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step.question && (
          <h3 className="text-lg font-medium mb-4">{step.question}</h3>
        )}
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {step.parameters.map((param) => (
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
        <Button onClick={handleNext}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}