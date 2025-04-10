import { calculators } from "@/lib/calculator-definitions";
import { Header } from "@/components/layout/Header";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { StoredParametersList } from "@/components/parameters/StoredParametersList";

const Index = () => {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculators.map((calculator) => (
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