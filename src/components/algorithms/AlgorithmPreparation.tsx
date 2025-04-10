import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowRight } from "lucide-react";
import { useParameterStore } from "@/lib/parameter-store";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmPreparationProps {
  algorithm: AlgorithmDefinition;
  onStart: () => void;
}

export function AlgorithmPreparation({ algorithm, onStart }: AlgorithmPreparationProps) {
  const { parameters } = useParameterStore();
  
  // Check which required parameters are already stored
  const storedParameterIds = parameters.map(p => p.id);
  const requiredParameters = algorithm.preparationInfo.requiredParameters;
  const potentialParameters = algorithm.preparationInfo.potentialParameters;
  
  const missingRequiredParameters = requiredParameters.filter(
    paramId => !storedParameterIds.includes(paramId)
  );
  
  const missingPotentialParameters = potentialParameters.filter(
    paramId => !storedParameterIds.includes(paramId) && !requiredParameters.includes(paramId)
  );
  
  // Find parameter names for display
  const getParameterName = (paramId: string): string => {
    // Look through all nodes to find the parameter definition
    for (const nodeId in algorithm.nodes) {
      const node = algorithm.nodes[nodeId];
      if (node.parameters) {
        const param = node.parameters.find(p => p.id === paramId);
        if (param) {
          return param.name;
        }
      }
    }
    return paramId; // Fallback to ID if name not found
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prepare for {algorithm.name}</CardTitle>
        <CardDescription>
          Review the information needed for this algorithm
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Required Information</h3>
          {requiredParameters.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {requiredParameters.map(paramId => {
                const isStored = storedParameterIds.includes(paramId);
                return (
                  <li key={paramId} className={isStored ? "text-green-600 dark:text-green-400" : ""}>
                    {getParameterName(paramId)}
                    {isStored && " (already stored)"}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific information required to start.</p>
          )}
        </div>
        
        {potentialParameters.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">You May Also Need</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {potentialParameters.map(paramId => {
                const isStored = storedParameterIds.includes(paramId);
                return (
                  <li key={paramId} className={isStored ? "text-green-600 dark:text-green-400" : ""}>
                    {getParameterName(paramId)}
                    {isStored && " (already stored)"}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {missingRequiredParameters.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Missing required information</AlertTitle>
            <AlertDescription>
              You'll need to provide {missingRequiredParameters.length} required parameter(s) during the algorithm.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">About This Algorithm</h3>
          <p className="text-sm">{algorithm.description}</p>
          
          {algorithm.references && algorithm.references.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">References:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                {algorithm.references.map((reference, index) => (
                  <li key={index}>{reference}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full">
          Begin Algorithm
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}