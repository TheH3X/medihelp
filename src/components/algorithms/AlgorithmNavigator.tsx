import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, HelpCircle, Save } from "lucide-react";
import { InputField } from "@/components/calculators/InputField";
import { useParameterStore } from "@/lib/parameter-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { AlgorithmDefinition, AlgorithmNode } from "@/lib/algorithm-definitions";

interface AlgorithmNavigatorProps {
  algorithm: AlgorithmDefinition;
  onComplete: (result: {
    path: string[];
    inputs: Record<string, any>;
    finalNode: AlgorithmNode;
  }) => void;
}

export function AlgorithmNavigator({ algorithm, onComplete }: AlgorithmNavigatorProps) {
  const { getParameterValue } = useParameterStore();
  
  // State for tracking the algorithm navigation
  const [currentNodeId, setCurrentNodeId] = useState<string>(algorithm.startNodeId);
  const [path, setPath] = useState<string[]>([algorithm.startNodeId]);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Get the current node
  const currentNode = algorithm.nodes[currentNodeId];
  
  // Pre-fill inputs with stored parameters
  useEffect(() => {
    if (currentNode && currentNode.parameters) {
      const prefilledInputs: Record<string, any> = {};
      
      currentNode.parameters.forEach(param => {
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
  }, [currentNodeId, currentNode]);
  
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
  
  const handleNext = () => {
    if (!currentNode || !currentNode.branches) {
      // If we're at a result node, complete the algorithm
      if (currentNode && currentNode.type === 'result') {
        onComplete({
          path,
          inputs,
          finalNode: currentNode
        });
      }
      return;
    }
    
    // Validate that all required parameters have values
    if (currentNode.parameters) {
      const missingInputs = currentNode.parameters.filter(param => {
        const value = inputs[param.id];
        return value === undefined || value === null || value === '';
      });
      
      if (missingInputs.length > 0) {
        const missingNames = missingInputs.map(param => param.name).join(', ');
        setValidationError(`Please fill in all required fields: ${missingNames}`);
        return;
      }
    }
    
    // Find the matching branch
    const matchingBranch = currentNode.branches.find(branch => branch.evaluator(inputs));
    
    if (matchingBranch) {
      const nextNodeId = matchingBranch.nextNodeId;
      setCurrentNodeId(nextNodeId);
      setPath(prev => [...prev, nextNodeId]);
      
      // If we've reached a result node, complete the algorithm
      if (algorithm.nodes[nextNodeId].type === 'result') {
        onComplete({
          path: [...path, nextNodeId],
          inputs,
          finalNode: algorithm.nodes[nextNodeId]
        });
      }
    } else {
      setValidationError("Could not determine the next step. Please check your inputs.");
    }
  };
  
  const handleBack = () => {
    if (path.length > 1) {
      const newPath = [...path];
      newPath.pop(); // Remove the current node
      const previousNodeId = newPath[newPath.length - 1];
      setCurrentNodeId(previousNodeId);
      setPath(newPath);
    }
  };
  
  // If we don't have a current node, something went wrong
  if (!currentNode) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error: Could not find the current node in the algorithm.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentNode.content}</CardTitle>
        {currentNode.description && (
          <CardDescription>{currentNode.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {/* Display parameters if this node has any */}
        {currentNode.parameters && currentNode.parameters.length > 0 && (
          <div className="space-y-4">
            {currentNode.parameters.map((param) => (
              <InputField
                key={param.id}
                parameter={param}
                value={inputs[param.id]}
                onChange={(value) => handleInputChange(param.id, value)}
              />
            ))}
          </div>
        )}
        
        {/* Display branches as radio options if this is a decision node */}
        {currentNode.branches && currentNode.branches.length > 0 && currentNode.type === 'decision' && (
          <div className="mt-4">
            <RadioGroup
              value={inputs['decision'] || ''}
              onValueChange={(value) => handleInputChange('decision', value)}
            >
              {currentNode.branches.map((branch) => (
                <div key={branch.condition} className="flex items-center space-x-2">
                  <RadioGroupItem value={branch.condition} id={branch.condition} />
                  <Label htmlFor={branch.condition}>{branch.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {/* Display recommendations if this is a result node */}
        {currentNode.type === 'result' && currentNode.recommendations && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Recommendations:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {currentNode.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Display validation error if any */}
        {validationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={path.length <= 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {currentNode.type !== 'result' ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => onComplete({ path, inputs, finalNode: currentNode })}>
            Complete
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}