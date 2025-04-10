import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AlgorithmDefinition, AlgorithmNode } from "@/lib/algorithm-definitions";

interface AlgorithmResultsProps {
  algorithm: AlgorithmDefinition;
  path: string[];
  inputs: Record<string, any>;
  finalNode: AlgorithmNode;
}

export function AlgorithmResults({ algorithm, path, inputs, finalNode }: AlgorithmResultsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("web");
  
  // Generate clinical text format
  const clinicalText = formatClinicalText({
    algorithmName: algorithm.name,
    finalNode,
    path,
    inputs,
    algorithm
  });
  
  // Generate printer-friendly format
  const printerFriendlyText = formatPrinterFriendly({
    algorithmName: algorithm.name,
    finalNode,
    path,
    inputs,
    algorithm
  });
  
  const handleCopyText = () => {
    const textToCopy = activeTab === "clinical" ? clinicalText : printerFriendlyText;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${algorithm.name} Results</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 16px; }
              pre { white-space: pre-wrap; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${algorithm.name} Results</h1>
            <pre>${printerFriendlyText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
  
  // Get the path as node names instead of IDs
  const pathNames = path.map(nodeId => {
    const node = algorithm.nodes[nodeId];
    return node ? node.content : nodeId;
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Results</CardTitle>
        <CardDescription>
          {algorithm.name} algorithm results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="web" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="web">Web View</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Text</TabsTrigger>
            <TabsTrigger value="print">Print View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="web" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Final Result</h3>
                <div className="p-4 border rounded-md bg-muted/30">
                  <h4 className="font-medium">{finalNode.content}</h4>
                  {finalNode.description && (
                    <p className="text-muted-foreground mt-1">{finalNode.description}</p>
                  )}
                </div>
              </div>
              
              {finalNode.recommendations && finalNode.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {finalNode.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium">Decision Path</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  {pathNames.map((nodeName, index) => (
                    <li key={index}>{nodeName}</li>
                  ))}
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="clinical" className="mt-4">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">{clinicalText}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="print" className="mt-4">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">{printerFriendlyText}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCopyText}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Text
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper functions for formatting results
function formatClinicalText({ 
  algorithmName, 
  finalNode, 
  path, 
  inputs, 
  algorithm 
}: { 
  algorithmName: string; 
  finalNode: AlgorithmNode; 
  path: string[]; 
  inputs: Record<string, any>; 
  algorithm: AlgorithmDefinition; 
}): string {
  // Format the path
  const pathText = path.map(nodeId => {
    const node = algorithm.nodes[nodeId];
    return node ? node.content : nodeId;
  }).join(" → ");
  
  // Format recommendations
  const recommendationsText = finalNode.recommendations ? 
    finalNode.recommendations.map(rec => `- ${rec}`).join("\\\\\n") : 
    "No specific recommendations provided.";
  
  return `${algorithmName} Assessment\\\\\n\\\\\n` +
    `Result: ${finalNode.content}\\\\\n` +
    `${finalNode.description ? finalNode.description + "\\\\\n\\\\\n" : "\\\\\n"}` +
    `Recommendations:\\\\\n${recommendationsText}\\\\\n\\\\\n` +
    `Decision Path:\\\\\n${pathText}`;
}

function formatPrinterFriendly({ 
  algorithmName, 
  finalNode, 
  path, 
  inputs, 
  algorithm 
}: { 
  algorithmName: string; 
  finalNode: AlgorithmNode; 
  path: string[]; 
  inputs: Record<string, any>; 
  algorithm: AlgorithmDefinition; 
}): string {
  // Format the path
  const pathText = path.map(nodeId => {
    const node = algorithm.nodes[nodeId];
    return node ? node.content : nodeId;
  }).join(" → ");
  
  // Format recommendations
  const recommendationsText = finalNode.recommendations ? 
    finalNode.recommendations.map(rec => `- ${rec}`).join("\\\\\n") : 
    "No specific recommendations provided.";
  
  // Format inputs
  const inputsText = Object.entries(inputs)
    .map(([key, value]) => {
      // Find the parameter definition to get the display name
      let paramName = key;
      for (const nodeId of path) {
        const node = algorithm.nodes[nodeId];
        if (node.parameters) {
          const param = node.parameters.find(p => p.id === key);
          if (param) {
            paramName = param.name;
            break;
          }
        }
      }
      
      if (typeof value === 'boolean') {
        return `${paramName}: ${value ? 'Yes' : 'No'}`;
      }
      return `${paramName}: ${value}`;
    })
    .join("\\\\\n");
  
  return `${algorithmName} Assessment\\\\\n\\\\\n` +
    `Date: ${new Date().toLocaleDateString()}\\\\\n\\\\\n` +
    `Result: ${finalNode.content}\\\\\n` +
    `${finalNode.description ? finalNode.description + "\\\\\n\\\\\n" : "\\\\\n"}` +
    `Recommendations:\\\\\n${recommendationsText}\\\\\n\\\\\n` +
    `Decision Path:\\\\\n${pathText}\\\\\n\\\\\n` +
    `Inputs:\\\\\n${inputsText}\\\\\n\\\\\n` +
    `References:\\\\\n${algorithm.references.map(ref => `- ${ref}`).join("\\\\\n")}\\\\\n\\\\\n` +
    `This assessment was generated using the Clinical Calculator App.`;
}