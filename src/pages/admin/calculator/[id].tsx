import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCalculatorById, type CalculatorDefinition, type ParameterDefinition, type ScreeningQuestion } from "@/lib/calculator-definitions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useParameterStore } from "@/lib/parameter-store";

function CalculatorEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { parameters } = useParameterStore();
  
  // Get the calculator or create a new one if it doesn't exist
  const existingCalculator = id ? getCalculatorById(id) : undefined;
  
  const [calculator, setCalculator] = useState<CalculatorDefinition>({
    id: id || "",
    name: "",
    description: "",
    category: "Cardiology",
    parameters: [],
    screeningQuestions: [],
    calculate: () => ({ score: 0, interpretation: "" }),
    interpretations: {
      ranges: [],
      notes: "",
    },
    references: [],
  });
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddingParameter, setIsAddingParameter] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isAddingRange, setIsAddingRange] = useState(false);
  const [isAddingReference, setIsAddingReference] = useState(false);
  
  const [newParameter, setNewParameter] = useState<ParameterDefinition>({
    id: "",
    name: "",
    type: "number",
    tooltip: "",
    storable: false,
  });
  
  const [newQuestion, setNewQuestion] = useState<ScreeningQuestion>({
    id: "",
    question: "",
    type: "boolean",
    eliminates: false,
    eliminationMessage: "",
  });
  
  const [newRange, setNewRange] = useState({
    min: 0,
    max: 0,
    interpretation: "",
    severity: "low",
  });
  
  const [newReference, setNewReference] = useState("");
  
  // Load calculator data if editing an existing one
  useEffect(() => {
    if (existingCalculator) {
      setCalculator(existingCalculator);
    }
  }, [existingCalculator]);
  
  const handleSaveCalculator = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Calculator saved",
      description: "Your changes have been saved successfully",
    });
  };
  
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
    
    // Add parameter
    setCalculator({
      ...calculator,
      parameters: [...calculator.parameters, newParameter],
    });
    
    // Reset form
    setNewParameter({
      id: "",
      name: "",
      type: "number",
      tooltip: "",
      storable: false,
    });
    
    setIsAddingParameter(false);
  };
  
  const handleRemoveParameter = (index: number) => {
    const updatedParameters = [...calculator.parameters];
    updatedParameters.splice(index, 1);
    setCalculator({
      ...calculator,
      parameters: updatedParameters,
    });
  };
  
  const handleAddQuestion = () => {
    // Validate
    if (!newQuestion.id || !newQuestion.question) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Add question
    setCalculator({
      ...calculator,
      screeningQuestions: [...calculator.screeningQuestions, newQuestion],
    });
    
    // Reset form
    setNewQuestion({
      id: "",
      question: "",
      type: "boolean",
      eliminates: false,
      eliminationMessage: "",
    });
    
    setIsAddingQuestion(false);
  };
  
  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...calculator.screeningQuestions];
    updatedQuestions.splice(index, 1);
    setCalculator({
      ...calculator,
      screeningQuestions: updatedQuestions,
    });
  };
  
  const handleAddRange = () => {
    // Validate
    if (newRange.interpretation === "") {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Add range
    setCalculator({
      ...calculator,
      interpretations: {
        ...calculator.interpretations,
        ranges: [...calculator.interpretations.ranges, newRange],
      },
    });
    
    // Reset form
    setNewRange({
      min: 0,
      max: 0,
      interpretation: "",
      severity: "low",
    });
    
    setIsAddingRange(false);
  };
  
  const handleRemoveRange = (index: number) => {
    const updatedRanges = [...calculator.interpretations.ranges];
    updatedRanges.splice(index, 1);
    setCalculator({
      ...calculator,
      interpretations: {
        ...calculator.interpretations,
        ranges: updatedRanges,
      },
    });
  };
  
  const handleAddReference = () => {
    // Validate
    if (!newReference) {
      toast({
        title: "Missing information",
        description: "Please enter a reference",
        variant: "destructive",
      });
      return;
    }
    
    // Add reference
    setCalculator({
      ...calculator,
      references: [...calculator.references, newReference],
    });
    
    // Reset form
    setNewReference("");
    
    setIsAddingReference(false);
  };
  
  const handleRemoveReference = (index: number) => {
    const updatedReferences = [...calculator.references];
    updatedReferences.splice(index, 1);
    setCalculator({
      ...calculator,
      references: updatedReferences,
    });
  };
  
  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...calculator.screeningQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setCalculator({
      ...calculator,
      screeningQuestions: updatedQuestions
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/admin")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold">
                  {existingCalculator ? `Edit: ${calculator.name}` : "Create New Calculator"}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={handleSaveCalculator}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="screening">Screening</TabsTrigger>
                <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Set the basic details for this calculator
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-id" className="text-right">
                        ID
                      </Label>
                      <Input
                        id="calc-id"
                        value={calculator.id}
                        onChange={(e) => setCalculator({...calculator, id: e.target.value})}
                        className="col-span-3"
                        disabled={!!existingCalculator}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="calc-name"
                        value={calculator.name}
                        onChange={(e) => setCalculator({...calculator, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="calc-description"
                        value={calculator.description}
                        onChange={(e) => setCalculator({...calculator, description: e.target.value})}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="calc-category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={calculator.category}
                        onValueChange={(value) => setCalculator({...calculator, category: value})}
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
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Parameters Tab */}
              <TabsContent value="parameters" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Parameters</CardTitle>
                      <CardDescription>
                        Define the input parameters for this calculator
                      </CardDescription>
                    </div>
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
                            Define a new input parameter for this calculator.
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
                              value={newParameter.type}
                              onValueChange={(value: "number" | "select" | "boolean") => setNewParameter({...newParameter, type: value})}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
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
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="param-tooltip" className="text-right">
                              Tooltip
                            </Label>
                            <Textarea
                              id="param-tooltip"
                              value={newParameter.tooltip}
                              onChange={(e) => setNewParameter({...newParameter, tooltip: e.target.value})}
                              className="col-span-3"
                              placeholder="Explanation of this parameter"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="param-storable" className="text-right">
                              Storable
                            </Label>
                            <div className="flex items-center space-x-2 col-span-3">
                              <Switch
                                id="param-storable"
                                checked={newParameter.storable}
                                onCheckedChange={(checked) => setNewParameter({...newParameter, storable: checked})}
                              />
                              <Label htmlFor="param-storable">
                                Allow this parameter to be stored for reuse
                              </Label>
                            </div>
                          </div>
                          
                          {newParameter.type === "select" && (
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label className="text-right mt-2">
                                Options
                              </Label>
                              <div className="col-span-3 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Options for select parameters can be added after creating the parameter.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddingParameter(false)}>Cancel</Button>
                          <Button onClick={handleAddParameter}>Add Parameter</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {calculator.parameters.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No parameters defined yet. Click "Add Parameter" to create one.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculator.parameters.map((param, index) => (
                          <Card key={param.id}>
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{param.name}</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveParameter(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription>ID: {param.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Type:</span> {param.type}
                                </div>
                                {param.unit && (
                                  <div>
                                    <span className="font-medium">Unit:</span> {param.unit}
                                  </div>
                                )}
                                <div className="col-span-2">
                                  <span className="font-medium">Tooltip:</span> {param.tooltip}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">Storable:</span> {param.storable ? "Yes" : "No"}
                                </div>
                                {param.type === "select" && param.options && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Options:</span>
                                    <ul className="list-disc pl-5 mt-1">
                                      {param.options.map((option, i) => (
                                        <li key={i}>{option.label} ({option.value})</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Parameter Storage Mapping</CardTitle>
                    <CardDescription>
                      Map calculator parameters to stored parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {calculator.parameters.filter(p => p.storable).length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No storable parameters defined yet. Mark parameters as storable to enable mapping.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculator.parameters.filter(p => p.storable).map((param) => (
                          <div key={param.id} className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">{param.name}</Label>
                            <Select defaultValue={param.id}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Map to stored parameter" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={param.id}>{param.name} (Default)</SelectItem>
                                {parameters.map((storedParam) => (
                                  <SelectItem key={storedParam.id} value={storedParam.id}>
                                    {storedParam.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Screening Tab */}
              <TabsContent value="screening" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Screening Questions</CardTitle>
                      <CardDescription>
                        Define pre-screening questions to determine calculator applicability
                      </CardDescription>
                    </div>
                    <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Screening Question</DialogTitle>
                          <DialogDescription>
                            Define a new pre-screening question for this calculator.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="question-id" className="text-right">
                              ID
                            </Label>
                            <Input
                              id="question-id"
                              value={newQuestion.id}
                              onChange={(e) => setNewQuestion({...newQuestion, id: e.target.value})}
                              className="col-span-3"
                              placeholder="e.g., patientAge"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="question-text" className="text-right">
                              Question
                            </Label>
                            <Textarea
                              id="question-text"
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                              className="col-span-3"
                              placeholder="e.g., Is the patient over 18 years old?"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="question-eliminates" className="text-right">
                              Eliminates
                            </Label>
                            <div className="flex items-center space-x-2 col-span-3">
                              <Switch
                                id="question-eliminates"
                                checked={newQuestion.eliminates}
                                onCheckedChange={(checked) => setNewQuestion({...newQuestion, eliminates: checked})}
                              />
                              <Label htmlFor="question-eliminates">
                                A "No" answer makes calculator inappropriate
                              </Label>
                            </div>
                          </div>
                          {newQuestion.eliminates && (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="elimination-message" className="text-right">
                                Warning Message
                              </Label>
                              <Textarea
                                id="elimination-message"
                                value={newQuestion.eliminationMessage || ""}
                                onChange={(e) => setNewQuestion({...newQuestion, eliminationMessage: e.target.value})}
                                className="col-span-3"
                                placeholder="Message to show when eliminated"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>Cancel</Button>
                          <Button onClick={handleAddQuestion}>Add Question</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {calculator.screeningQuestions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No screening questions defined yet. Click "Add Question" to create one.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculator.screeningQuestions.map((question, index) => (
                          <Card key={question.id}>
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{question.question}</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveQuestion(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription>ID: {question.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Eliminates:</span>
                                  <Switch
                                    checked={question.eliminates}
                                    onCheckedChange={(checked) => handleUpdateQuestion(index, 'eliminates', checked)}
                                  />
                                </div>
                                {question.eliminates && (
                                  <div className="col-span-2 space-y-2">
                                    <Label htmlFor={`elimination-message-${index}`} className="font-medium">
                                      Warning Message:
                                    </Label>
                                    <Textarea
                                      id={`elimination-message-${index}`}
                                      value={question.eliminationMessage || ""}
                                      onChange={(e) => handleUpdateQuestion(index, 'eliminationMessage', e.target.value)}
                                      placeholder="Message to show when eliminated"
                                      rows={2}
                                      className="w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Interpretation Tab */}
              <TabsContent value="interpretation" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Score Interpretations</CardTitle>
                      <CardDescription>
                        Define how different score ranges should be interpreted
                      </CardDescription>
                    </div>
                    <Dialog open={isAddingRange} onOpenChange={setIsAddingRange}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Range
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Score Range</DialogTitle>
                          <DialogDescription>
                            Define a new score range and its interpretation.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="range-min" className="text-right">
                              Min Score
                            </Label>
                            <Input
                              id="range-min"
                              type="number"
                              value={newRange.min}
                              onChange={(e) => setNewRange({...newRange, min: Number(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="range-max" className="text-right">
                              Max Score
                            </Label>
                            <Input
                              id="range-max"
                              type="number"
                              value={newRange.max}
                              onChange={(e) => setNewRange({...newRange, max: Number(e.target.value)})}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="range-interpretation" className="text-right">
                              Interpretation
                            </Label>
                            <Textarea
                              id="range-interpretation"
                              value={newRange.interpretation}
                              onChange={(e) => setNewRange({...newRange, interpretation: e.target.value})}
                              className="col-span-3"
                              placeholder="e.g., Low risk of adverse events"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="range-severity" className="text-right">
                              Severity
                            </Label>
                            <Select 
                              value={newRange.severity}
                              onValueChange={(value) => setNewRange({...newRange, severity: value})}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select severity level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="very-high">Very High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddingRange(false)}>Cancel</Button>
                          <Button onClick={handleAddRange}>Add Range</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {calculator.interpretations.ranges.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No interpretation ranges defined yet. Click "Add Range" to create one.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculator.interpretations.ranges.map((range, index) => (
                          <Card key={index}>
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  Score: {range.min} - {range.max}
                                </CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveRange(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2">
                                  <span className="font-medium">Interpretation:</span> {range.interpretation}
                                </div>
                                <div>
                                  <span className="font-medium">Severity:</span> {range.severity}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="w-full space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={calculator.interpretations.notes || ""}
                        onChange={(e) => setCalculator({
                          ...calculator,
                          interpretations: {
                            ...calculator.interpretations,
                            notes: e.target.value
                          }
                        })}
                        placeholder="Additional notes about interpreting this calculator's results"
                        rows={3}
                      />
                    </div>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Calculation Logic</CardTitle>
                    <CardDescription>
                      Define how the score is calculated from input parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">
                          In a full implementation, this would include a visual formula builder.
                          For now, calculation logic must be defined in the code.
                        </p>
                        <pre className="text-xs overflow-auto p-2 bg-background rounded border">
{`// Example calculation function
function calculate(params) {
  let score = 0;
  
  if (params.hypertension) score += 1;
  if (params.renalDisease) score += 1;
  // Add more conditions based on parameters
  
  return {
    score: score,
    interpretation: "Sample interpretation",
    severity: score > 3 ? "high" : "low"
  };
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* References Tab */}
              <TabsContent value="references" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>References</CardTitle>
                      <CardDescription>
                        Add medical literature references for this calculator
                      </CardDescription>
                    </div>
                    <Dialog open={isAddingReference} onOpenChange={setIsAddingReference}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Reference
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Reference</DialogTitle>
                          <DialogDescription>
                            Add a medical literature reference for this calculator.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reference-text" className="text-right">
                              Reference
                            </Label>
                            <Textarea
                              id="reference-text"
                              value={newReference}
                              onChange={(e) => setNewReference(e.target.value)}
                              className="col-span-3"
                              placeholder="e.g., Smith J, et al. Title of paper. Journal Name. 2020;10(2):123-145."
                              rows={4}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddingReference(false)}>Cancel</Button>
                          <Button onClick={handleAddReference}>Add Reference</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {calculator.references.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No references added yet. Click "Add Reference" to add one.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {calculator.references.map((reference, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
                            <div className="flex-1">{reference}</div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveReference(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Calculator Preview</DialogTitle>
            <DialogDescription>
              This is how your calculator will appear to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[600px] overflow-auto border rounded-md p-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{calculator.name}</h2>
              <p className="text-muted-foreground">{calculator.description}</p>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Pre-Screening Questions</h3>
                {calculator.screeningQuestions.length > 0 ? (
                  <div className="space-y-2">
                    {calculator.screeningQuestions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <Label>{question.question}</Label>
                        <RadioGroup className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id={`preview-${question.id}-yes`} />
                            <Label htmlFor={`preview-${question.id}-yes`} className="font-normal text-sm">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id={`preview-${question.id}-no`} />
                            <Label htmlFor={`preview-${question.id}-no`} className="font-normal text-sm">No</Label>
                          </div>
                        </RadioGroup>
                        {question.eliminates && question.eliminationMessage && (
                          <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                            Warning: {question.eliminationMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No screening questions defined.</p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Calculator Inputs</h3>
                {calculator.parameters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculator.parameters.map((param) => (
                      <div key={param.id} className="space-y-2">
                        <Label htmlFor={`preview-param-${param.id}`}>{param.name}</Label>
                        {param.type === "number" && (
                          <Input id={`preview-param-${param.id}`} type="number" placeholder="0" />
                        )}
                        {param.type === "boolean" && (
                          <RadioGroup className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id={`preview-param-${param.id}-yes`} />
                              <Label htmlFor={`preview-param-${param.id}-yes`} className="font-normal text-sm">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id={`preview-param-${param.id}-no`} />
                              <Label htmlFor={`preview-param-${param.id}-no`} className="font-normal text-sm">No</Label>
                            </div>
                          </RadioGroup>
                        )}
                        {param.type === "select" && (
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options ? (
                                param.options.map((option) => (
                                  <SelectItem key={option.value.toString()} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="placeholder">Sample Option</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {param.unit && (
                          <p className="text-xs text-muted-foreground">Unit: {param.unit}</p>
                        )}
                        {param.tooltip && (
                          <p className="text-xs text-muted-foreground">Tooltip: {param.tooltip}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No parameters defined.</p>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Results</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="text-4xl font-bold rounded-full h-16 w-16 flex items-center justify-center bg-primary/10 text-primary">
                      0
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="font-medium">Interpretation</h4>
                    <p>Sample interpretation based on score</p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Interpretation Ranges</h4>
                    {calculator.interpretations.ranges.length > 0 ? (
                      <ul className="space-y-1">
                        {calculator.interpretations.ranges.map((range, index) => (
                          <li key={index}>
                            <span className="font-medium">{range.min}-{range.max}:</span> {range.interpretation}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No interpretation ranges defined.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {calculator.references.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">References</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {calculator.references.map((reference, index) => (
                      <li key={index}>{reference}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CalculatorEditorPage() {
  return <ProtectedRoute Component={CalculatorEditor} />;
}