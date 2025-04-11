import { useParameterStore, type StoredParameter } from "@/lib/parameter-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ParameterItemProps {
  parameter: StoredParameter;
}

export function ParameterItem({ parameter }: ParameterItemProps) {
  const { removeParameter } = useParameterStore();
  
  const formattedValue = typeof parameter.value === 'boolean'
    ? parameter.value ? 'Yes' : 'No'
    : parameter.value;
    
  const displayValue = parameter.unit 
    ? `${formattedValue} ${parameter.unit}`
    : formattedValue;

  return (
    <Card className="relative">
      <CardContent className="p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-0 right-0 h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => removeParameter(parameter.id)}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove parameter</span>
        </Button>
        
        <div className="pr-6">
          <div className="font-medium text-sm">{parameter.name}</div>
          <div className="text-sm">{displayValue}</div>
        </div>
      </CardContent>
    </Card>
  );
}