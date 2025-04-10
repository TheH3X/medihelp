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
import { ArrowLeft, Plus, Trash2, Save, Eye, Edit, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useParameterStore } from "@/lib/parameter-store";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [newParameterId, setNewParameterId] = useState("");
  const [newParameterName, setNewParameterName] = useState("");
  const [newParameterType, setNewParameterType] = useState<"number" | "select" | "boolean">("number");
  const [newParameterUnit, setNewParameterUnit] = useState("");
  const [newParameterTooltip, setNewParameterTooltip] = useState("");
  const [newParameterStorable, setNewParameterStorable] = useState(false);
  const [newParameterOptions, setNewParameterOptions] = useState<{ value: string | number; label: string }[]>([]);
  
  const [newQuestionId, setNewQuestionId] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionEliminates, setNewQuestionEliminates] = useState(false);
  const [newQuestionEliminationMessage, setNewQuestionEliminationMessage] = useState("");
  
  const [newRangeMin, setNewRangeMin] = useState(0);
  const [newRangeMax, setNewRangeMax] = useState(0);
  const [newRangeInterpretation, setNewRangeInterpretation] = useState("");
  const [newRangeSeverity, setNewRangeSeverity] = useState<string>("low");
  
  const [newReference, setNewReference] = useState("");
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<number | null>(null);
  
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
    if (!newParameterId || !newParameterName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create new parameter
    const newParameter: ParameterDefinition = {
      id: newParameterId,
      name: newParameterName,
      type: newParameterType,
      tooltip: newParameterTooltip,
      storable: newParameterStorable,
      unit: newParameterUnit || undefined,
    };
    
    // Add options if it's a select type
    if (newParameterType === "select" && newParameterOptions.length > 0) {
      newParameter.options = newParameterOptions;
    }
    
    // Add parameter
    setCalculator({
      ...calculator,
      parameters: [...calculator.parameters, newParameter],
    });
    
    // Reset form
    setNewParameterId("");
    setNewParameterName("");
    setNewParameterType("number");
    setNewParameterUnit("");
    setNewParameterTooltip("");
    setNewParameterStorable(false);
    setNewParameterOptions([]);
  };
  
  const handleRemoveParameter = (index: number) => {
    const updatedParameters = [...calculator.parameters];
    updatedParameters.splice(index, 1);
    setCalculator({
      ...calculator,
      parameters: updatedParameters,
    });
  };
  
  const handleUpdateParameter = (index: number, field: string, value: any) => {
    const updatedParameters = [...calculator.parameters];
    
    if (field === "options") {
      // Handle options array separately
      updatedParameters[index] = {
        ...updatedParameters[index],
        options: value
      };
    } else {
      // Handle regular fields
      updatedParameters[index] = {
        ...updatedParameters[index],
        [field]: value
      };
    }
    
    setCalculator({
      ...calculator,
      parameters: updatedParameters
    });
  };
  
  const handleAddParameterOption = (parameterIndex: number) => {
    const updatedParameters = [...calculator.parameters];
    const currentOptions = updatedParameters[parameterIndex].options || [];
    
    updatedParameters[parameterIndex] = {
      ...updatedParameters[parameterIndex],
      options: [...currentOptions, { value: "", label: "" }]
    };
    
    setCalculator({
      ...calculator,
      parameters: updatedParameters
    });
  };
  
  const handleUpdateParameterOption = (parameterIndex: number, optionIndex: number, field: string, value: string) => {
    const updatedParameters = [...calculator.parameters];
    const currentOptions = [...(updatedParameters[parameterIndex].options || [])];
    
    currentOptions[optionIndex] = {
      ...currentOptions[optionIndex],
      [field]: value
    };
    
    updatedParameters[parameterIndex] = {
      ...updatedParameters[parameterIndex],
      options: currentOptions
    };
    
    setCalculator({
      ...calculator,
      parameters: updatedParameters
    });
  };
  
  const handleRemoveParameterOption = (parameterIndex: number, optionIndex: number) => {
    const updatedParameters = [...calculator.parameters];
    const currentOptions = [...(updatedParameters[parameterIndex].options || [])];
    
    currentOptions.splice(optionIndex, 1);
    
    updatedParameters[parameterIndex] = {
      ...updatedParameters[parameterIndex],
      options: currentOptions
    };
    
    setCalculator({
      ...calculator,
      parameters: updatedParameters
    });
  };
  
  const handleAddQuestion = () => {
    // Validate
    if (!newQuestionId || !newQuestionText) {
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
      screeningQuestions: [
        ...calculator.screeningQuestions, 
        {
          id: newQuestionId,
          question: newQuestionText,
          type: "boolean",
          eliminates: newQuestionEliminates,
          eliminationMessage: newQuestionEliminates ? newQuestionEliminationMessage : undefined,
        }
      ],
    });
    
    // Reset form
    setNewQuestionId("");
    setNewQuestionText("");
    setNewQuestionEliminates(false);
    setNewQuestionEliminationMessage("");
  };
  
  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...calculator.screeningQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    // If eliminates is set to false, clear the elimination message
    if (field === "eliminates" && value === false) {
      updatedQuestions[index].eliminationMessage = undefined;
    }
    
    setCalculator({
      ...calculator,
      screeningQuestions: updatedQuestions
    });
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
    if (newRangeInterpretation === "") {
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
        ranges: [
          ...calculator.interpretations.ranges, 
          {
            min: newRangeMin,
            max: newRangeMax,
            interpretation: newRangeInterpretation,
            severity: newRangeSeverity,
          }
        ],
      },
    });
    
    // Reset form
    setNewRangeMin(0);
    setNewRangeMax(0);
    setNewRangeInterpretation("");
    setNewRangeSeverity("low");
  };
  
  const handleUpdateRange = (index: number, field: string, value: any) => {
    const updatedRanges = [...calculator.interpretations.ranges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: field === "min" || field === "max" ? Number(value) : value
    };
    
    setCalculator({
      ...calculator,
      interpretations: {
        ...calculator.interpretations,
        ranges: updatedRanges
      }
    });
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
  };
  
  const handleUpdateReference = (index: number, value: string) => {
    const updatedReferences = [...calculator.references];
    updatedReferences[index] = value;
    
    setCalculator({
      ...calculator,
      references: updatedReferences
    });
    
    if (editingReferenceIndex === index) {
      setEditingReferenceIndex(null);
    }
  };
  
  const handleRemoveReference = (index: number) => {
    const updatedReferences = [...calculator.references];
    updatedReferences.splice(index, 1);
    setCalculator({
      ...calculator,
      references: updatedReferences,
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
                  <CardHeader>
                    <CardTitle>Parameters</CardTitle>
                    <CardDescription>
                      Define the input parameters for this calculator
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="h-[500px] pr-4">
                      {calculator.parameters.map((param, index) => (
                        <Card key={param.id} className="mb-4">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={param.name}
                                  onChange={(e) => handleUpdateParameter(index, "name", e.target.value)}
                                  className="font-semibold text-lg"
                                  placeholder="Parameter Name"
                                />
                                <span className="text-xs text-muted-foreground">
                                  ID: 
                                  <Input
                                    value={param.id}
                                    onChange={(e) => handleUpdateParameter(index, "id", e.target.value)}
                                    className="w-24 h-6 text-xs ml-1 inline-block"
                                  />
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveParameter(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`param-${index}-type`}>Type</Label>
                                <Select 
                                  value={param.type}
                                  onValueChange={(value: "number" | "select" | "boolean") => 
                                    handleUpdateParameter(index, "type", value)
                                  }
                                >
                                  <SelectTrigger id={`param-${index}-type`}>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor={`param-${index}-unit`}>Unit (optional)</Label>
                                <Input
                                  id={`param-${index}-unit`}
                                  value={param.unit || ""}
                                  onChange={(e) => handleUpdateParameter(index, "unit", e.target.value)}
                                  placeholder="e.g., years"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`param-${index}-tooltip`}>Tooltip</Label>
                              <Textarea
                                id={`param-${index}-tooltip`}
                                value={param.tooltip}
                                onChange={(e) => handleUpdateParameter(index, "tooltip", e.target.value)}
                                placeholder="Explanation of this parameter"
                                rows={2}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`param-${index}-storable`}
                                checked={param.storable}
                                onCheckedChange={(checked) => handleUpdateParameter(index, "storable", checked)}
                              />
                              <Label htmlFor={`param-${index}-storable`}>
                                Allow this parameter to be stored for reuse
                              </Label>
                            </div>
                            
                            {param.type === "select" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Options</Label>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleAddParameterOption(index)}
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                
                                {(param.options || []).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <Input 
                                      value={option.label}
                                      onChange={(e) => handleUpdateParameterOption(index, optionIndex, "label", e.target.value)}
                                      placeholder="Label"
                                      className="flex-1"
                                    />
                                    <Input 
                                      value={option.value.toString()}
                                      onChange={(e) => handleUpdateParameterOption(index, optionIndex, "value", e.target.value)}
                                      placeholder="Value"
                                      className="flex-1"
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleRemoveParameterOption(index, optionIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Parameter</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-param-id">ID</Label>
                            <Input
                              id="new-param-id"
                              value={newParameterId}
                              onChange={(e) => setNewParameterId(e.target.value)}
                              placeholder="e.g., age"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-param-name">Name</Label>
                            <Input
                              id="new-param-name"
                              value={newParameterName}
                              onChange={(e) => setNewParameterName(e.target.value)}
                              placeholder="e.g., Age"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-param-type">Type</Label>
                            <Select 
                              value={newParameterType}
                              onValueChange={(value: "number" | "select" | "boolean") => setNewParameterType(value)}
                            >
                              <SelectTrigger id="new-param-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="new-param-unit">Unit (optional)</Label>
                            <Input
                              id="new-param-unit"
                              value={newParameterUnit}
                              onChange={(e) => setNewParameterUnit(e.target.value)}
                              placeholder="e.g., years"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="new-param-tooltip">Tooltip</Label>
                          <Textarea
                            id="new-param-tooltip"
                            value={newParameterTooltip}
                            onChange={(e) => setNewParameterTooltip(e.target.value)}
                            placeholder="Explanation of this parameter"
                            rows={2}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="new-param-storable"
                            checked={newParameterStorable}
                            onCheckedChange={setNewParameterStorable}
                          />
                          <Label htmlFor="new-param-storable">
                            Allow this parameter to be stored for reuse
                          </Label>
                        </div>
                        
                        {newParameterType === "select" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Options</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setNewParameterOptions([...newParameterOptions, { value: "", label: "" }])}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Option
                              </Button>
                            </div>
                            
                            {newParameterOptions.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input 
                                  value={option.label}
                                  onChange={(e) => {
                                    const updatedOptions = [...newParameterOptions];
                                    updatedOptions[optionIndex] = { ...option, label: e.target.value };
                                    setNewParameterOptions(updatedOptions);
                                  }}
                                  placeholder="Label"
                                  className="flex-1"
                                />
                                <Input 
                                  value={option.value.toString()}
                                  onChange={(e) => {
                                    const updatedOptions = [...newParameterOptions];
                                    updatedOptions[optionIndex] = { ...option, value: e.target.value };
                                    setNewParameterOptions(updatedOptions);
                                  }}
                                  placeholder="Value"
                                  className="flex-1"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const updatedOptions = [...newParameterOptions];
                                    updatedOptions.splice(optionIndex, 1);
                                    setNewParameterOptions(updatedOptions);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddParameter}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Parameter
                        </Button>
                      </CardFooter>
                    </Card>
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
                  <CardHeader>
                    <CardTitle>Screening Questions</CardTitle>
                    <CardDescription>
                      Define pre-screening questions to determine calculator applicability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="h-[400px] pr-4">
                      {calculator.screeningQuestions.map((question, index) => (
                        <Card key={question.id} className="mb-4">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Input
                                value={question.question}
                                onChange={(e) => handleUpdateQuestion(index, "question", e.target.value)}
                                className="font-semibold"
                                placeholder="Question text"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: 
                              <Input
                                value={question.id}
                                onChange={(e) => handleUpdateQuestion(index, "id", e.target.value)}
                                className="w-24 h-6 text-xs ml-1 inline-block"
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2 space-y-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`question-${index}-eliminates`}
                                checked={question.eliminates}
                                onCheckedChange={(checked) => handleUpdateQuestion(index, "eliminates", checked)}
                              />
                              <Label htmlFor={`question-${index}-eliminates`}>
                                A "No" answer makes calculator inappropriate
                              </Label>
                            </div>
                            
                            {question.eliminates && (
                              <div>
                                <Label htmlFor={`question-${index}-message`}>Warning Message</Label>
                                <Textarea
                                  id={`question-${index}-message`}
                                  value={question.eliminationMessage || ""}
                                  onChange={(e) => handleUpdateQuestion(index, "eliminationMessage", e.target.value)}
                                  placeholder="Message to show when eliminated"
                                  rows={2}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Question</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="new-question-id">ID</Label>
                          <Input
                            id="new-question-id"
                            value={newQuestionId}
                            onChange={(e) => setNewQuestionId(e.target.value)}
                            placeholder="e.g., patientAge"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="new-question-text">Question</Label>
                          <Textarea
                            id="new-question-text"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="e.g., Is the patient over 18 years old?"
                            rows={2}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="new-question-eliminates"
                            checked={newQuestionEliminates}
                            onCheckedChange={setNewQuestionEliminates}
                          />
                          <Label htmlFor="new-question-eliminates">
                            A "No" answer makes calculator inappropriate
                          </Label>
                        </div>
                        
                        {newQuestionEliminates && (
                          <div>
                            <Label htmlFor="new-question-message">Warning Message</Label>
                            <Textarea
                              id="new-question-message"
                              value={newQuestionEliminationMessage}
                              onChange={(e) => setNewQuestionEliminationMessage(e.target.value)}
                              placeholder="Message to show when eliminated"
                              rows={2}
                            />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddQuestion}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </CardFooter>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Interpretation Tab */}
              <TabsContent value="interpretation" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Interpretations</CardTitle>
                    <CardDescription>
                      Define how different score ranges should be interpreted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="h-[300px] pr-4">
                      {calculator.interpretations.ranges.map((range, index) => (
                        <Card key={index} className="mb-4">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Label>Min:</Label>
                                  <Input
                                    type="number"
                                    value={range.min}
                                    onChange={(e) => handleUpdateRange(index, "min", e.target.value)}
                                    className="w-20 h-8"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Label>Max:</Label>
                                  <Input
                                    type="number"
                                    value={range.max}
                                    onChange={(e) => handleUpdateRange(index, "max", e.target.value)}
                                    className="w-20 h-8"
                                  />
                                </div>
                              </div>
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
                          <CardContent className="pb-2 space-y-4">
                            <div>
                              <Label htmlFor={`range-${index}-interpretation`}>Interpretation</Label>
                              <Textarea
                                id={`range-${index}-interpretation`}
                                value={range.interpretation}
                                onChange={(e) => handleUpdateRange(index, "interpretation", e.target.value)}
                                placeholder="e.g., Low risk of adverse events"
                                rows={2}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`range-${index}-severity`}>Severity</Label>
                              <Select 
                                value={range.severity || "low"}
                                onValueChange={(value) => handleUpdateRange(index, "severity", value)}
                              >
                                <SelectTrigger id={`range-${index}-severity`}>
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
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Range</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-range-min">Min Score</Label>
                            <Input
                              id="new-range-min"
                              type="number"
                              value={newRangeMin}
                              onChange={(e) => setNewRangeMin(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-range-max">Max Score</Label>
                            <Input
                              id="new-range-max"
                              type="number"
                              value={newRangeMax}
                              onChange={(e) => setNewRangeMax(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="new-range-interpretation">Interpretation</Label>
                          <Textarea
                            id="new-range-interpretation"
                            value={newRangeInterpretation}
                            onChange={(e) => setNewRangeInterpretation(e.target.value)}
                            placeholder="e.g., Low risk of adverse events"
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="new-range-severity">Severity</Label>
                          <Select 
                            value={newRangeSeverity}
                            onValueChange={setNewRangeSeverity}
                          >
                            <SelectTrigger id="new-range-severity">
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
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddRange}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Range
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <div className="space-y-2">
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
                  </CardContent>
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
                  <CardHeader>
                    <CardTitle>References</CardTitle>
                    <CardDescription>
                      Add medical literature references for this calculator
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="h-[300px] pr-4">
                      {calculator.references.map((reference, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 border rounded-md mb-2">
                          {editingReferenceIndex === index ? (
                            <Textarea
                              value={reference}
                              onChange={(e) => handleUpdateReference(index, e.target.value)}
                              className="flex-1"
                              autoFocus
                              onBlur={() => setEditingReferenceIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  setEditingReferenceIndex(null);
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="flex-1 cursor-text" 
                              onClick={() => setEditingReferenceIndex(index)}
                            >
                              {reference}
                            </div>
                          )}
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
                    </ScrollArea>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Reference</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="new-reference">Reference</Label>
                          <Textarea
                            id="new-reference"
                            value={newReference}
                            onChange={(e) => setNewReference(e.target.value)}
                            placeholder="e.g., Smith J, et al. Title of paper. Journal Name. 2020;10(2):123-145."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddReference}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Reference
                        </Button>
                      </CardFooter>
                    </Card>
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