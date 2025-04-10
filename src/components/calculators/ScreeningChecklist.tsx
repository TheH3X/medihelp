import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { ScreeningQuestion } from "@/lib/calculator-definitions";

interface ScreeningChecklistProps {
  questions: ScreeningQuestion[];
  onComplete: (isEligible: boolean) => void;
}

export function ScreeningChecklist({ questions, onComplete }: ScreeningChecklistProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  
  // Check if all questions have been answered
  const allAnswered = questions.every(q => answers[q.id] !== undefined);
  
  // Check if any eliminating conditions are met
  const eliminatingQuestions = questions.filter(q => {
    if (q.eliminates) {
      return answers[q.id] === false;
    }
    return false;
  });
  
  const isEligible = allAnswered && eliminatingQuestions.length === 0;
  
  // Update parent component when eligibility changes
  useEffect(() => {
    if (allAnswered) {
      onComplete(isEligible);
    }
  }, [allAnswered, isEligible, onComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Screening Checklist</CardTitle>
        <CardDescription>
          Please answer the following questions to determine if this calculator is appropriate for your patient.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={question.id}
                checked={answers[question.id] || false}
                onCheckedChange={(checked) => {
                  setAnswers({
                    ...answers,
                    [question.id]: checked === true,
                  });
                }}
              />
              <Label htmlFor={question.id} className="font-normal">
                {question.question}
              </Label>
            </div>
            
            {question.eliminates && 
             answers[question.id] === false && 
             question.eliminationMessage && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  {question.eliminationMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ))}
        
        {allAnswered && !isEligible && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Calculator may not be appropriate</AlertTitle>
            <AlertDescription>
              Based on your answers, this calculator may not be appropriate for your patient.
              You can still proceed, but interpret results with caution.
            </AlertDescription>
          </Alert>
        )}
        
        {allAnswered && isEligible && (
          <Alert>
            <AlertTitle>Ready to proceed</AlertTitle>
            <AlertDescription>
              Based on your answers, this calculator is appropriate for your patient.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}