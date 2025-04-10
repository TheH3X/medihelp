import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CalculatorDefinition } from "@/lib/calculator-definitions";

interface CalculatorCardProps {
  calculator: CalculatorDefinition;
}

export function CalculatorCard({ calculator }: CalculatorCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{calculator.name}</CardTitle>
        <CardDescription>{calculator.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {calculator.category}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/calculator/${calculator.id}`} className="w-full">
          <Button className="w-full">
            Use Calculator
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}