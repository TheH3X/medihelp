import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AlgorithmNode } from "@/lib/algorithm-definitions";

interface AlgorithmResultProps {
  algorithmName: string;
  finalNode: AlgorithmNode;
  path: string[];
  inputs: Record<string, any>;
}

export function AlgorithmResult({ algorithmName, finalNode, path, inputs }: AlgorithmResultProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("web");
  
  // Generate clinical text format
  const clinicalText = formatClinicalText({
    algorithmName,
    finalNode,
    path,
    inputs
  });
  
  // Generate printer-friendly format
  const printerFriendlyText = formatPrinterFriendly({
    algorithmName,
    finalNode,
    path,
    inputs
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
            <title>${algorithmName} Results</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 16px; }
              pre { white-space: pre-wrap; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${algorithmName} Results</h1>
            <pre>${printerFriendlyText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Results</CardTitle>
        <CardDescription>
          {algorithmName} algorithm results
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopyText}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for formatting results
function formatClinicalText({ 
  algorithmName, 
  finalNode, 
  path, 
  inputs 
}: { 
  algorithmName: string; 
  finalNode: AlgorithmNode; 
  path: string[]; 
  inputs: Record<string, any>; 
}): string {
  // Format recommendations
  const recommendationsText = finalNode.recommendations ? 
    finalNode.recommendations.map(rec => `- ${rec}`).join("\\n") : 
    "No specific recommendations provided.";
  
  return `${algorithmName} Assessment\\n\\n` +
    `Result: ${finalNode.content}\\n` +
    `${finalNode.description ? finalNode.description + "\\n\\n" : "\\n"}` +
    `Recommendations:\\n${recommendationsText}`;
}

function formatPrinterFriendly({ 
  algorithmName, 
  finalNode, 
  path, 
  inputs 
}: { 
  algorithmName: string; 
  finalNode: AlgorithmNode; 
  path: string[]; 
  inputs: Record<string, any>; 
}): string {
  // Format recommendations
  const recommendationsText = finalNode.recommendations ? 
    finalNode.recommendations.map(rec => `- ${rec}`).join("\\n") : 
    "No specific recommendations provided.";
  
  // Format inputs
  const inputsText = Object.entries(inputs)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `${key}: ${value ? 'Yes' : 'No'}`;
      }
      return `${key}: ${value}`;
    })
    .join("\\n");
  
  return `${algorithmName} Assessment\\n\\n` +
    `Date: ${new Date().toLocaleDateString()}\\n\\n` +
    `Result: ${finalNode.content}\\n` +
    `${finalNode.description ? finalNode.description + "\\n\\n" : "\\n"}` +
    `Recommendations:\\n${recommendationsText}\\n\\n` +
    `Inputs:\\n${inputsText}\\n\\n` +
    `This assessment was generated using the Clinical Calculator App.`;
}