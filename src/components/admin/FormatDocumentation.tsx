import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson, FileSpreadsheet, FileText } from "lucide-react";

export function FormatDocumentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Format Documentation</CardTitle>
        <CardDescription>
          Detailed information about supported file formats for importing and exporting calculator definitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="json">
            <AccordionTrigger>
              <div className="flex items-center">
                <FileJson className="mr-2 h-4 w-4" />
                JSON Format
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  The JSON format supports complete calculator definitions including parameters, 
                  screening questions, interpretations, and references.
                </p>
                
                <h4 className="font-medium">Required Structure:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`{
  "id": "calculator-id",
  "name": "Calculator Name",
  "description": "Description of the calculator",
  "category": "Category",
  "parameters": [
    {
      "id": "parameter-id",
      "name": "Parameter Name",
      "type": "number", // or "boolean" or "select"
      "unit": "Optional unit",
      "tooltip": "Explanation of the parameter",
      "storable": true,
      "options": [ // Only for type "select"
        { "value": "option1", "label": "Option 1" },
        { "value": "option2", "label": "Option 2" }
      ]
    }
  ],
  "screeningQuestions": [
    {
      "id": "question-id",
      "question": "Question text",
      "type": "boolean",
      "eliminates": true,
      "eliminationMessage": "Message shown when eliminated"
    }
  ],
  "interpretations": {
    "ranges": [
      {
        "min": 0,
        "max": 1,
        "interpretation": "Interpretation text",
        "severity": "low" // or "moderate", "high", "very-high"
      }
    ],
    "notes": "Additional notes about interpretation"
  },
  "references": [
    "Reference 1",
    "Reference 2"
  ]
}`}
                </pre>
                
                <p className="text-sm text-muted-foreground">
                  Note: The calculation function must be implemented in code and cannot be imported via JSON.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="csv">
            <AccordionTrigger>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                CSV Format
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  The CSV format only supports parameter definitions. The first row must be a header
                  with the following columns.
                </p>
                
                <h4 className="font-medium">Required Columns:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>id</strong> - Unique identifier for the parameter</li>
                  <li><strong>name</strong> - Display name for the parameter</li>
                  <li><strong>type</strong> - Parameter type (number, boolean, select)</li>
                  <li><strong>unit</strong> - Optional unit for the parameter</li>
                  <li><strong>tooltip</strong> - Explanation of the parameter</li>
                  <li><strong>storable</strong> - Whether the parameter can be stored (true/false)</li>
                </ul>
                
                <h4 className="font-medium">Example:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`id,name,type,unit,tooltip,storable
age,Age,number,years,Patient's age in years,true
gender,Gender,select,,Patient's gender,true
diabetic,Diabetes,boolean,,Patient has diabetes,false`}
                </pre>
                
                <p className="text-sm text-muted-foreground">
                  Note: For select type parameters, options must be defined separately in the calculator editor.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="excel">
            <AccordionTrigger>
              <div className="flex items-center">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel Format
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>
                  For Excel files, you'll need to export to JSON format first. You can use the Excel
                  template option to generate a template that you can fill in Excel and then convert
                  to JSON.
                </p>
                
                <h4 className="font-medium">Workflow:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Export an Excel template from the Export tab</li>
                  <li>Open the template in Excel or another spreadsheet application</li>
                  <li>Fill in the calculator definition</li>
                  <li>Export to JSON format (using a tool or script)</li>
                  <li>Import the resulting JSON file</li>
                </ol>
                
                <h4 className="font-medium">Recommended Structure:</h4>
                <p>Create separate sheets for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Calculator</strong> - Basic calculator information</li>
                  <li><strong>Parameters</strong> - Parameter definitions</li>
                  <li><strong>Screening</strong> - Screening questions</li>
                  <li><strong>Interpretations</strong> - Score interpretations</li>
                  <li><strong>References</strong> - Medical references</li>
                </ul>
                
                <p className="text-sm text-muted-foreground">
                  Note: Excel files must be converted to JSON before importing. You can use tools like
                  XLSX.js, Excel's Power Query, or other conversion tools.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="advanced">
            <AccordionTrigger>Advanced Usage</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <h4 className="font-medium">Bulk Import/Export:</h4>
                <p>
                  For bulk operations, you can create a JSON array of calculator definitions:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`[
  { /* Calculator 1 definition */ },
  { /* Calculator 2 definition */ },
  { /* Calculator 3 definition */ }
]`}
                </pre>
                
                <h4 className="font-medium">Parameter Mapping:</h4>
                <p>
                  When importing calculators, you can map parameters to existing stored parameters
                  by using the same parameter IDs. This ensures consistency across calculators.
                </p>
                
                <h4 className="font-medium">Custom Calculation Logic:</h4>
                <p>
                  After importing a calculator definition, you'll need to implement the calculation
                  logic in code. The calculation function should follow this signature:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`function calculate(params: Record<string, any>): {
  score: number;
  interpretation: string;
  severity?: 'low' | 'moderate' | 'high' | 'very-high';
}`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}