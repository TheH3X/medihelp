import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Printer, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { AlgorithmResult as AlgorithmResultType } from "@/lib/algorithm-definitions";

interface AlgorithmResultProps {
  algorithmName: string;
  result: AlgorithmResultType;
  pathHistory: Array<{
    stepId: string;
    stepTitle: string;
    inputs: Record<string, any>;
    parameterLabels: Record<string, string>;
  }>;
}

export function AlgorithmResult({ algorithmName, result, pathHistory }: AlgorithmResultProps) {
  const { toast } = useToast();
  
  const formatPathHistory = () => {
    return pathHistory.map(step => {
      const inputSummary = Object.entries(step.inputs)
        .map(([key, value]) => {
          const label = step.parameterLabels[key] || key;
          const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
          return `${label}: ${displayValue}`;
        })
        .join(', ');
      
      return `${step.stepTitle}: ${inputSummary}`;
    }).join('\\n');
  };
  
  const formatClinicalText = () => {
    return `${algorithmName} Results\\n\\n` +
      `Recommendation: ${result.title}\\n` +
      `${result.description}\\n\\n` +
      `Action: ${result.recommendation}\\n\\n` +
      `Decision Path:\\n${formatPathHistory()}`;
  };
  
  const formatPrinterFriendly = () => {
    return `${algorithmName} Results\\n\\n` +
      `Date: ${new Date().toLocaleDateString()}\\n\\n` +
      `Recommendation: ${result.title}\\n` +
      `${result.description}\\n\\n` +
      `Action: ${result.recommendation}\\n\\n` +
      `Decision Path:\\n${formatPathHistory()}\\n\\n` +
      `This assessment was generated using the Clinical Algorithm App.`;
  };
  
  const handleCopyText = () => {
    const textToCopy = formatClinicalText();
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard",
      description: "The clinical text has been copied to your clipboard.",
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
            <pre>${formatPrinterFriendly()}</pre>
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
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'very-high':
        return 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-50';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {result.title}
            {getSeverityIcon()}
          </CardTitle>
          <Badge className={getSeverityColor()}>
            {result.severity === 'very-high' ? 'Very High Priority' :
             result.severity === 'high' ? 'High Priority' :
             result.severity === 'moderate' ? 'Moderate Priority' : 'Low Priority'}
          </Badge>
        </div>
        <CardDescription>
          {result.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4 bg-muted/30">
          <h3 className="font-medium mb-2">Recommendation</h3>
          <p>{result.recommendation}</p>
        </div>
        
        {result.additionalData && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.additionalData).map(([key, value]) => (
                <div key={key}>
                  <h4 className="text-sm font-medium capitalize">{key}</h4>
                  {Array.isArray(value) ? (
                    <ul className="list-disc pl-5 text-sm">
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Decision Path</h3>
          <div className="space-y-2">
            {pathHistory.map((step, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{index + 1}. {step.stepTitle}</span>
                <ul className="list-disc pl-5 mt-1">
                  {Object.entries(step.inputs).map(([key, value]) => {
                    const label = step.parameterLabels[key] || key;
                    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
                    return (
                      <li key={key}>
                        {label}: <span className="font-medium">{displayValue}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCopyText}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Clinical Text
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </CardFooter>
    </Card>
  );
}