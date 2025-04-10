import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmFlowchartProps {
  algorithm: AlgorithmDefinition;
  path: string[];
}

export function AlgorithmFlowchart({ algorithm, path }: AlgorithmFlowchartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Reset canvas styles
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    
    // Draw the flowchart
    drawFlowchart(ctx, algorithm, path);
  }, [algorithm, path]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Flowchart</CardTitle>
        <CardDescription>
          Visual representation of the algorithm with your path highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[500px] relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for drawing
function drawFlowchart(
  ctx: CanvasRenderingContext2D, 
  algorithm: AlgorithmDefinition,
  path: string[]
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  
  // Create a map of node positions
  const nodePositions = calculateNodePositions(algorithm, width, height);
  
  // Draw connections between nodes
  drawConnections(ctx, algorithm, nodePositions, path);
  
  // Draw nodes
  drawNodes(ctx, algorithm, nodePositions, path);
}

function calculateNodePositions(
  algorithm: AlgorithmDefinition,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const nodes = algorithm.nodes;
  
  // Create a graph representation
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  // Initialize
  Object.keys(nodes).forEach(nodeId => {
    graph[nodeId] = [];
    inDegree[nodeId] = 0;
  });
  
  // Build the graph
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    if (node.branches) {
      node.branches.forEach(branch => {
        graph[nodeId].push(branch.nextNodeId);
        inDegree[branch.nextNodeId] = (inDegree[branch.nextNodeId] || 0) + 1;
      });
    }
  });
  
  // Find all roots (nodes with no incoming edges)
  const roots = Object.keys(nodes).filter(nodeId => inDegree[nodeId] === 0);
  
  // Perform a topological sort to get levels
  const levels: string[][] = [];
  let current = [...roots];
  
  while (current.length > 0) {
    levels.push([...current]);
    const next: string[] = [];
    
    current.forEach(nodeId => {
      graph[nodeId].forEach(childId => {
        inDegree[childId]--;
        if (inDegree[childId] === 0) {
          next.push(childId);
        }
      });
    });
    
    current = next;
  }
  
  // Position nodes by level
  const levelHeight = height / (levels.length + 1);
  
  levels.forEach((level, levelIndex) => {
    const levelWidth = width / (level.length + 1);
    
    level.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: levelWidth * (nodeIndex + 1),
        y: levelHeight * (levelIndex + 1)
      };
    });
  });
  
  return positions;
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  algorithm: AlgorithmDefinition,
  positions: Record<string, { x: number, y: number }>,
  path: string[]
) {
  const nodes = algorithm.nodes;
  
  // Draw connections
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    const nodePos = positions[nodeId];
    
    if (node.branches) {
      node.branches.forEach(branch => {
        const targetPos = positions[branch.nextNodeId];
        
        // Check if this connection is part of the path
        const isInPath = path.includes(nodeId) && path.includes(branch.nextNodeId) &&
                         path.indexOf(branch.nextNodeId) === path.indexOf(nodeId) + 1;
        
        // Draw the connection
        drawArrow(
          ctx,
          nodePos.x,
          nodePos.y + 25, // Bottom of the node
          targetPos.x,
          targetPos.y - 25, // Top of the target node
          branch.label,
          isInPath
        );
      });
    }
  });
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  algorithm: AlgorithmDefinition,
  positions: Record<string, { x: number, y: number }>,
  path: string[]
) {
  const nodes = algorithm.nodes;
  
  // Draw nodes
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    const pos = positions[nodeId];
    
    // Check if this node is in the path
    const isInPath = path.includes(nodeId);
    
    // Determine node color based on type
    let color = '#e2e8f0'; // Default color
    
    if (node.type === 'question') {
      color = '#e2e8f0'; // Light gray for questions
    } else if (node.type === 'decision') {
      color = '#dbeafe'; // Light blue for decisions
    } else if (node.type === 'action') {
      color = '#dcfce7'; // Light green for actions
    } else if (node.type === 'result') {
      color = '#fef9c3'; // Light yellow for results
    }
    
    // Draw the node
    drawBox(
      ctx,
      pos.x - 60,
      pos.y - 25,
      120,
      50,
      node.content,
      isInPath,
      color
    );
  });
}

function drawBox(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  text: string, 
  isHighlighted: boolean = false,
  color: string = '#e2e8f0'
) {
  const radius = 6;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  
  // Fill
  ctx.fillStyle = isHighlighted ? '#f59e0b' : color;
  ctx.fill();
  
  // Border
  ctx.strokeStyle = isHighlighted ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isHighlighted ? 2 : 1;
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle multiline text
  const words = text.split(' ');
  let line = '';
  const lines = [];
  const maxWidth = width - 10;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Limit to 2 lines and add ellipsis if needed
  if (lines.length > 2) {
    lines[1] = lines[1].substring(0, lines[1].length - 3) + '...';
    lines.splice(2);
  }
  
  const lineHeight = 16;
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, x + width / 2, startY + i * lineHeight);
  });
}

function drawArrow(
  ctx: CanvasRenderingContext2D, 
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number,
  text: string = '',
  isHighlighted: boolean = false
) {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = isHighlighted ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isHighlighted ? 2 : 1;
  ctx.stroke();
  
  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = isHighlighted ? '#d97706' : '#94a3b8';
  ctx.fill();
  
  // Draw text
  if (text) {
    const textX = (fromX + toX) / 2;
    const textY = (fromY + toY) / 2 - 10;
    ctx.fillStyle = isHighlighted ? '#d97706' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, textX, textY);
  }
}