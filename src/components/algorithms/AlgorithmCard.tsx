import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmCardProps {
  algorithm: AlgorithmDefinition;
}

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  // Count the number of nodes to indicate complexity
  const nodeCount = Object.keys(algorithm.nodes).length;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          {algorithm.name}
        </CardTitle>
        <CardDescription>{algorithm.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground space-y-2">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {algorithm.category}
          </span>
          <p className="text-xs">
            Complexity: {nodeCount} steps
          </p>
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