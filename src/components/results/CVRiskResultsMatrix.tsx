import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalculationResult } from "@/lib/calculator-definitions";

interface CVRiskResultsMatrixProps {
  result: CalculationResult;
  inputs: Record<string, any>;
}

export function CVRiskResultsMatrix({ result, inputs }: CVRiskResultsMatrixProps) {
  const [activeTab, setActiveTab] = useState("matrix");
  
  // Extract additional data from the result
  const additionalData = result.additionalData || {};
  const riskCategory = additionalData.riskCategory || "";
  const ldlTarget = additionalData.ldlTarget || "";
  const currentLDL = additionalData.currentLDL || 0;
  const framinghamRisk = result.score;
  
  // Determine risk class for the matrix
  let riskClass = "";
  if (framinghamRisk < 3) {
    riskClass = "low";
  } else if (framinghamRisk < 15) {
    riskClass = "moderate";
  } else if (framinghamRisk < 30) {
    riskClass = "high";
  } else {
    riskClass = "very-high";
  }
  
  // Determine if this is primary or secondary prevention
  const isSecondaryPrevention = inputs.cad || inputs.cerebroVD || inputs.pad || inputs.ami;
  
  // Function to get cell color class based on risk and LDL level
  const getCellColorClass = (risk: string, ldl: number) => {
    // Green cells (lifestyle only)
    if (
      (risk === "low" && ldl < 4.9) ||
      (risk === "moderate" && ldl < 2.6) ||
      (risk === "high" && ldl < 1.8) ||
      (risk === "very-high" && ldl < 1.4)
    ) {
      return "bg-green-100 dark:bg-green-900";
    }
    
    // Yellow cells (lifestyle + consider statin)
    if (
      (risk === "low" && ldl >= 4.9 && ldl < 5.0) ||
      (risk === "moderate" && ldl >= 2.6 && ldl < 3.0) ||
      (risk === "high" && ldl >= 1.8 && ldl < 2.6)
    ) {
      return "bg-yellow-100 dark:bg-yellow-900";
    }
    
    // Orange cells (lifestyle + statin)
    if (
      (risk === "low" && ldl >= 5.0) ||
      (risk === "moderate" && ldl >= 3.0 && ldl < 4.9) ||
      (risk === "high" && ldl >= 2.6) ||
      (risk === "very-high" && ldl >= 1.4)
    ) {
      return "bg-orange-100 dark:bg-orange-900";
    }
    
    // Red cells (lifestyle + statin + consider additional therapy)
    if (
      (risk === "moderate" && ldl >= 4.9) ||
      (risk === "high" && ldl >= 4.9) ||
      (risk === "very-high" && ldl >= 4.9)
    ) {
      return "bg-red-100 dark:bg-red-900";
    }
    
    // Default
    return "bg-gray-100 dark:bg-gray-800";
  };
  
  // Function to get cell text based on risk and LDL level
  const getCellText = (risk: string, ldl: number) => {
    // Green cells (lifestyle only)
    if (
      (risk === "low" && ldl < 3.0) ||
      (risk === "moderate" && ldl < 2.6) ||
      (risk === "high" && ldl < 1.8) ||
      (risk === "very-high" && ldl < 1.4)
    ) {
      return "Lifestyle";
    }
    
    // Yellow cells (lifestyle + consider statin)
    if (
      (risk === "low" && ldl >= 3.0 && ldl < 4.9) ||
      (risk === "moderate" && ldl >= 2.6 && ldl < 3.0)
    ) {
      return "Lifestyle ± statin";
    }
    
    // Orange cells (lifestyle + statin)
    if (
      (risk === "low" && ldl >= 4.9) ||
      (risk === "moderate" && ldl >= 3.0) ||
      (risk === "high" && ldl >= 1.8) ||
      (risk === "very-high" && ldl >= 1.4)
    ) {
      return "Lifestyle + statin";
    }
    
    // Default
    return "";
  };
  
  // Function to highlight the current cell
  const isCurrentCell = (risk: string, ldlMin: number, ldlMax: number) => {
    return risk === riskClass && currentLDL >= ldlMin && (ldlMax === -1 || currentLDL < ldlMax);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          CV Risk Treatment Matrix
          <Badge 
            variant="outline" 
            className={
              riskClass === "low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
              riskClass === "moderate" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" :
              riskClass === "high" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" :
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }
          >
            {riskCategory}
          </Badge>
        </CardTitle>
        <CardDescription>
          Treatment recommendations based on risk category and LDL level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="matrix" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matrix">Treatment Matrix</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matrix" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted text-left" rowSpan={2}>FH risk</th>
                    <th className="border p-2 bg-muted text-left" rowSpan={2}>Risk class</th>
                    <th className="border p-2 bg-muted text-center" colSpan={7}>Untreated LDL-C levels (mmol/L)</th>
                  </tr>
                  <tr>
                    <th className="border p-2 bg-muted text-center">0</th>
                    <th className="border p-2 bg-muted text-center">1.4</th>
                    <th className="border p-2 bg-muted text-center">1.8</th>
                    <th className="border p-2 bg-muted text-center">2.6</th>
                    <th className="border p-2 bg-muted text-center">3</th>
                    <th className="border p-2 bg-muted text-center">4.9</th>
                    <th className="border p-2 bg-muted text-center">5</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Primary Prevention - Low Risk */}
                  <tr>
                    <td className="border p-2" rowSpan={4}>Primary prevention</td>
                    <td className={`border p-2 ${riskClass === "low" ? "font-bold" : ""}`}>0%<br/>low</td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 0)} ${isCurrentCell("low", 0, 1.4) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 1.4)} ${isCurrentCell("low", 1.4, 1.8) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 1.8)} ${isCurrentCell("low", 1.8, 2.6) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 2.6)} ${isCurrentCell("low", 2.6, 3) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 3)} ${isCurrentCell("low", 3, 4.9) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle ± statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 4.9)} ${isCurrentCell("low", 4.9, 5) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("low", 5)} ${isCurrentCell("low", 5, -1) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle advice
                    </td>
                  </tr>
                  
                  {/* Primary Prevention - Moderate Risk */}
                  <tr>
                    <td className={`border p-2 ${riskClass === "moderate" ? "font-bold" : ""}`}>3%<br/>moderate</td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 0)} ${isCurrentCell("moderate", 0, 1.4) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 1.4)} ${isCurrentCell("moderate", 1.4, 1.8) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 1.8)} ${isCurrentCell("moderate", 1.8, 2.6) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 2.6)} ${isCurrentCell("moderate", 2.6, 3) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle ± statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 3)} ${isCurrentCell("moderate", 3, 4.9) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 4.9)} ${isCurrentCell("moderate", 4.9, 5) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle ± statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("moderate", 5)} ${isCurrentCell("moderate", 5, -1) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle intervention, consider drug if uncontrolled
                    </td>
                  </tr>
                  
                  {/* Primary Prevention - High Risk */}
                  <tr>
                    <td className={`border p-2 ${riskClass === "high" ? "font-bold" : ""}`}>15%<br/>high</td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 0)} ${isCurrentCell("high", 0, 1.4) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 1.4)} ${isCurrentCell("high", 1.4, 1.8) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 1.8)} ${isCurrentCell("high", 1.8, 2.6) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 2.6)} ${isCurrentCell("high", 2.6, 3) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 3)} ${isCurrentCell("high", 3, 4.9) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 4.9)} ${isCurrentCell("high", 4.9, 5) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("high", 5)} ${isCurrentCell("high", 5, -1) ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle intervention AND drug intervention
                    </td>
                  </tr>
                  
                  {/* Primary Prevention - Very High Risk */}
                  <tr>
                    <td className={`border p-2 ${riskClass === "very-high" && !isSecondaryPrevention ? "font-bold" : ""}`}>30%<br/>very high</td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 0)} ${isCurrentCell("very-high", 0, 1.4) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 1.4)} ${isCurrentCell("very-high", 1.4, 1.8) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 1.8)} ${isCurrentCell("very-high", 1.8, 2.6) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 2.6)} ${isCurrentCell("very-high", 2.6, 3) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 3)} ${isCurrentCell("very-high", 3, 4.9) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 4.9)} ${isCurrentCell("very-high", 4.9, 5) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 5)} ${isCurrentCell("very-high", 5, -1) && !isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle intervention AND drug intervention
                    </td>
                  </tr>
                  
                  {/* Secondary Prevention */}
                  <tr>
                    <td className="border p-2">Secondary prevention</td>
                    <td className={`border p-2 ${riskClass === "very-high" && isSecondaryPrevention ? "font-bold" : ""}`}>30%<br/>very high</td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 0)} ${isCurrentCell("very-high", 0, 1.4) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 1.4)} ${isCurrentCell("very-high", 1.4, 1.8) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 1.8)} ${isCurrentCell("very-high", 1.8, 2.6) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 2.6)} ${isCurrentCell("very-high", 2.6, 3) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 3)} ${isCurrentCell("very-high", 3, 4.9) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 4.9)} ${isCurrentCell("very-high", 4.9, 5) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle + statin
                    </td>
                    <td className={`border p-2 text-center ${getCellColorClass("very-high", 5)} ${isCurrentCell("very-high", 5, -1) && isSecondaryPrevention ? "ring-2 ring-primary" : ""}`}>
                      Lifestyle intervention AND drug intervention
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium">Your patient:</p>
              <ul className="text-sm mt-1 space-y-1">
                <li><span className="font-medium">Risk Category:</span> {riskCategory} ({framinghamRisk.toFixed(1)}% 10-year risk)</li>
                <li><span className="font-medium">Current LDL:</span> {currentLDL.toFixed(1)} mmol/L</li>
                <li><span className="font-medium">LDL Target:</span> {ldlTarget}</li>
                <li><span className="font-medium">Recommendation:</span> {additionalData.treatmentRecommendation}</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="explanation" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Risk Categories</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li><span className="font-medium">Low Risk:</span> &lt;3% 10-year risk</li>
                  <li><span className="font-medium">Moderate Risk:</span> 3-15% 10-year risk</li>
                  <li><span className="font-medium">High Risk:</span> 15-30% 10-year risk</li>
                  <li><span className="font-medium">Very High Risk:</span> ≥30% 10-year risk or established cardiovascular disease</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">LDL Targets</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li><span className="font-medium">Low Risk:</span> &lt;3.0 mmol/L</li>
                  <li><span className="font-medium">Moderate Risk:</span> &lt;2.6 mmol/L</li>
                  <li><span className="font-medium">High Risk:</span> &lt;1.8 mmol/L or ≥50% reduction</li>
                  <li><span className="font-medium">Very High Risk:</span> &lt;1.4 mmol/L or ≥50% reduction</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Treatment Color Codes</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li className="flex items-center"><span className="w-4 h-4 bg-green-100 dark:bg-green-900 mr-2 inline-block"></span> <span className="font-medium">Green:</span> Lifestyle intervention only</li>
                  <li className="flex items-center"><span className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 mr-2 inline-block"></span> <span className="font-medium">Yellow:</span> Lifestyle intervention with optional statin therapy</li>
                  <li className="flex items-center"><span className="w-4 h-4 bg-orange-100 dark:bg-orange-900 mr-2 inline-block"></span> <span className="font-medium">Orange:</span> Lifestyle intervention with statin therapy</li>
                  <li className="flex items-center"><span className="w-4 h-4 bg-red-100 dark:bg-red-900 mr-2 inline-block"></span> <span className="font-medium">Red:</span> Intensive intervention (lifestyle + drug therapy)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Notes</h4>
                <ul className="text-sm mt-1 space-y-1">
                  <li>Secondary prevention refers to patients with established cardiovascular disease.</li>
                  <li>For high and very high risk patients, consider additional lipid-lowering therapy if LDL target is not achieved with maximum tolerated statin dose.</li>
                  <li>Lifestyle intervention includes dietary changes, exercise, smoking cessation, and weight management.</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}