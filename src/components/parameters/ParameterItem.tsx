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
    
  // Format the timestamp as a relative time (e.g., "2 minutes ago")
  const timeAgo = new Date(parameter.timestamp).toLocaleTimeString();

  return (
    <Card className="relative">
      <CardContent className="p-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => removeParameter(parameter.id)}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove parameter</span>
        </Button>
        
        <div className="pr-6">
          <div className="font-medium text-sm">{parameter.name}</div>
          <div className="text-base">{displayValue}</div>
          <div className="text-xs text-muted-foreground mt-1">{timeAgo}</div>
        </div>
      </CardContent>
    </Card>
  );
}