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
        <div className="w-full h-[600px] relative">
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
  
  // Step 1: Create a directed graph representation
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
  
  // Step 2: Perform topological sort to get levels
  const levels: string[][] = [];
  let current = Object.keys(nodes).filter(nodeId => inDegree[nodeId] === 0);
  
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
  
  // Step 3: Position nodes by level
  const nodeWidth = 180;
  const nodeHeight = 80;
  const horizontalSpacing = 60;
  const verticalSpacing = 100;
  
  levels.forEach((level, levelIndex) => {
    // Calculate total width needed for this level
    const levelWidth = level.length * nodeWidth + (level.length - 1) * horizontalSpacing;
    const startX = (width - levelWidth) / 2;
    
    // Position each node in the level
    level.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: startX + nodeIndex * (nodeWidth + horizontalSpacing) + nodeWidth / 2,
        y: 50 + levelIndex * (nodeHeight + verticalSpacing) + nodeHeight / 2
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
    
    if (!nodePos) return; // Skip if position is not defined
    
    if (node.branches) {
      // Calculate branch spacing based on number of branches
      const branchCount = node.branches.length;
      const totalWidth = 120; // Maximum width for all branches
      const branchSpacing = branchCount > 1 ? totalWidth / (branchCount - 1) : 0;
      const startOffset = -totalWidth / 2;
      
      node.branches.forEach((branch, index) => {
        const targetPos = positions[branch.nextNodeId];
        if (!targetPos) return; // Skip if target position is not defined
        
        // Calculate offset for this branch
        const offset = branchCount > 1 ? startOffset + index * branchSpacing : 0;
        
        // Check if this connection is part of the path
        const isInPath = path.includes(nodeId) && path.includes(branch.nextNodeId) &&
                         path.indexOf(branch.nextNodeId) === path.indexOf(nodeId) + 1;
        
        // Draw the connection
        drawConnection(
          ctx,
          nodePos.x + offset, // Add offset to starting x position
          nodePos.y + 40, // Bottom of the node
          targetPos.x,
          targetPos.y - 40, // Top of the target node
          branch.label,
          isInPath
        );
      });
    }
  });
}

function drawConnection(
  ctx: CanvasRenderingContext2D, 
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number,
  text: string = '',
  isHighlighted: boolean = false
) {
  // Calculate control points for a smooth curve
  const midY = fromY + (toY - fromY) * 0.5;
  
  // Draw the path
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  
  // Use a bezier curve for smoother connections
  ctx.bezierCurveTo(
    fromX, midY, // First control point
    toX, midY,   // Second control point
    toX, toY     // End point
  );
  
  // Set line style
  ctx.strokeStyle = isHighlighted ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isHighlighted ? 2 : 1;
  ctx.stroke();
  
  // Draw arrowhead
  const headLength = 10;
  const angle = Math.atan2(toY - midY, toX - fromX);
  
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
  
  // Draw text if provided
  if (text) {
    // Create a background for the text
    const textMetrics = ctx.measureText(text);
    const padding = 4;
    const textWidth = textMetrics.width + padding * 2;
    const textHeight = 20;
    
    // Position text near the middle of the curve
    const textX = (fromX + toX) / 2;
    const textY = midY - 15;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      textX - textWidth / 2,
      textY - textHeight / 2,
      textWidth,
      textHeight
    );
    
    // Draw the text
    ctx.fillStyle = isHighlighted ? '#d97706' : '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, textX, textY);
  }
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
    
    if (!pos) return; // Skip if position is not defined
    
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
      pos.x - 90, // Width = 180
      pos.y - 40, // Height = 80
      180,
      80,
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
  const radius = 8;
  
  // Draw rounded rectangle
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
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle multiline text with word wrapping
  const maxWidth = width - 20;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  
  lines.push(line);
  
  // Limit to 4 lines and add ellipsis if needed
  if (lines.length > 4) {
    lines[3] = lines[3].substring(0, lines[3].length - 4) + '...';
    lines.splice(4);
  }
  
  const lineHeight = 18;
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), x + width / 2, startY + i * lineHeight);
  });
}