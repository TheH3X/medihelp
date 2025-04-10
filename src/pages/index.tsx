import { calculators } from "@/lib/calculator-definitions";
import { algorithms } from "@/lib/algorithm-definitions";
import { Header } from "@/components/layout/Header";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { AlgorithmCard } from "@/components/algorithms/AlgorithmCard";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"calculators" | "algorithms">("calculators");

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
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calculators" | "algorithms")}>
              <TabsList className="mb-6">
                <TabsTrigger value="calculators">Calculators</TabsTrigger>
                <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calculators">
                <h2 className="text-xl font-semibold mb-4">Available Calculators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {calculators.map((calculator) => (
                    <CalculatorCard key={calculator.id} calculator={calculator} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="algorithms">
                <h2 className="text-xl font-semibold mb-4">Clinical Algorithms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {algorithms.map((algorithm) => (
                    <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
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