import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label htmlFor={parameter.id}>{parameter.name}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
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
            className="h-7 px-2"
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
          className="w-full"
        />
      )}

      {parameter.type === 'boolean' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={parameter.id}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={parameter.id} className="font-normal text-sm">
            Yes
          </Label>
        </div>
      )}

      {parameter.type === 'select' && parameter.options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
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