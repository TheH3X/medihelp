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
        <div className="w-full h-[600px] relative"> {/* Increased height from 500px to 600px */}
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
  
  // Position nodes by level with increased vertical spacing
  const levelHeight = height / (levels.length + 1) * 0.9; // Use 90% of available height
  
  levels.forEach((level, levelIndex) => {
    // Increase horizontal spacing between nodes
    const nodeWidth = 140; // Increased from 120
    const horizontalSpacing = 60; // Space between nodes
    const totalWidth = level.length * nodeWidth + (level.length - 1) * horizontalSpacing;
    const startX = (width - totalWidth) / 2;
    
    level.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: startX + nodeIndex * (nodeWidth + horizontalSpacing) + nodeWidth / 2,
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
    
    if (!nodePos) return; // Skip if position is not defined
    
    if (node.branches) {
      // Calculate horizontal offsets for multiple branches
      const branchCount = node.branches.length;
      const branchSpacing = 30; // Pixels between branch starting points
      const totalWidth = (branchCount - 1) * branchSpacing;
      const startOffset = -totalWidth / 2;
      
      node.branches.forEach((branch, index) => {
        const targetPos = positions[branch.nextNodeId];
        if (!targetPos) return; // Skip if target position is not defined
        
        // Calculate offset for this branch
        const offset = startOffset + index * branchSpacing;
        
        // Check if this connection is part of the path
        const isInPath = path.includes(nodeId) && path.includes(branch.nextNodeId) &&
                         path.indexOf(branch.nextNodeId) === path.indexOf(nodeId) + 1;
        
        // Draw the connection with elbow connector
        drawElbowConnector(
          ctx,
          nodePos.x + offset, // Add offset to starting x position
          nodePos.y + 30, // Bottom of the node
          targetPos.x,
          targetPos.y - 30, // Top of the target node
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
    
    // Draw the node with increased width
    drawBox(
      ctx,
      pos.x - 70, // Increased width from 60 to 70
      pos.y - 30, // Increased height from 25 to 30
      140, // Increased width from 120 to 140
      60, // Increased height from 50 to 60
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
  
  // Handle multiline text with word wrapping
  const words = text.split(' ');
  let line = '';
  const lines = [];
  const maxWidth = width - 16; // Reduced padding for more text space
  
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
  
  // Limit to 3 lines and add ellipsis if needed
  if (lines.length > 3) {
    lines[2] = lines[2].substring(0, lines[2].length - 4) + '...';
    lines.splice(3);
  }
  
  const lineHeight = 16;
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), x + width / 2, startY + i * lineHeight);
  });
}

// Function to draw elbow connectors with increased height
function drawElbowConnector(
  ctx: CanvasRenderingContext2D, 
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number,
  text: string = '',
  isHighlighted: boolean = false
) {
  // Calculate the midpoint Y position with increased height
  // Use 70% of the vertical distance instead of 50% to make the elbow higher
  const midY = fromY + (toY - fromY) * 0.7;
  
  // Draw the elbow connector (three segments)
  ctx.beginPath();
  ctx.moveTo(fromX, fromY); // Start point
  ctx.lineTo(fromX, midY); // Vertical line from start
  ctx.lineTo(toX, midY);   // Horizontal line
  ctx.lineTo(toX, toY);    // Vertical line to end
  
  ctx.strokeStyle = isHighlighted ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isHighlighted ? 2 : 1;
  ctx.stroke();
  
  // Draw arrowhead at the end
  const headLength = 10;
  const angle = Math.PI / 2; // Pointing down
  
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
  
  // Draw text near the horizontal segment with better positioning
  if (text) {
    ctx.fillStyle = isHighlighted ? '#d97706' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    // Create a background for the text to improve readability
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width + 8;
    const textHeight = 16;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      (fromX + toX) / 2 - textWidth / 2,
      midY - textHeight - 4,
      textWidth,
      textHeight
    );
    
    // Draw the text
    ctx.fillStyle = isHighlighted ? '#d97706' : '#64748b';
    ctx.fillText(text, (fromX + toX) / 2, midY - 10);
  }
}