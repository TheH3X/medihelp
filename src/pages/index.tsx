import { calculators } from "@/lib/calculator-definitions";
import { algorithms } from "@/lib/algorithm-definitions";
import { Header } from "@/components/layout/Header";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { AlgorithmCard } from "@/components/algorithms/AlgorithmCard";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParameterStore } from "@/lib/parameter-store";
import { Calculator, GitBranch, History, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "calculators" | "algorithms">("dashboard");
  const { parameters } = useParameterStore();
  
  // Mock recently used calculators - in a real app, this would be stored in localStorage or a database
  const [recentCalculators, setRecentCalculators] = useState<string[]>([]);
  const [favoriteCalculators, setFavoriteCalculators] = useState<string[]>([]);
  
  // Initialize with some recent calculators for demo purposes
  useEffect(() => {
    // In a real app, this would be loaded from localStorage or a database
    setRecentCalculators(['has-bled', 'cha2ds2-vasc']);
    setFavoriteCalculators(['has-bled', 'fib-4']);
  }, []);
  
  // Get calculator objects from IDs
  const getCalculatorsByIds = (ids: string[]) => {
    return calculators.filter(calc => ids.includes(calc.id));
  };
  
  const recentCalcs = getCalculatorsByIds(recentCalculators);
  const favoriteCalcs = getCalculatorsByIds(favoriteCalculators);
  
  // Group calculators by category
  const calculatorsByCategory = calculators.reduce((acc, calculator) => {
    if (!acc[calculator.category]) {
      acc[calculator.category] = [];
    }
    acc[calculator.category].push(calculator);
    return acc;
  }, {} as Record<string, typeof calculators>);
  
  // Group algorithms by category
  const algorithmsByCategory = algorithms.reduce((acc, algorithm) => {
    if (!acc[algorithm.category]) {
      acc[algorithm.category] = [];
    }
    acc[algorithm.category].push(algorithm);
    return acc;
  }, {} as Record<string, typeof algorithms>);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex">
        {/* Sidebar for stored parameters */}
        <aside className="hidden md:block w-64 border-r p-4 bg-muted/30">
          <StoredParametersList />
        </aside>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Clinical Decision Support</h1>
            <p className="text-muted-foreground mb-6">
              Tools to assist with clinical decision making
            </p>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="mb-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="calculators">Calculators</TabsTrigger>
                <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Stored Parameters Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Stored Parameters</CardTitle>
                      <CardDescription>
                        Currently stored patient parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {parameters.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {parameters.slice(0, 6).map((param) => (
                            <div key={param.id} className="flex justify-between p-2 border rounded-md">
                              <span className="font-medium">{param.name}:</span>
                              <span>
                                {typeof param.value === 'boolean' 
                                  ? (param.value ? 'Yes' : 'No') 
                                  : param.value}
                                {param.unit ? ` ${param.unit}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No parameters stored yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Recent Calculators */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Recent Calculators
                      </CardTitle>
                      <CardDescription>
                        Calculators you've recently used
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentCalcs.length > 0 ? (
                        <div className="space-y-2">
                          {recentCalcs.map((calc) => (
                            <Link 
                              key={calc.id} 
                              to={`/calculator/${calc.id}`}
                              className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-primary" />
                                <span>{calc.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{calc.category}</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No recent calculators
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Featured Calculators */}
                <h2 className="text-xl font-semibold mb-4">Featured Calculators</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {calculators.slice(0, 3).map((calculator) => (
                    <CalculatorCard key={calculator.id} calculator={calculator} />
                  ))}
                </div>
                
                {/* Featured Algorithms */}
                <h2 className="text-xl font-semibold mb-4">Featured Algorithms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {algorithms.slice(0, 2).map((algorithm) => (
                    <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="calculators">
                <h2 className="text-xl font-semibold mb-4">Calculators by Category</h2>
                <div className="space-y-8">
                  {Object.entries(calculatorsByCategory).map(([category, categoryCalculators]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryCalculators.map((calculator) => (
                          <CalculatorCard key={calculator.id} calculator={calculator} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="algorithms">
                <h2 className="text-xl font-semibold mb-4">Algorithms by Category</h2>
                <div className="space-y-8">
                  {Object.entries(algorithmsByCategory).map(([category, categoryAlgorithms]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryAlgorithms.map((algorithm) => (
                          <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;