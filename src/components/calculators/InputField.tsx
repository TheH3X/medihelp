import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Save, Check, InfoIcon } from "lucide-react";
import { useParameterStore } from "@/lib/parameter-store";
import { useToast } from "@/hooks/use-toast";
import type { ParameterDefinition } from "@/lib/calculator-definitions";

interface InputFieldProps {
  parameter: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function InputField({ parameter, value, onChange }: InputFieldProps) {
  const { addParameter } = useParameterStore();
  const { toast } = useToast();
  const [justSaved, setJustSaved] = useState(false);
  
  const handleSaveParameter = () => {
    if (parameter.storable && value !== undefined && value !== null && value !== '') {
      addParameter({
        id: parameter.id,
        name: parameter.name,
        value: value,
        unit: parameter.unit,
      });
      
      // Show success animation
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      
      // Show toast notification
      toast({
        title: "Parameter saved",
        description: `${parameter.name} has been saved for reuse in other calculators.`,
      });
    } else if (value === undefined || value === null || value === '') {
      toast({
        title: "Cannot save empty value",
        description: "Please enter a value before saving.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label htmlFor={parameter.id} className="text-sm">{parameter.name}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{parameter.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {parameter.storable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={justSaved ? "default" : "outline"} 
                  size="sm" 
                  onClick={handleSaveParameter}
                  className={`h-7 px-2 transition-all duration-300 ${justSaved ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  {justSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save for reuse
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save this value to reuse in other calculators</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {parameter.type === 'number' && (
        <Input
          id={parameter.id}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full h-8"
        />
      )}

      {parameter.type === 'boolean' && (
        <RadioGroup
          value={value === true ? "true" : value === false ? "false" : undefined}
          onValueChange={(val) => onChange(val === "true")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="true" id={`${parameter.id}-yes`} />
            <Label htmlFor={`${parameter.id}-yes`} className="font-normal text-xs">Yes</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="false" id={`${parameter.id}-no`} />
            <Label htmlFor={`${parameter.id}-no`} className="font-normal text-xs">No</Label>
          </div>
        </RadioGroup>
      )}

      {parameter.type === 'select' && parameter.options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {parameter.options.map((option) => (
              <SelectItem key={option.value.toString()} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {parameter.unit && (
        <span className="text-xs text-muted-foreground">
          Unit: {parameter.unit}
        </span>
      )}
    </div>
  );
}