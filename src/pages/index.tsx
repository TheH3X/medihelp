import { calculators } from "@/lib/calculator-definitions";
import { Header } from "@/components/layout/Header";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  // Find the combined CV risk calculator to feature it
  const combinedCVRiskCalculator = calculators.find(calc => calc.id === 'combined-cv-risk');
  
  // Filter out the featured calculator from the regular list
  const regularCalculators = calculators.filter(calc => calc.id !== 'combined-cv-risk');
  
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
            <h1 className="text-3xl font-bold mb-2">Clinical Calculators</h1>
            <p className="text-muted-foreground mb-8">
              Select a calculator to assess your patient
            </p>
            
            {/* Featured calculator */}
            {combinedCVRiskCalculator && (
              <div className="mb-10 bg-primary/5 p-6 rounded-lg border">
                <h2 className="text-2xl font-bold mb-2">Featured Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold">{combinedCVRiskCalculator.name}</h3>
                    <p className="text-muted-foreground mb-4">{combinedCVRiskCalculator.description}</p>
                    <p className="mb-4">
                      This integrated calculator combines CV risk assessment with Framingham risk scoring when needed,
                      and provides treatment recommendations based on risk category and LDL levels.
                    </p>
                    <Link to={`/calculator/${combinedCVRiskCalculator.id}`}>
                      <Button size="lg">
                        Use Combined CV Risk Calculator
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary">CV</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-semibold mb-4">All Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularCalculators.map((calculator) => (
                <CalculatorCard key={calculator.id} calculator={calculator} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;