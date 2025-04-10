import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmCardProps {
  algorithm: AlgorithmDefinition;
}

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{algorithm.name}</CardTitle>
        <CardDescription>{algorithm.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {algorithm.category}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/algorithm/${algorithm.id}`} className="w-full">
          <Button className="w-full">
            Use Algorithm
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}