import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useParameterStore } from "@/lib/parameter-store";
import { InfoIcon } from "lucide-react";
import type { ParameterDefinition } from "@/lib/calculator-definitions";

interface InputFieldProps {
  parameter: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function InputField({ parameter, value, onChange }: InputFieldProps) {
  const { addParameter } = useParameterStore();
  
  const handleSaveParameter = () => {
    if (parameter.storable) {
      addParameter({
        id: parameter.id,
        name: parameter.name,
        value: value,
        unit: parameter.unit,
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveParameter}
            className="h-6 px-2"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
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