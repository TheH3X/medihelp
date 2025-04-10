import { useParameterStore } from "@/lib/parameter-store";
import { ParameterItem } from "./ParameterItem";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function StoredParametersList() {
  const { parameters, clearParameters } = useParameterStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Stored Parameters</h3>
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
        <div className="text-muted-foreground text-sm p-4 text-center">
          No parameters stored yet. Parameters will appear here when you save them from calculators.
        </div>
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