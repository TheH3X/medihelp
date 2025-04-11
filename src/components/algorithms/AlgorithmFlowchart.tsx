import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmFlowchartProps {
  algorithm: AlgorithmDefinition;
  path: string[];
}

export function AlgorithmFlowchart({ algorithm, path }: AlgorithmFlowchartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Process the algorithm to create a visualization-friendly structure
  const { nodes, edges, levels } = processAlgorithm(algorithm, path);
  
  // Update dimensions based on content
  useEffect(() => {
    if (svgRef.current) {
      const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
      const levelCount = levels.length;
      const nodeCount = Object.keys(nodes).length;
      
      setDimensions({
        width: containerWidth,
        height: Math.max(600, levelCount * 150 + 100)
      });
    }
  }, [levels, nodes]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Flowchart</CardTitle>
        <CardDescription>
          Visual representation of the algorithm with your path highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] overflow-auto border rounded-md bg-white dark:bg-gray-900">
          <svg 
            ref={svgRef}
            width={dimensions.width} 
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  fill={path.length > 0 ? "#94a3b8" : "#94a3b8"} 
                />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  fill="#d97706" 
                />
              </marker>
            </defs>
            
            {/* Draw edges first so they appear behind nodes */}
            {edges.map((edge, index) => {
              const isActive = path.includes(edge.source) && 
                              path.includes(edge.target) &&
                              path.indexOf(edge.target) === path.indexOf(edge.source) + 1;
              
              return (
                <g key={`edge-${index}`}>
                  <path
                    d={`M ${edge.sourceX} ${edge.sourceY} 
                        C ${edge.sourceX} ${edge.sourceY + 50}, 
                          ${edge.targetX} ${edge.targetY - 50}, 
                          ${edge.targetX} ${edge.targetY}`}
                    fill="none"
                    stroke={isActive ? "#d97706" : "#94a3b8"}
                    strokeWidth={isActive ? 2 : 1}
                    markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  />
                  {edge.label && (
                    <g transform={`translate(${(edge.sourceX + edge.targetX) / 2}, ${(edge.sourceY + edge.targetY) / 2 - 10})`}>
                      <rect
                        x="-40"
                        y="-10"
                        width="80"
                        height="20"
                        rx="4"
                        fill="white"
                        stroke={isActive ? "#d97706" : "#94a3b8"}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fontSize="12"
                        fill={isActive ? "#d97706" : "#64748b"}
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Draw nodes */}
            {Object.entries(nodes).map(([id, node]) => {
              const isActive = path.includes(id);
              const nodeColor = getNodeColor(node.type, isActive);
              
              return (
                <g key={`node-${id}`} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    x="-75"
                    y="-40"
                    width="150"
                    height="80"
                    rx="8"
                    fill={nodeColor.fill}
                    stroke={nodeColor.stroke}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <foreignObject x="-70" y="-35" width="140" height="70">
                    <div xmlns="http://www.w3.org/1999/xhtml" className="h-full flex items-center justify-center">
                      <p className="text-center text-sm font-medium px-1 overflow-hidden text-ellipsis">
                        {node.content}
                      </p>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to process the algorithm into a visualization-friendly structure
function processAlgorithm(algorithm: AlgorithmDefinition, activePath: string[]) {
  const nodes: Record<string, {
    id: string;
    content: string;
    type: string;
    x: number;
    y: number;
    level: number;
  }> = {};
  
  const edges: Array<{
    source: string;
    target: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    label?: string;
  }> = [];
  
  // Create a graph representation for topological sorting
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize
  Object.entries(algorithm.nodes).forEach(([id, node]) => {
    graph[id] = [];
    inDegree[id] = 0;
  });
  
  // Build the graph
  Object.entries(algorithm.nodes).forEach(([id, node]) => {
    if (node.branches) {
      node.branches.forEach(branch => {
        graph[id].push(branch.nextNodeId);
        inDegree[branch.nextNodeId] = (inDegree[branch.nextNodeId] || 0) + 1;
      });
    }
  });
  
  // Find all roots (nodes with no incoming edges)
  const roots = Object.keys(algorithm.nodes).filter(id => inDegree[id] === 0);
  
  // Perform a topological sort to get levels
  const levels: string[][] = [];
  let current = [...roots];
  
  while (current.length > 0) {
    levels.push([...current]);
    const next: string[] = [];
    
    current.forEach(id => {
      graph[id].forEach(childId => {
        inDegree[childId]--;
        if (inDegree[childId] === 0) {
          next.push(childId);
        }
      });
    });
    
    current = next;
  }
  
  // Position nodes by level
  const nodeWidth = 150;
  const nodeHeight = 80;
  const levelHeight = 150;
  const horizontalPadding = 50;
  
  levels.forEach((level, levelIndex) => {
    const levelWidth = level.length * nodeWidth + (level.length - 1) * horizontalPadding;
    const startX = levelWidth < 800 ? (800 - levelWidth) / 2 : horizontalPadding;
    
    level.forEach((id, nodeIndex) => {
      const node = algorithm.nodes[id];
      const x = startX + nodeIndex * (nodeWidth + horizontalPadding) + nodeWidth / 2;
      const y = levelHeight * (levelIndex + 1);
      
      nodes[id] = {
        id,
        content: node.content,
        type: node.type,
        x,
        y,
        level: levelIndex
      };
    });
  });
  
  // Create edges
  Object.entries(algorithm.nodes).forEach(([id, node]) => {
    if (node.branches) {
      node.branches.forEach(branch => {
        const sourceNode = nodes[id];
        const targetNode = nodes[branch.nextNodeId];
        
        if (sourceNode && targetNode) {
          edges.push({
            source: id,
            target: branch.nextNodeId,
            sourceX: sourceNode.x,
            sourceY: sourceNode.y + nodeHeight / 2,
            targetX: targetNode.x,
            targetY: targetNode.y - nodeHeight / 2,
            label: branch.label
          });
        }
      });
    }
  });
  
  return { nodes, edges, levels };
}

// Helper function to get node color based on type and active state
function getNodeColor(type: string, isActive: boolean) {
  if (isActive) {
    return {
      fill: "#fef3c7", // amber-100
      stroke: "#d97706"  // amber-600
    };
  }
  
  switch (type) {
    case 'question':
      return {
        fill: "#e2e8f0", // slate-200
        stroke: "#94a3b8"  // slate-400
      };
    case 'decision':
      return {
        fill: "#dbeafe", // blue-100
        stroke: "#60a5fa"  // blue-400
      };
    case 'action':
      return {
        fill: "#dcfce7", // green-100
        stroke: "#4ade80"  // green-400
      };
    case 'result':
      return {
        fill: "#fef9c3", // yellow-100
        stroke: "#facc15"  // yellow-400
      };
    default:
      return {
        fill: "#e2e8f0", // slate-200
        stroke: "#94a3b8"  // slate-400
      };
  }
}