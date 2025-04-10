import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatDocumentation } from "@/components/admin/FormatDocumentation";

function Documentation() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Documentation</h1>
            
            <Tabs defaultValue="formats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formats">File Formats</TabsTrigger>
                <TabsTrigger value="calculators">Calculator Structure</TabsTrigger>
                <TabsTrigger value="api">API Reference</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formats" className="mt-6">
                <FormatDocumentation />
              </TabsContent>
              
              <TabsContent value="calculators" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Calculator Structure</CardTitle>
                    <CardDescription>
                      Understanding the structure and components of clinical calculators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Calculator Components</h3>
                      <p className="mb-4">Each calculator consists of the following components:</p>
                      
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Basic Information</strong>: ID, name, description, and category
                        </li>
                        <li>
                          <strong>Parameters</strong>: Input fields that collect data for calculation
                        </li>
                        <li>
                          <strong>Screening Questions</strong>: Pre-screening to determine calculator applicability
                        </li>
                        <li>
                          <strong>Calculation Logic</strong>: Function that processes inputs to produce a score
                        </li>
                        <li>
                          <strong>Interpretations</strong>: Ranges of scores and their clinical meanings
                        </li>
                        <li>
                          <strong>References</strong>: Medical literature supporting the calculator
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Parameter Types</h3>
                      <p className="mb-4">Parameters can be of the following types:</p>
                      
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <strong>Number</strong>: Numeric input (e.g., age, weight, lab values)
                        </li>
                        <li>
                          <strong>Boolean</strong>: Yes/No input (e.g., presence of a condition)
                        </li>
                        <li>
                          <strong>Select</strong>: Choice from predefined options (e.g., gender, severity levels)
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Storable Parameters</h3>
                      <p className="mb-4">
                        Parameters marked as "storable" can be saved to the parameter store and reused across
                        different calculators. This is useful for common parameters like age, gender, and lab values.
                      </p>
                      
                      <p>
                        When a parameter is stored, it appears in the sidebar and can be automatically filled
                        in other calculators that use the same parameter ID.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Screening Questions</h3>
                      <p className="mb-4">
                        Screening questions help determine if a calculator is appropriate for a specific patient.
                        Questions can be configured to "eliminate" a calculator from consideration if answered
                        negatively.
                      </p>
                      
                      <p>
                        For example, a calculator specific to pregnant patients might have a screening question
                        "Is the patient pregnant?" with the "eliminates" flag set to true.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Result Interpretation</h3>
                      <p className="mb-4">
                        Each calculator defines ranges of scores and their interpretations. These are used to
                        provide clinical context to the calculated score.
                      </p>
                      
                      <p>
                        Interpretations can have severity levels (low, moderate, high, very-high) which affect
                        how they are displayed in the results.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Reference</CardTitle>
                    <CardDescription>
                      Technical reference for programmatic integration with the Clinical Calculator
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Calculator Definition API</h3>
                      <p className="mb-4">
                        The calculator definition API allows you to programmatically create, retrieve, update,
                        and delete calculator definitions.
                      </p>
                      
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`// TypeScript interface for calculator definitions
interface CalculatorDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ParameterDefinition[];
  screeningQuestions: ScreeningQuestion[];
  calculate: (params: Record<string, any>) => CalculationResult;
  interpretations: {
    ranges: { min: number; max: number; interpretation: string; severity?: string }[];
    notes?: string;
  };
  references: string[];
}`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Parameter Store API</h3>
                      <p className="mb-4">
                        The parameter store API allows you to manage stored parameters programmatically.
                      </p>
                      
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`// Parameter store methods
interface ParameterStore {
  parameters: StoredParameter[];
  addParameter: (parameter: Omit<StoredParameter, 'timestamp'>) => void;
  removeParameter: (id: string) => void;
  clearParameters: () => void;
  getParameterValue: (id: string) => any | undefined;
}`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Calculation API</h3>
                      <p className="mb-4">
                        The calculation API allows you to perform calculations programmatically.
                      </p>
                      
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`// Example calculation
import { getCalculatorById } from '@/lib/calculator-definitions';

const calculator = getCalculatorById('has-bled');
if (calculator) {
  const inputs = {
    hypertension: true,
    renalDisease: false,
    // ... other parameters
  };
  
  const result = calculator.calculate(inputs);
  console.log(result);
  // { score: 1, interpretation: "Low risk of major bleeding", severity: "low" }
}`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Result Formatting API</h3>
                      <p className="mb-4">
                        The result formatting API allows you to format calculation results in different ways.
                      </p>
                      
                      <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
{`// Result formatting functions
import { formatClinicalText, formatPrinterFriendly } from '@/lib/result-formatter';

const clinicalText = formatClinicalText({
  calculatorName: 'HAS-BLED Score',
  result: { score: 2, interpretation: "Intermediate risk" },
  inputs: { hypertension: true, age: 70 },
  parameterLabels: { hypertension: "Hypertension", age: "Age" }
});

const printerFriendlyText = formatPrinterFriendly({
  calculatorName: 'HAS-BLED Score',
  result: { score: 2, interpretation: "Intermediate risk" },
  inputs: { hypertension: true, age: 70 },
  parameterLabels: { hypertension: "Hypertension", age: "Age" }
});`}
                      </pre>
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

export default function DocumentationPage() {
  return <ProtectedRoute Component={Documentation} />;
}