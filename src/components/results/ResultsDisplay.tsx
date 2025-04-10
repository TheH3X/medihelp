import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Printer, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatClinicalText, formatPrinterFriendly } from "@/lib/result-formatter";
import { AlgorithmDiagram } from "./AlgorithmDiagram";
import { CVRiskResultsMatrix } from "./CVRiskResultsMatrix";
import type { CalculationResult } from "@/lib/calculator-definitions";

interface ResultsDisplayProps {
  calculatorName: string;
  calculatorId: string;
  result: CalculationResult;
  inputs: Record<string, any>;
  parameterLabels: Record<string, string>;
}

export function ResultsDisplay({ calculatorName, calculatorId, result, inputs, parameterLabels }: ResultsDisplayProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("web");
  
  const clinicalText = formatClinicalText({
    calculatorName,
    result,
    inputs,
    parameterLabels,
  });
  
  const printerFriendlyText = formatPrinterFriendly({
    calculatorName,
    result,
    inputs,
    parameterLabels,
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
            <title>${calculatorName} Results</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 16px; }
              pre { white-space: pre-wrap; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>${calculatorName} Results</h1>
            <pre>${printerFriendlyText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
  
  const getSeverityIcon = () => {
    switch (result.severity) {
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'high':
      case 'very-high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getSeverityColor = () => {
    switch (result.severity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'high':
      case 'very-high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  // Determine if this is the combined CV risk calculator
  const isCombinedCVRisk = calculatorId === 'combined-cv-risk';
  
  // Adjust tabs based on calculator type
  const tabsList = isCombinedCVRisk ? (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="web">Web View</TabsTrigger>
      <TabsTrigger value="matrix">Treatment Matrix</TabsTrigger>
      <TabsTrigger value="clinical">Clinical Text</TabsTrigger>
      <TabsTrigger value="print">Print View</TabsTrigger>
    </TabsList>
  ) : (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="web">Web View</TabsTrigger>
      <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
      <TabsTrigger value="clinical">Clinical Text</TabsTrigger>
      <TabsTrigger value="print">Print View</TabsTrigger>
    </TabsList>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Results
          {getSeverityIcon()}
        </CardTitle>
        <CardDescription>
          {calculatorName} calculation results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="web" onValueChange={setActiveTab}>
          {tabsList}
          
          <TabsContent value="web" className="mt-4 space-y-4">
            <div className="flex items-center justify-center">
              <div className={`text-4xl font-bold rounded-full h-16 w-16 flex items-center justify-center ${getSeverityColor()}`}>
                {typeof result.score === 'number' ? result.score.toFixed(1) : result.score}
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium">Interpretation</h3>
              <p>{result.interpretation}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Input Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(inputs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{parameterLabels[key] || key}:</span>
                    <span className="font-medium">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {!isCombinedCVRisk && (
            <TabsContent value="algorithm" className="mt-4">
              <AlgorithmDiagram 
                calculatorId={calculatorId}
                result={result}
                inputs={inputs}
              />
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>This diagram shows the algorithm path based on your inputs, with the highlighted path indicating the result.</p>
              </div>
            </TabsContent>
          )}
          
          {isCombinedCVRisk && (
            <TabsContent value="matrix" className="mt-4">
              <CVRiskResultsMatrix 
                result={result}
                inputs={inputs}
              />
            </TabsContent>
          )}
          
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