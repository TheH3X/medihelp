import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { algorithms } from "@/lib/algorithm-definitions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BarChart, GitBranch } from "lucide-react";

function AlgorithmsManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingAlgorithm, setIsCreatingAlgorithm] = useState(false);
  const [newAlgorithm, setNewAlgorithm] = useState({
    id: "",
    name: "",
    description: "",
    category: "Cardiology",
  });

  const handleCreateAlgorithm = () => {
    // Validate inputs
    if (!newAlgorithm.id || !newAlgorithm.name || !newAlgorithm.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if ID already exists
    if (algorithms.some(algo => algo.id === newAlgorithm.id)) {
      toast({
        title: "ID already exists",
        description: "Please choose a different algorithm ID",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would save to the database
    // For now, we'll just navigate to the editor
    toast({
      title: "Algorithm created",
      description: "Now you can configure the algorithm details",
    });
    
    navigate(`/admin/algorithms/${newAlgorithm.id}`);
    setIsCreatingAlgorithm(false);
  };

  const handleEditAlgorithm = (id: string) => {
    navigate(`/admin/algorithms/${id}`);
  };

  const handleDeleteAlgorithm = (id: string) => {
    // In a real implementation, this would delete from the database
    toast({
      title: "Not implemented",
      description: "Delete functionality would remove this algorithm",
    });
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/admin/analytics/algorithm/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Algorithm Management</h1>
              <Dialog open={isCreatingAlgorithm} onOpenChange={setIsCreatingAlgorithm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Algorithm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Algorithm</DialogTitle>
                    <DialogDescription>
                      Enter the basic information for your new clinical algorithm.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-id" className="text-right">
                        ID
                      </Label>
                      <Input
                        id="algo-id"
                        value={newAlgorithm.id}
                        onChange={(e) => setNewAlgorithm({...newAlgorithm, id: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., cv-risk"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="algo-name"
                        value={newAlgorithm.name}
                        onChange={(e) => setNewAlgorithm({...newAlgorithm, name: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., Cardiovascular Risk Assessment"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="algo-description"
                        value={newAlgorithm.description}
                        onChange={(e) => setNewAlgorithm({...newAlgorithm, description: e.target.value})}
                        className="col-span-3"
                        placeholder="Brief description of the algorithm"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={newAlgorithm.category}
                        onValueChange={(value) => setNewAlgorithm({...newAlgorithm, category: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Hepatology">Hepatology</SelectItem>
                          <SelectItem value="Rheumatology">Rheumatology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Pulmonology">Pulmonology</SelectItem>
                          <SelectItem value="Nephrology">Nephrology</SelectItem>
                          <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingAlgorithm(false)}>Cancel</Button>
                    <Button onClick={handleCreateAlgorithm}>Create & Configure</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {algorithms.map((algorithm) => (
                <Card key={algorithm.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      <CardTitle>{algorithm.name}</CardTitle>
                    </div>
                    <CardDescription>{algorithm.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {algorithm.category}
                      </span>
                      <p className="mt-2">
                        {Object.keys(algorithm.nodes).length} nodes
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditAlgorithm(algorithm.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewAnalytics(algorithm.id)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAlgorithm(algorithm.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AlgorithmsManagementPage() {
  return <ProtectedRoute Component={AlgorithmsManagement} />;
}