import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useParameterStore, type StoredParameter } from "@/lib/parameter-store";

function ParameterDictionary() {
  const { toast } = useToast();
  const { parameters, addParameter, removeParameter } = useParameterStore();
  const [isAddingParameter, setIsAddingParameter] = useState(false);
  const [newParameter, setNewParameter] = useState<Omit<StoredParameter, "timestamp">>({
    id: "",
    name: "",
    value: "",
    unit: "",
  });
  const [parameterType, setParameterType] = useState<"number" | "text" | "boolean">("number");

  const handleAddParameter = () => {
    // Validate
    if (!newParameter.id || !newParameter.name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Format value based on type
    let formattedValue = newParameter.value;
    if (parameterType === "number") {
      formattedValue = Number(newParameter.value);
    } else if (parameterType === "boolean") {
      formattedValue = newParameter.value === "true";
    }
    
    // Add parameter
    addParameter({
      ...newParameter,
      value: formattedValue,
    });
    
    // Reset form
    setNewParameter({
      id: "",
      name: "",
      value: "",
      unit: "",
    });
    setParameterType("number");
    
    setIsAddingParameter(false);
    
    toast({
      title: "Parameter added",
      description: "The parameter has been added to the dictionary",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Parameter Dictionary</h1>
              <Dialog open={isAddingParameter} onOpenChange={setIsAddingParameter}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Parameter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Parameter</DialogTitle>
                    <DialogDescription>
                      Add a new parameter to the dictionary for use across calculators.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="param-id" className="text-right">
                        ID
                      </Label>
                      <Input
                        id="param-id"
                        value={newParameter.id}
                        onChange={(e) => setNewParameter({...newParameter, id: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., age"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="param-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="param-name"
                        value={newParameter.name}
                        onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., Age"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="param-type" className="text-right">
                        Type
                      </Label>
                      <Select 
                        value={parameterType}
                        onValueChange={(value: "number" | "text" | "boolean") => setParameterType(value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="param-value" className="text-right">
                        Default Value
                      </Label>
                      {parameterType === "boolean" ? (
                        <Select 
                          value={newParameter.value.toString()}
                          onValueChange={(value) => setNewParameter({...newParameter, value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="param-value"
                          type={parameterType === "number" ? "number" : "text"}
                          value={newParameter.value}
                          onChange={(e) => setNewParameter({...newParameter, value: e.target.value})}
                          className="col-span-3"
                          placeholder="Default value"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="param-unit" className="text-right">
                        Unit
                      </Label>
                      <Input
                        id="param-unit"
                        value={newParameter.unit || ""}
                        onChange={(e) => setNewParameter({...newParameter, unit: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., years"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingParameter(false)}>Cancel</Button>
                    <Button onClick={handleAddParameter}>Add Parameter</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Global Parameters</CardTitle>
                <CardDescription>
                  These parameters can be used across multiple calculators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parameters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No parameters defined yet. Click "Add Parameter" to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 font-medium text-sm border-b pb-2">
                      <div>ID</div>
                      <div>Name</div>
                      <div>Value</div>
                      <div>Unit</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {parameters.map((param) => (
                      <div key={param.id} className="grid grid-cols-5 items-center py-2 border-b border-muted last:border-0">
                        <div className="text-sm font-mono">{param.id}</div>
                        <div>{param.name}</div>
                        <div>
                          {typeof param.value === 'boolean'
                            ? param.value ? 'Yes' : 'No'
                            : param.value}
                        </div>
                        <div>{param.unit || "-"}</div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeParameter(param.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Parameters stored here can be mapped to calculator inputs in the calculator editor.
                </p>
              </CardFooter>
            </Card>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parameter Mapping</CardTitle>
                  <CardDescription>
                    Define relationships between similar parameters across calculators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Parameter mapping functionality would allow you to define relationships between
                    similar parameters across different calculators, ensuring consistent data usage.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mapping
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ParameterDictionaryPage() {
  return <ProtectedRoute Component={ParameterDictionary} />;
}