import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { AlgorithmDefinition } from "@/lib/algorithm-definitions";

interface AlgorithmVisualizerProps {
  algorithm: AlgorithmDefinition;
  currentStepId: string;
  pathHistory: string[];
}

export function AlgorithmVisualizer({ algorithm, currentStepId, pathHistory }: AlgorithmVisualizerProps) {
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
    
    // Draw algorithm flowchart
    drawAlgorithmFlowchart(ctx, algorithm, currentStepId, pathHistory);
  }, [algorithm, currentStepId, pathHistory]);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="w-full h-[400px] relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function drawAlgorithmFlowchart(
  ctx: CanvasRenderingContext2D,
  algorithm: AlgorithmDefinition,
  currentStepId: string,
  pathHistory: string[]
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  
  // Calculate positions for steps
  const stepPositions = calculateStepPositions(algorithm, width, height);
  
  // Draw connections between steps
  drawConnections(ctx, algorithm, stepPositions, pathHistory);
  
  // Draw steps
  for (const [stepId, position] of Object.entries(stepPositions)) {
    const step = algorithm.steps[stepId];
    const isResult = !step; // If step doesn't exist, it's a result
    const isCurrentStep = stepId === currentStepId;
    const isInPath = pathHistory.includes(stepId);
    
    if (isResult) {
      // Draw result node
      const result = Object.entries(algorithm.results).find(([resultId]) => resultId === stepId)?.[1];
      if (result) {
        drawResultNode(ctx, position.x, position.y, result.title, isCurrentStep, isInPath);
      }
    } else {
      // Draw step node
      drawStepNode(ctx, position.x, position.y, step.title, isCurrentStep, isInPath);
    }
  }
}

function calculateStepPositions(algorithm: AlgorithmDefinition, width: number, height: number) {
  const positions: Record<string, { x: number, y: number }> = {};
  const stepIds = Object.keys(algorithm.steps);
  const resultIds = Object.keys(algorithm.results);
  
  // Simple layout algorithm - can be improved for more complex flowcharts
  const totalNodes = stepIds.length + resultIds.length;
  const nodeWidth = 120;
  const nodeHeight = 50;
  const horizontalSpacing = width / (Math.min(totalNodes, 5) + 1);
  
  // Position initial step at the top
  positions[algorithm.initialStep] = {
    x: width / 2 - nodeWidth / 2,
    y: 50
  };
  
  // Create a map of step depths (distance from initial step)
  const stepDepths: Record<string, number> = {};
  stepDepths[algorithm.initialStep] = 0;
  
  // Calculate depths for all steps
  let changed = true;
  while (changed) {
    changed = false;
    for (const stepId of stepIds) {
      if (stepDepths[stepId] === undefined) continue;
      
      const step = algorithm.steps[stepId];
      // Mock inputs to get possible next steps
      const possibleNextSteps = getPossibleNextSteps(step);
      
      for (const nextStepId of possibleNextSteps) {
        if (nextStepId === null) continue;
        
        const newDepth = stepDepths[stepId] + 1;
        if (stepDepths[nextStepId] === undefined || newDepth < stepDepths[nextStepId]) {
          stepDepths[nextStepId] = newDepth;
          changed = true;
        }
      }
    }
  }
  
  // Group steps by depth
  const stepsByDepth: Record<number, string[]> = {};
  for (const [stepId, depth] of Object.entries(stepDepths)) {
    if (!stepsByDepth[depth]) stepsByDepth[depth] = [];
    stepsByDepth[depth].push(stepId);
  }
  
  // Add result nodes to the deepest level + 1
  const maxDepth = Math.max(...Object.keys(stepsByDepth).map(Number));
  stepsByDepth[maxDepth + 1] = resultIds;
  
  // Position nodes by depth
  for (const [depthStr, stepsAtDepth] of Object.entries(stepsByDepth)) {
    const depth = Number(depthStr);
    const y = 50 + depth * 100;
    
    for (let i = 0; i < stepsAtDepth.length; i++) {
      const stepId = stepsAtDepth[i];
      if (stepId === algorithm.initialStep) continue; // Skip initial step, already positioned
      
      const x = (i + 1) * horizontalSpacing - nodeWidth / 2;
      positions[stepId] = { x, y };
    }
  }
  
  return positions;
}

function getPossibleNextSteps(step: any): string[] {
  // This is a simplified version - in a real implementation,
  // you would need to analyze the nextStep function to determine possible outputs
  
  // For now, we'll use a mock approach
  const mockInputs = { mockInput: true };
  try {
    const nextStep = step.nextStep(mockInputs);
    return [nextStep].filter(Boolean) as string[];
  } catch (e) {
    // If the function throws (e.g., because it needs specific inputs),
    // return an empty array
    return [];
  }
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  algorithm: AlgorithmDefinition,
  positions: Record<string, { x: number, y: number }>,
  pathHistory: string[]
) {
  const nodeHeight = 50;
  
  for (const [stepId, step] of Object.entries(algorithm.steps)) {
    const fromPosition = positions[stepId];
    if (!fromPosition) continue;
    
    // Get possible next steps
    const possibleNextSteps = getPossibleNextSteps(step);
    
    for (const nextStepId of possibleNextSteps) {
      if (!nextStepId) continue;
      
      const toPosition = positions[nextStepId];
      if (!toPosition) continue;
      
      const isInPath = pathHistory.includes(stepId) && pathHistory.includes(nextStepId) &&
                       pathHistory.indexOf(nextStepId) === pathHistory.indexOf(stepId) + 1;
      
      // Draw arrow from this step to next step
      drawArrow(
        ctx,
        fromPosition.x + 60, // center of node
        fromPosition.y + nodeHeight,
        toPosition.x + 60, // center of node
        toPosition.y,
        '',
        isInPath
      );
    }
  }
}

function drawStepNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  isCurrent: boolean,
  isInPath: boolean
) {
  const width = 120;
  const height = 50;
  
  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + width - 10, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
  ctx.lineTo(x + width, y + height - 10);
  ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
  ctx.lineTo(x + 10, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
  ctx.lineTo(x, y + 10);
  ctx.quadraticCurveTo(x, y, x + 10, y);
  ctx.closePath();
  
  // Fill based on state
  if (isCurrent) {
    ctx.fillStyle = '#f59e0b'; // Amber for current step
  } else if (isInPath) {
    ctx.fillStyle = '#93c5fd'; // Light blue for steps in path
  } else {
    ctx.fillStyle = '#e2e8f0'; // Default gray
  }
  ctx.fill();
  
  // Border
  ctx.strokeStyle = isCurrent ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isCurrent ? 2 : 1;
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Truncate title if too long
  let displayTitle = title;
  if (ctx.measureText(displayTitle).width > width - 10) {
    displayTitle = displayTitle.substring(0, 15) + '...';
  }
  
  ctx.fillText(displayTitle, x + width / 2, y + height / 2);
}

function drawResultNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  title: string,
  isCurrent: boolean,
  isInPath: boolean
) {
  const width = 120;
  const height = 50;
  
  // Draw diamond shape for results
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height / 2);
  ctx.lineTo(x + width / 2, y + height);
  ctx.lineTo(x, y + height / 2);
  ctx.closePath();
  
  // Fill based on state
  if (isCurrent) {
    ctx.fillStyle = '#f59e0b'; // Amber for current step
  } else if (isInPath) {
    ctx.fillStyle = '#93c5fd'; // Light blue for steps in path
  } else {
    ctx.fillStyle = '#fde68a'; // Yellow for results
  }
  ctx.fill();
  
  // Border
  ctx.strokeStyle = isCurrent ? '#d97706' : '#94a3b8';
  ctx.lineWidth = isCurrent ? 2 : 1;
  ctx.stroke();
  
  // Text
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Truncate title if too long
  let displayTitle = title;
  if (ctx.measureText(displayTitle).width > width - 20) {
    displayTitle = displayTitle.substring(0, 12) + '...';
  }
  
  ctx.fillText(displayTitle, x + width / 2, y + height / 2);
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
  ctx.strokeStyle = isHighlighted ? '#2563eb' : '#94a3b8';
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
  ctx.fillStyle = isHighlighted ? '#2563eb' : '#94a3b8';
  ctx.fill();
  
  // Draw text
  if (text) {
    const textX = (fromX + toX) / 2;
    const textY = (fromY + toY) / 2 - 10;
    ctx.fillStyle = isHighlighted ? '#2563eb' : '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, textX, textY);
  }
}