import { useParameterStore } from "@/lib/parameter-store";
import { ParameterItem } from "./ParameterItem";
import { Button } from "@/components/ui/button";
import { Trash2, HelpCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function StoredParametersList() {
  const { parameters, clearParameters } = useParameterStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-medium">Stored Parameters</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Parameters saved here will be available across all calculators. Click the "Save for reuse" button next to input fields to store values.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {parameters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearParameters}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      {parameters.length === 0 ? (
        <Alert className="bg-muted/50 border-dashed">
          <AlertDescription className="text-center py-4">
            <p className="text-muted-foreground mb-2">No parameters stored yet.</p>
            <p className="text-sm">Click "Save for reuse" next to input fields to store values that can be used across multiple calculators.</p>
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {parameters.map((param) => (
              <ParameterItem key={param.id} parameter={param} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}