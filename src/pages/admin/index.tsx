import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, BarChart } from "lucide-react";
import { calculators } from "@/lib/calculator-definitions";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/route-components";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingCalculator, setIsCreatingCalculator] = useState(false);
  const [newCalculator, setNewCalculator] = useState({
    id: "",
    name: "",
    description: "",
    category: "Cardiology",
  });

  const handleCreateCalculator = () => {
    // Validate inputs
    if (!newCalculator.id || !newCalculator.name || !newCalculator.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if ID already exists
    if (calculators.some(calc => calc.id === newCalculator.id)) {
      toast({
        title: "ID already exists",
        description: "Please choose a different calculator ID",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would save to the database
    // For now, we'll just navigate to the editor
    toast({
      title: "Calculator created",
      description: "Now you can configure the calculator details",
    });
    
    navigate(`/admin/calculator/${newCalculator.id}`);
    setIsCreatingCalculator(false);
  };

  const handleEditCalculator = (id: string) => {
    navigate(`/admin/calculator/${id}`);
  };

  const handleDeleteCalculator = (id: string) => {
    // In a real implementation, this would delete from the database
    toast({
      title: "Not implemented",
      description: "Delete functionality would remove this calculator",
    });
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/admin/analytics/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Calculator Management</h1>
              <Dialog open={isCreatingCalculator} onOpenChange={setIsCreatingCalculator}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Calculator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Calculator</DialogTitle>
                    <DialogDescription>
                      Enter the basic information for your new calculator.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-id" className="text-right">
                        ID
                      </Label>
                      <Input
                        id="calc-id"
                        value={newCalculator.id}
                        onChange={(e) => setNewCalculator({...newCalculator, id: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., has-bled"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="calc-name"
                        value={newCalculator.name}
                        onChange={(e) => setNewCalculator({...newCalculator, name: e.target.value})}
                        className="col-span-3"
                        placeholder="e.g., HAS-BLED Score"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="calc-description"
                        value={newCalculator.description}
                        onChange={(e) => setNewCalculator({...newCalculator, description: e.target.value})}
                        className="col-span-3"
                        placeholder="Brief description of the calculator"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={newCalculator.category}
                        onValueChange={(value) => setNewCalculator({...newCalculator, category: value})}
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
                    <Button variant="outline" onClick={() => setIsCreatingCalculator(false)}>Cancel</Button>
                    <Button onClick={handleCreateCalculator}>Create & Configure</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators.map((calculator) => (
                <Card key={calculator.id}>
                  <CardHeader>
                    <CardTitle>{calculator.name}</CardTitle>
                    <CardDescription>{calculator.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {calculator.category}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditCalculator(calculator.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewAnalytics(calculator.id)}>
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCalculator(calculator.id)}>
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

export default function AdminDashboardPage() {
  return <ProtectedRoute Component={AdminDashboard} />;
}