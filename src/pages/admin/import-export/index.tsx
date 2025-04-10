import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileJson, 
  FileSpreadsheet, 
  FileUp, 
  FileDown, 
  AlertCircle, 
  Check, 
  Copy
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { calculators, type CalculatorDefinition } from "@/lib/calculator-definitions";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function ImportExport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("import");
  const [importFormat, setImportFormat] = useState("json");
  const [exportFormat, setExportFormat] = useState("json");
  const [importData, setImportData] = useState("");
  const [exportData, setExportData] = useState("");
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportData(event.target.result as string);
        }
      };
      
      if (importFormat === "json" || importFormat === "csv") {
        reader.readAsText(file);
      } else if (importFormat === "excel-json") {
        reader.readAsText(file); // Excel files need to be pre-converted to JSON
      }
    }
  };
  
  // Validate imported data
  const validateImportData = () => {
    try {
      if (importFormat === "json") {
        const parsed = JSON.parse(importData);
        
        // Basic validation
        if (!parsed.id || !parsed.name || !parsed.parameters || !Array.isArray(parsed.parameters)) {
          setValidationResult({
            valid: false,
            message: "Invalid calculator format",
            details: ["Calculator must have id, name, and parameters array"]
          });
          return;
        }
        
        // More detailed validation
        const requiredFields = ["id", "name", "description", "category", "parameters", "screeningQuestions", "interpretations", "references"];
        const missingFields = requiredFields.filter(field => !parsed[field]);
        
        if (missingFields.length > 0) {
          setValidationResult({
            valid: false,
            message: "Missing required fields",
            details: missingFields.map(field => `Missing: ${field}`)
          });
          return;
        }
        
        // Check for parameters structure
        const paramErrors = [];
        for (const param of parsed.parameters) {
          if (!param.id || !param.name || !param.type) {
            paramErrors.push(`Parameter missing required fields: ${JSON.stringify(param)}`);
          }
        }
        
        if (paramErrors.length > 0) {
          setValidationResult({
            valid: false,
            message: "Invalid parameters",
            details: paramErrors
          });
          return;
        }
        
        // If we got here, it's valid
        setValidationResult({
          valid: true,
          message: "Calculator definition is valid",
        });
      } else if (importFormat === "csv") {
        // Basic CSV validation
        const lines = importData.trim().split('\\n');
        if (lines.length < 2) {
          setValidationResult({
            valid: false,
            message: "CSV must have at least a header row and one data row",
          });
          return;
        }
        
        const headers = lines[0].split(',');
        if (!headers.includes('id') || !headers.includes('name') || !headers.includes('type')) {
          setValidationResult({
            valid: false,
            message: "CSV must have at least id, name, and type columns",
          });
          return;
        }
        
        setValidationResult({
          valid: true,
          message: "CSV format appears valid. Note that CSV import is limited to parameter definitions only.",
        });
      } else if (importFormat === "excel-json") {
        // For Excel-JSON, we expect a pre-converted JSON format
        try {
          const parsed = JSON.parse(importData);
          setValidationResult({
            valid: true,
            message: "Excel-JSON format appears valid",
          });
        } catch (e) {
          setValidationResult({
            valid: false,
            message: "Invalid JSON format from Excel",
            details: [(e as Error).message]
          });
        }
      }
    } catch (e) {
      setValidationResult({
        valid: false,
        message: "Validation error",
        details: [(e as Error).message]
      });
    }
  };
  
  // Import the data
  const handleImport = () => {
    if (!validationResult?.valid) {
      toast({
        title: "Cannot import",
        description: "Please validate the data first and fix any errors",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would save to the database
    toast({
      title: "Import successful",
      description: "The calculator definition has been imported",
    });
  };
  
  // Generate export data
  const handleExport = () => {
    if (!selectedCalculator) {
      toast({
        title: "No calculator selected",
        description: "Please select a calculator to export",
        variant: "destructive",
      });
      return;
    }
    
    const calculator = calculators.find(c => c.id === selectedCalculator);
    if (!calculator) {
      toast({
        title: "Calculator not found",
        description: "The selected calculator could not be found",
        variant: "destructive",
      });
      return;
    }
    
    if (exportFormat === "json") {
      // Create a clean version of the calculator without functions
      const cleanCalculator = {
        ...calculator,
        // Remove the calculate function which can't be serialized
        calculate: undefined
      };
      
      setExportData(JSON.stringify(cleanCalculator, null, 2));
    } else if (exportFormat === "csv") {
      // For CSV, we'll just export the parameters
      const headers = ["id", "name", "type", "unit", "tooltip", "storable"];
      const rows = calculator.parameters.map(param => {
        return [
          param.id,
          param.name,
          param.type,
          param.unit || "",
          param.tooltip,
          param.storable ? "true" : "false"
        ].map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',');
      });
      
      setExportData([headers.join(','), ...rows].join('\\n'));
    } else if (exportFormat === "excel-template") {
      // For Excel template, we provide a JSON structure that can be used to create an Excel template
      const template = {
        calculator: {
          id: "calculator-id",
          name: "Calculator Name",
          description: "Description of the calculator",
          category: "Category",
        },
        parameters: [
          {
            id: "parameter-id",
            name: "Parameter Name",
            type: "number/boolean/select",
            unit: "Optional unit",
            tooltip: "Explanation of the parameter",
            storable: true // Fixed: Using actual boolean value instead of true/false type
          }
        ],
        screeningQuestions: [
          {
            id: "question-id",
            question: "Question text",
            eliminates: true, // Fixed: Using actual boolean value
            eliminationMessage: "Message shown when eliminated"
          }
        ],
        interpretations: {
          ranges: [
            {
              min: 0,
              max: 1,
              interpretation: "Interpretation text",
              severity: "low/moderate/high"
            }
          ],
          notes: "Additional notes about interpretation"
        },
        references: [
          "Reference 1",
          "Reference 2"
        ]
      };
      
      setExportData(JSON.stringify(template, null, 2));
    }
  };
  
  // Copy export data to clipboard
  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportData);
    toast({
      title: "Copied to clipboard",
      description: "The export data has been copied to your clipboard",
    });
  };
  
  // Download export data as a file
  const handleDownloadExport = () => {
    if (!exportData) {
      toast({
        title: "No data to download",
        description: "Please generate export data first",
        variant: "destructive",
      });
      return;
    }
    
    const calculator = calculators.find(c => c.id === selectedCalculator);
    if (!calculator) return;
    
    let filename = `${calculator.id}`;
    let mimeType = "text/plain";
    let extension = "txt";
    
    if (exportFormat === "json") {
      mimeType = "application/json";
      extension = "json";
    } else if (exportFormat === "csv") {
      mimeType = "text/csv";
      extension = "csv";
    } else if (exportFormat === "excel-template") {
      mimeType = "application/json";
      extension = "json";
      filename = "calculator-template";
    }
    
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Import & Export</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="import">Import Calculator</TabsTrigger>
                <TabsTrigger value="export">Export Calculator</TabsTrigger>
              </TabsList>
              
              {/* Import Tab */}
              <TabsContent value="import" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Import Calculator Definition</CardTitle>
                    <CardDescription>
                      Import a calculator definition from a file or paste it directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="import-format" className="text-right">
                        Format
                      </Label>
                      <Select 
                        value={importFormat}
                        onValueChange={setImportFormat}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">
                            <div className="flex items-center">
                              <FileJson className="mr-2 h-4 w-4" />
                              JSON
                            </div>
                          </SelectItem>
                          <SelectItem value="csv">
                            <div className="flex items-center">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              CSV (Parameters only)
                            </div>
                          </SelectItem>
                          <SelectItem value="excel-json">
                            <div className="flex items-center">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Excel (converted to JSON)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="import-file" className="text-right">
                        File
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="import-file"
                          type="file"
                          accept={
                            importFormat === "json" ? ".json" : 
                            importFormat === "csv" ? ".csv" : 
                            ".json"
                          }
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="import-data" className="text-right mt-2">
                        Or paste data
                      </Label>
                      <Textarea
                        id="import-data"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        className="col-span-3 min-h-[200px] font-mono text-sm"
                        placeholder={
                          importFormat === "json" ? "Paste JSON data here..." : 
                          importFormat === "csv" ? "Paste CSV data here..." : 
                          "Paste data here..."
                        }
                      />
                    </div>
                    
                    {validationResult && (
                      <Alert variant={validationResult.valid ? "default" : "destructive"}>
                        {validationResult.valid ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                          {validationResult.valid ? "Validation Passed" : "Validation Failed"}
                        </AlertTitle>
                        <AlertDescription>
                          {validationResult.message}
                          {validationResult.details && validationResult.details.length > 0 && (
                            <ul className="list-disc pl-5 mt-2 text-sm">
                              {validationResult.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                              ))}
                            </ul>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={validateImportData}>
                      Validate
                    </Button>
                    <Button 
                      onClick={handleImport}
                      disabled={!validationResult?.valid}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Export Tab */}
              <TabsContent value="export" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Calculator Definition</CardTitle>
                    <CardDescription>
                      Export a calculator definition to a file or copy it to clipboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="export-calculator" className="text-right">
                        Calculator
                      </Label>
                      <Select 
                        value={selectedCalculator || ""}
                        onValueChange={setSelectedCalculator}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a calculator" />
                        </SelectTrigger>
                        <SelectContent>
                          {calculators.map((calculator) => (
                            <SelectItem key={calculator.id} value={calculator.id}>
                              {calculator.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="export-format" className="text-right">
                        Format
                      </Label>
                      <Select 
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">
                            <div className="flex items-center">
                              <FileJson className="mr-2 h-4 w-4" />
                              JSON
                            </div>
                          </SelectItem>
                          <SelectItem value="csv">
                            <div className="flex items-center">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              CSV (Parameters only)
                            </div>
                          </SelectItem>
                          <SelectItem value="excel-template">
                            <div className="flex items-center">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Excel Template (JSON)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleExport}
                        disabled={!selectedCalculator}
                      >
                        Generate Export
                      </Button>
                    </div>
                    
                    {exportData && (
                      <div className="space-y-2">
                        <Label htmlFor="export-data">Export Data</Label>
                        <Textarea
                          id="export-data"
                          value={exportData}
                          readOnly
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCopyExport}
                      disabled={!exportData}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      onClick={handleDownloadExport}
                      disabled={!exportData}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Import/Export Documentation</CardTitle>
                    <CardDescription>
                      Learn how to format your calculator definitions for import
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">JSON Format</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          The JSON format supports complete calculator definitions including parameters, 
                          screening questions, interpretations, and references.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">CSV Format</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          The CSV format only supports parameter definitions. The first row must be a header
                          with the following columns: id, name, type, unit, tooltip, storable.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Excel Format</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          For Excel files, you'll need to export to JSON format first. You can use the Excel
                          template option to generate a template that you can fill in Excel and then convert
                          to JSON.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ImportExportPage() {
  return <ProtectedRoute Component={ImportExport} />;
}