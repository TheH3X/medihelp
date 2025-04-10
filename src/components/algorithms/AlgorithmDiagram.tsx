import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { CalculationResult } from "@/lib/calculator-definitions";

interface AlgorithmDiagramProps {
  calculatorId: string;
  result: CalculationResult;
  inputs: Record<string, any>;
}

export function AlgorithmDiagram({ calculatorId, result, inputs }: AlgorithmDiagramProps) {
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
    
    // Draw algorithm based on calculator type
    switch (calculatorId) {
      case 'has-bled':
        drawHasbledAlgorithm(ctx, result, inputs);
        break;
      case 'cha2ds2-vasc':
        drawCha2ds2vascAlgorithm(ctx, result, inputs);
        break;
      default:
        drawGenericAlgorithm(ctx, result);
    }
  }, [calculatorId, result, inputs]);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="w-full h-[300px] relative">
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
  const lines = text.split('\\\n');
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

// Algorithm drawing functions
function drawHasbledAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 120;
  const boxHeight = 50;
  
  // Calculate score from inputs
  let score = 0;
  if (inputs.hypertension) score += 1;
  if (inputs.renalDisease) score += 1;
  if (inputs.liverDisease) score += 1;
  if (inputs.strokeHistory) score += 1;
  if (inputs.bleedingHistory) score += 1;
  if (inputs.age > 65) score += 1;
  if (inputs.medications) score += 1;
  if (inputs.alcohol) score += 1;
  if (inputs.labilePTINR) score += 1;
  
  // Draw start box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'HAS-BLED\\nScore Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight, 
    `Score: ${score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Draw risk categories
  const isLowRisk = score <= 1;
  const isIntermediateRisk = score === 2 || score === 3;
  const isHighRisk = score >= 4;
  
  // Draw low risk box
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Low Risk\\n(0-1)',
    isLowRisk,
    isLowRisk ? '#dcfce7' : '#e2e8f0'
  );
  
  // Draw intermediate risk box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Intermediate Risk\\n(2-3)',
    isIntermediateRisk,
    isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'High Risk\\n(≥4)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories
  drawArrow(ctx, width/2 - 40, 150, width/4, 200, 'Score ≤ 1', isLowRisk);
  drawArrow(ctx, width/2, 150, width/2, 200, 'Score 2-3', isIntermediateRisk);
  drawArrow(ctx, width/2 + 40, 150, 3*width/4, 200, 'Score ≥ 4', isHighRisk);
}

function drawCha2ds2vascAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 120;
  const boxHeight = 50;
  
  // Calculate score from inputs
  let score = 0;
  if (inputs.congestiveHeartFailure) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.age >= 75) score += 2;
  else if (inputs.age >= 65) score += 1;
  if (inputs.diabetes) score += 1;
  if (inputs.stroke) score += 2;
  if (inputs.vascularDisease) score += 1;
  if (inputs.gender === 'female') score += 1;
  
  // Draw start box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'CHA₂DS₂-VASc\\nScore Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight, 
    `Score: ${score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Draw risk categories
  const isLowRisk = score === 0;
  const isLowModerateRisk = score === 1;
  const isHighRisk = score >= 2;
  
  // Draw low risk box
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Low Risk\\n(0)',
    isLowRisk,
    isLowRisk ? '#dcfce7' : '#e2e8f0'
  );
  
  // Draw low-moderate risk box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Low-Moderate Risk\\n(1)',
    isLowModerateRisk,
    isLowModerateRisk ? '#fef9c3' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Moderate-High Risk\\n(≥2)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories
  drawArrow(ctx, width/2 - 40, 150, width/4, 200, 'Score = 0', isLowRisk);
  drawArrow(ctx, width/2, 150, width/2, 200, 'Score = 1', isLowModerateRisk);
  drawArrow(ctx, width/2 + 40, 150, 3*width/4, 200, 'Score ≥ 2', isHighRisk);
}

function drawGenericAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 120;
  const boxHeight = 50;
  
  // Draw start box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'Score Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight, 
    `Score: ${result.score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Draw interpretation box
  drawBox(
    ctx, 
    width/2 - boxWidth*1.5/2, 
    180, 
    boxWidth*1.5, 
    boxHeight, 
    result.interpretation,
    true,
    result.severity === 'low' ? '#dcfce7' : 
    result.severity === 'moderate' ? '#fef9c3' : 
    '#fee2e2'
  );
  
  // Draw arrow from score to interpretation
  drawArrow(ctx, width/2, 150, width/2, 180, '', true);
}