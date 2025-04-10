import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlgorithmById, type AlgorithmDefinition, type AlgorithmNode } from "@/lib/algorithm-definitions";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, Eye, GitBranch, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function AlgorithmEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the algorithm or create a new one if it doesn't exist
  const existingAlgorithm = id ? getAlgorithmById(id) : undefined;
  
  const [algorithm, setAlgorithm] = useState<AlgorithmDefinition>({
    id: id || "",
    name: "",
    description: "",
    category: "Cardiology",
    startNodeId: "",
    nodes: {},
    preparationInfo: {
      requiredParameters: [],
      potentialParameters: [],
    },
    references: [],
  });
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeType, setNewNodeType] = useState<"question" | "decision" | "action" | "result">("question");
  const [newNodeContent, setNewNodeContent] = useState("");
  const [newNodeDescription, setNewNodeDescription] = useState("");
  
  const [newReference, setNewReference] = useState("");
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<number | null>(null);
  
  // Load algorithm data if editing an existing one
  useEffect(() => {
    if (existingAlgorithm) {
      setAlgorithm(existingAlgorithm);
      if (existingAlgorithm.startNodeId) {
        setSelectedNodeId(existingAlgorithm.startNodeId);
      }
    }
  }, [existingAlgorithm]);
  
  const handleSaveAlgorithm = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Algorithm saved",
      description: "Your changes have been saved successfully",
    });
  };
  
  const handleAddNode = () => {
    // Validate
    if (!newNodeId || !newNodeContent) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check if node ID already exists
    if (algorithm.nodes[newNodeId]) {
      toast({
        title: "Node ID already exists",
        description: "Please choose a different node ID",
        variant: "destructive",
      });
      return;
    }
    
    // Create new node
    const newNode: AlgorithmNode = {
      id: newNodeId,
      type: newNodeType,
      content: newNodeContent,
      description: newNodeDescription || undefined,
      parameters: [],
      branches: [],
    };
    
    // Add node to algorithm
    setAlgorithm({
      ...algorithm,
      nodes: {
        ...algorithm.nodes,
        [newNodeId]: newNode
      },
      // If this is the first node, set it as the start node
      startNodeId: algorithm.startNodeId || newNodeId,
    });
    
    // Select the new node
    setSelectedNodeId(newNodeId);
    
    // Reset form
    setNewNodeId("");
    setNewNodeContent("");
    setNewNodeDescription("");
    
    toast({
      title: "Node added",
      description: "The node has been added to the algorithm",
    });
  };
  
  const handleDeleteNode = (nodeId: string) => {
    // Check if this is the start node
    if (nodeId === algorithm.startNodeId) {
      toast({
        title: "Cannot delete start node",
        description: "Please set another node as the start node first",
        variant: "destructive",
      });
      return;
    }
    
    // Create a copy of the nodes without the deleted node
    const { [nodeId]: deletedNode, ...remainingNodes } = algorithm.nodes;
    
    // Remove any branches that point to this node
    const updatedNodes = Object.entries(remainingNodes).reduce((acc, [id, node]) => {
      if (node.branches) {
        const updatedBranches = node.branches.filter(branch => branch.nextNodeId !== nodeId);
        acc[id] = {
          ...node,
          branches: updatedBranches
        };
      } else {
        acc[id] = node;
      }
      return acc;
    }, {} as Record<string, AlgorithmNode>);
    
    // Update algorithm
    setAlgorithm({
      ...algorithm,
      nodes: updatedNodes
    });
    
    // If the deleted node was selected, select another node
    if (selectedNodeId === nodeId) {
      const nextNodeId = Object.keys(updatedNodes)[0];
      setSelectedNodeId(nextNodeId || null);
    }
    
    toast({
      title: "Node deleted",
      description: "The node has been removed from the algorithm",
    });
  };
  
  const handleSetStartNode = (nodeId: string) => {
    setAlgorithm({
      ...algorithm,
      startNodeId: nodeId
    });
    
    toast({
      title: "Start node set",
      description: "The algorithm will now start from this node",
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
    setAlgorithm({
      ...algorithm,
      references: [...algorithm.references, newReference],
    });
    
    // Reset form
    setNewReference("");
  };
  
  const handleUpdateReference = (index: number, value: string) => {
    const updatedReferences = [...algorithm.references];
    updatedReferences[index] = value;
    
    setAlgorithm({
      ...algorithm,
      references: updatedReferences
    });
    
    if (editingReferenceIndex === index) {
      setEditingReferenceIndex(null);
    }
  };
  
  const handleRemoveReference = (index: number) => {
    const updatedReferences = [...algorithm.references];
    updatedReferences.splice(index, 1);
    setAlgorithm({
      ...algorithm,
      references: updatedReferences,
    });
  };
  
  const handleAddRequiredParameter = (paramId: string) => {
    if (!paramId || algorithm.preparationInfo.requiredParameters.includes(paramId)) return;
    
    setAlgorithm({
      ...algorithm,
      preparationInfo: {
        ...algorithm.preparationInfo,
        requiredParameters: [...algorithm.preparationInfo.requiredParameters, paramId]
      }
    });
  };
  
  const handleRemoveRequiredParameter = (paramId: string) => {
    setAlgorithm({
      ...algorithm,
      preparationInfo: {
        ...algorithm.preparationInfo,
        requiredParameters: algorithm.preparationInfo.requiredParameters.filter(id => id !== paramId)
      }
    });
  };
  
  const handleAddPotentialParameter = (paramId: string) => {
    if (!paramId || algorithm.preparationInfo.potentialParameters.includes(paramId)) return;
    
    setAlgorithm({
      ...algorithm,
      preparationInfo: {
        ...algorithm.preparationInfo,
        potentialParameters: [...algorithm.preparationInfo.potentialParameters, paramId]
      }
    });
  };
  
  const handleRemovePotentialParameter = (paramId: string) => {
    setAlgorithm({
      ...algorithm,
      preparationInfo: {
        ...algorithm.preparationInfo,
        potentialParameters: algorithm.preparationInfo.potentialParameters.filter(id => id !== paramId)
      }
    });
  };
  
  // Get the selected node
  const selectedNode = selectedNodeId ? algorithm.nodes[selectedNodeId] : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/admin/algorithms")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold">
                  {existingAlgorithm ? `Edit: ${algorithm.name}` : "Create New Algorithm"}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={handleSaveAlgorithm}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="nodes">Nodes & Flow</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Set the basic details for this algorithm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-id" className="text-right">
                        ID
                      </Label>
                      <Input
                        id="algo-id"
                        value={algorithm.id}
                        onChange={(e) => setAlgorithm({...algorithm, id: e.target.value})}
                        className="col-span-3"
                        disabled={!!existingAlgorithm}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="algo-name"
                        value={algorithm.name}
                        onChange={(e) => setAlgorithm({...algorithm, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="algo-description"
                        value={algorithm.description}
                        onChange={(e) => setAlgorithm({...algorithm, description: e.target.value})}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="algo-category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={algorithm.category}
                        onValueChange={(value) => setAlgorithm({...algorithm, category: value})}
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
              
              {/* Nodes & Flow Tab */}
              <TabsContent value="nodes" className="space-y-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Node List */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Algorithm Nodes</CardTitle>
                      <CardDescription>
                        Manage the nodes in your algorithm
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-2">
                          {Object.values(algorithm.nodes).map((node) => (
                            <div 
                              key={node.id} 
                              className={`p-3 border rounded-md cursor-pointer ${
                                selectedNodeId === node.id ? 'border-primary bg-primary/5' : ''
                              } ${
                                algorithm.startNodeId === node.id ? 'border-green-500' : ''
                              }`}
                              onClick={() => setSelectedNodeId(node.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    node.type === 'question' ? 'bg-blue-500' :
                                    node.type === 'decision' ? 'bg-purple-500' :
                                    node.type === 'action' ? 'bg-green-500' :
                                    'bg-amber-500'
                                  }`}></span>
                                  <span className="font-medium">{node.content}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {algorithm.startNodeId !== node.id && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetStartNode(node.id);
                                      }}
                                    >
                                      <GitBranch className="h-3.5 w-3.5 text-green-500" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNode(node.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {node.type} · {node.branches?.length || 0} branches
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter>
                      <div className="space-y-4 w-full">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Node ID"
                            value={newNodeId}
                            onChange={(e) => setNewNodeId(e.target.value)}
                          />
                          <Select 
                            value={newNodeType}
                            onValueChange={(value: "question" | "decision" | "action" | "result") => setNewNodeType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Node Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="question">Question</SelectItem>
                              <SelectItem value="decision">Decision</SelectItem>
                              <SelectItem value="action">Action</SelectItem>
                              <SelectItem value="result">Result</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          placeholder="Node Content"
                          value={newNodeContent}
                          onChange={(e) => setNewNodeContent(e.target.value)}
                        />
                        <Input
                          placeholder="Node Description (optional)"
                          value={newNodeDescription}
                          onChange={(e) => setNewNodeDescription(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleAddNode}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Node
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                  
                  {/* Node Editor */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Node Editor</CardTitle>
                      <CardDescription>
                        {selectedNode ? `Editing: ${selectedNode.content}` : "Select a node to edit"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedNode ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Node ID</Label>
                            <div className="col-span-3">
                              <Input value={selectedNode.id} disabled />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <div className="col-span-3">
                              <Select 
                                value={selectedNode.type}
                                onValueChange={(value: "question" | "decision" | "action" | "result") => {
                                  setAlgorithm({
                                    ...algorithm,
                                    nodes: {
                                      ...algorithm.nodes,
                                      [selectedNode.id]: {
                                        ...selectedNode,
                                        type: value
                                      }
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Node Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="question">Question</SelectItem>
                                  <SelectItem value="decision">Decision</SelectItem>
                                  <SelectItem value="action">Action</SelectItem>
                                  <SelectItem value="result">Result</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Content</Label>
                            <div className="col-span-3">
                              <Input 
                                value={selectedNode.content}
                                onChange={(e) => {
                                  setAlgorithm({
                                    ...algorithm,
                                    nodes: {
                                      ...algorithm.nodes,
                                      [selectedNode.id]: {
                                        ...selectedNode,
                                        content: e.target.value
                                      }
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <div className="col-span-3">
                              <Textarea 
                                value={selectedNode.description || ''}
                                onChange={(e) => {
                                  setAlgorithm({
                                    ...algorithm,
                                    nodes: {
                                      ...algorithm.nodes,
                                      [selectedNode.id]: {
                                        ...selectedNode,
                                        description: e.target.value
                                      }
                                    }
                                  });
                                }}
                                rows={2}
                              />
                            </div>
                          </div>
                          
                          {/* Branches */}
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">Branches</h3>
                            <div className="space-y-4">
                              {(selectedNode.branches || []).map((branch, index) => (
                                <Card key={index}>
                                  <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">Branch {index + 1}</CardTitle>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          const updatedBranches = [...(selectedNode.branches || [])];
                                          updatedBranches.splice(index, 1);
                                          
                                          setAlgorithm({
                                            ...algorithm,
                                            nodes: {
                                              ...algorithm.nodes,
                                              [selectedNode.id]: {
                                                ...selectedNode,
                                                branches: updatedBranches
                                              }
                                            }
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="py-2 space-y-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Label</Label>
                                      <div className="col-span-3">
                                        <Input 
                                          value={branch.label}
                                          onChange={(e) => {
                                            const updatedBranches = [...(selectedNode.branches || [])];
                                            updatedBranches[index] = {
                                              ...branch,
                                              label: e.target.value
                                            };
                                            
                                            setAlgorithm({
                                              ...algorithm,
                                              nodes: {
                                                ...algorithm.nodes,
                                                [selectedNode.id]: {
                                                  ...selectedNode,
                                                  branches: updatedBranches
                                                }
                                              }
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Condition</Label>
                                      <div className="col-span-3">
                                        <Input 
                                          value={branch.condition}
                                          onChange={(e) => {
                                            const updatedBranches = [...(selectedNode.branches || [])];
                                            updatedBranches[index] = {
                                              ...branch,
                                              condition: e.target.value
                                            };
                                            
                                            setAlgorithm({
                                              ...algorithm,
                                              nodes: {
                                                ...algorithm.nodes,
                                                [selectedNode.id]: {
                                                  ...selectedNode,
                                                  branches: updatedBranches
                                                }
                                              }
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label className="text-right">Next Node</Label>
                                      <div className="col-span-3">
                                        <Select 
                                          value={branch.nextNodeId}
                                          onValueChange={(value) => {
                                            const updatedBranches = [...(selectedNode.branches || [])];
                                            updatedBranches[index] = {
                                              ...branch,
                                              nextNodeId: value
                                            };
                                            
                                            setAlgorithm({
                                              ...algorithm,
                                              nodes: {
                                                ...algorithm.nodes,
                                                [selectedNode.id]: {
                                                  ...selectedNode,
                                                  branches: updatedBranches
                                                }
                                              }
                                            });
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select next node" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Object.values(algorithm.nodes)
                                              .filter(node => node.id !== selectedNode.id)
                                              .map(node => (
                                                <SelectItem key={node.id} value={node.id}>
                                                  {node.content}
                                                </SelectItem>
                                              ))
                                            }
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  const updatedBranches = [...(selectedNode.branches || [])];
                                  updatedBranches.push({
                                    condition: `condition-${updatedBranches.length + 1}`,
                                    evaluator: () => false, // Placeholder function
                                    nextNodeId: Object.keys(algorithm.nodes).find(id => id !== selectedNode.id) || '',
                                    label: `Branch ${updatedBranches.length + 1}`
                                  });
                                  
                                  setAlgorithm({
                                    ...algorithm,
                                    nodes: {
                                      ...algorithm.nodes,
                                      [selectedNode.id]: {
                                        ...selectedNode,
                                        branches: updatedBranches
                                      }
                                    }
                                  });
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Branch
                              </Button>
                            </div>
                          </div>
                          
                          {/* Parameters */}
                          {(selectedNode.type === 'question' || selectedNode.type === 'decision') && (
                            <div className="mt-6">
                              <h3 className="text-lg font-medium mb-2">Parameters</h3>
                              <div className="space-y-4">
                                {(selectedNode.parameters || []).map((param, index) => (
                                  <Card key={index}>
                                    <CardHeader className="py-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{param.name}</CardTitle>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                          onClick={() => {
                                            const updatedParams = [...(selectedNode.parameters || [])];
                                            updatedParams.splice(index, 1);
                                            
                                            setAlgorithm({
                                              ...algorithm,
                                              nodes: {
                                                ...algorithm.nodes,
                                                [selectedNode.id]: {
                                                  ...selectedNode,
                                                  parameters: updatedParams
                                                }
                                              }
                                            });
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="py-2 space-y-4">
                                      {/* Parameter editing fields would go here */}
                                      <div className="text-sm text-muted-foreground">
                                        Parameter editing is simplified in this demo. In a full implementation, 
                                        you would have fields for all parameter properties.
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    const updatedParams = [...(selectedNode.parameters || [])];
                                    updatedParams.push({
                                      id: `param-${updatedParams.length + 1}`,
                                      name: `Parameter ${updatedParams.length + 1}`,
                                      type: 'number',
                                      tooltip: 'Parameter description',
                                      storable: true
                                    });
                                    
                                    setAlgorithm({
                                      ...algorithm,
                                      nodes: {
                                        ...algorithm.nodes,
                                        [selectedNode.id]: {
                                          ...selectedNode,
                                          parameters: updatedParams
                                        }
                                      }
                                    });
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Parameter
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Recommendations (for result nodes) */}
                          {selectedNode.type === 'result' && (
                            <div className="mt-6">
                              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                              <div className="space-y-4">
                                {(selectedNode.recommendations || []).map((rec, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input 
                                      value={rec}
                                      onChange={(e) => {
                                        const updatedRecs = [...(selectedNode.recommendations || [])];
                                        updatedRecs[index] = e.target.value;
                                        
                                        setAlgorithm({
                                          ...algorithm,
                                          nodes: {
                                            ...algorithm.nodes,
                                            [selectedNode.id]: {
                                              ...selectedNode,
                                              recommendations: updatedRecs
                                            }
                                          }
                                        });
                                      }}
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-10 w-10 p-0 text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        const updatedRecs = [...(selectedNode.recommendations || [])];
                                        updatedRecs.splice(index, 1);
                                        
                                        setAlgorithm({
                                          ...algorithm,
                                          nodes: {
                                            ...algorithm.nodes,
                                            [selectedNode.id]: {
                                              ...selectedNode,
                                              recommendations: updatedRecs
                                            }
                                          }
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    const updatedRecs = [...(selectedNode.recommendations || [])];
                                    updatedRecs.push('New recommendation');
                                    
                                    setAlgorithm({
                                      ...algorithm,
                                      nodes: {
                                        ...algorithm.nodes,
                                        [selectedNode.id]: {
                                          ...selectedNode,
                                          recommendations: updatedRecs
                                        }
                                      }
                                    });
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Recommendation
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Select a node from the list to edit its properties
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Parameters Tab */}
              <TabsContent value="parameters" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Required Parameters</CardTitle>
                    <CardDescription>
                      Parameters that are required at the start of the algorithm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {algorithm.preparationInfo.requiredParameters.map((paramId) => (
                        <div key={paramId} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{paramId}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveRequiredParameter(paramId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {algorithm.preparationInfo.requiredParameters.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No required parameters defined yet
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Parameter ID"
                        id="new-required-param"
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('new-required-param') as HTMLInputElement;
                          if (input && input.value) {
                            handleAddRequiredParameter(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Parameters</CardTitle>
                    <CardDescription>
                      Parameters that might be needed later in the algorithm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {algorithm.preparationInfo.potentialParameters.map((paramId) => (
                        <div key={paramId} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{paramId}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemovePotentialParameter(paramId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {algorithm.preparationInfo.potentialParameters.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No potential parameters defined yet
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Parameter ID"
                        id="new-potential-param"
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('new-potential-param') as HTMLInputElement;
                          if (input && input.value) {
                            handleAddPotentialParameter(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
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
                      Add medical literature references for this algorithm
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScrollArea className="h-[300px] pr-4">
                      {algorithm.references.map((reference, index) => (
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
            <DialogTitle>Algorithm Preview</DialogTitle>
            <DialogDescription>
              This is how your algorithm will appear to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[600px] overflow-auto border rounded-md p-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{algorithm.name}</h2>
              <p className="text-muted-foreground">{algorithm.description}</p>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Required Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {algorithm.preparationInfo.requiredParameters.map((paramId) => (
                    <li key={paramId}>{paramId}</li>
                  ))}
                </ul>
                
                {algorithm.preparationInfo.potentialParameters.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mt-4 mb-2">You May Also Need</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {algorithm.preparationInfo.potentialParameters.map((paramId) => (
                        <li key={paramId}>{paramId}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">Algorithm Flow</h3>
                <div className="space-y-4">
                  {Object.values(algorithm.nodes).map((node) => (
                    <div key={node.id} className="p-3 border rounded-md">
                      <div className="font-medium">{node.content}</div>
                      {node.description && (
                        <div className="text-sm text-muted-foreground mt-1">{node.description}</div>
                      )}
                      {node.branches && node.branches.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium">Branches:</div>
                          <ul className="list-disc pl-5 text-sm">
                            {node.branches.map((branch, index) => (
                              <li key={index}>
                                {branch.label} → {algorithm.nodes[branch.nextNodeId]?.content || branch.nextNodeId}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {algorithm.references.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">References</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {algorithm.references.map((reference, index) => (
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

export default function AlgorithmEditorPage() {
  return <ProtectedRoute Component={AlgorithmEditor} />;
}