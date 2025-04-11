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
      case 'fib-4':
        drawFib4Algorithm(ctx, result, inputs);
        break;
      case 'das28':
        drawDas28Algorithm(ctx, result, inputs);
        break;
      default:
        drawGenericAlgorithm(ctx, result);
    }
  }, [calculatorId, result, inputs]);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="w-full h-[350px] relative"> {/* Increased height from 300px to 350px */}
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
  const lines = text.split('\\\\\\\\\n');
  const lineHeight = 16;
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, x + width / 2, startY + i * lineHeight);
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
  
  // Draw text near the horizontal segment with background
  if (text) {
    // Create a background for the text
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
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, (fromX + toX) / 2, midY - 10);
  }
}

// HAS-BLED Algorithm Drawing
function drawHasbledAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 130; // Increased from 120
  const boxHeight = 60; // Increased from 50
  
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
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'HAS-BLED\\\\\\\\\nScore Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    110, // Increased spacing
    boxWidth, 
    boxHeight, 
    `Score: ${score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawElbowConnector(ctx, width/2, 80, width/2, 110, '', true);
  
  // Draw risk categories
  const isLowRisk = score <= 1;
  const isIntermediateRisk = score === 2 || score === 3;
  const isHighRisk = score >= 4;
  
  // Draw low risk box
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Low Risk\\\\\\\\\n(0-1)',
    isLowRisk,
    isLowRisk ? '#dcfce7' : '#e2e8f0'
  );
  
  // Draw intermediate risk box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Intermediate Risk\\\\\\\\\n(2-3)',
    isIntermediateRisk,
    isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'High Risk\\\\\\\\\n(≥4)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories with more spacing
  drawElbowConnector(ctx, width/2 - 40, 170, width/4, 220, 'Score ≤ 1', isLowRisk);
  drawElbowConnector(ctx, width/2, 170, width/2, 220, 'Score 2-3', isIntermediateRisk);
  drawElbowConnector(ctx, width/2 + 40, 170, 3*width/4, 220, 'Score ≥ 4', isHighRisk);
}

function drawCha2ds2vascAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 130; // Increased from 120
  const boxHeight = 60; // Increased from 50
  
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
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'CHA₂DS₂-VASc\\\\\\\\\nScore Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    110, // Increased spacing
    boxWidth, 
    boxHeight, 
    `Score: ${score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawElbowConnector(ctx, width/2, 80, width/2, 110, '', true);
  
  // Draw risk categories
  const isLowRisk = score === 0;
  const isLowModerateRisk = score === 1;
  const isHighRisk = score >= 2;
  
  // Draw low risk box
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Low Risk\\\\\\\\\n(0)',
    isLowRisk,
    isLowRisk ? '#dcfce7' : '#e2e8f0'
  );
  
  // Draw low-moderate risk box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Low-Moderate Risk\\\\\\\\\n(1)',
    isLowModerateRisk,
    isLowModerateRisk ? '#fef9c3' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Moderate-High Risk\\\\\\\\\n(≥2)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories with more spacing
  drawElbowConnector(ctx, width/2 - 40, 170, width/4, 220, 'Score = 0', isLowRisk);
  drawElbowConnector(ctx, width/2, 170, width/2, 220, 'Score = 1', isLowModerateRisk);
  drawElbowConnector(ctx, width/2 + 40, 170, 3*width/4, 220, 'Score ≥ 2', isHighRisk);
}

function drawFib4Algorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140; // Increased from 120
  const boxHeight = 60; // Increased from 50
  
  // Calculate FIB-4 score
  const fib4Score = (inputs.age * inputs.ast) / (inputs.platelets * Math.sqrt(inputs.alt));
  const roundedScore = parseFloat(fib4Score.toFixed(2));
  
  // Draw formula box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'FIB-4 = (Age × AST) /\\\\\\\\\n(Platelets × √ALT)');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    110, // Increased spacing
    boxWidth, 
    boxHeight, 
    `Score: ${roundedScore}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from formula to score
  drawElbowConnector(ctx, width/2, 80, width/2, 110, '', true);
  
  // Age-specific thresholds
  const isUnder65 = inputs.age < 65;
  
  if (isUnder65) {
    // For patients < 65 years
    const isLowRisk = fib4Score < 1.30;
    const isIntermediateRisk = fib4Score >= 1.30 && fib4Score <= 2.67;
    const isHighRisk = fib4Score > 2.67;
    
    // Draw age decision box
    drawBox(ctx, width/2 - boxWidth/2, 190, boxWidth, boxHeight, 'Age < 65 years', true);
    
    // Draw arrow from score to age decision
    drawElbowConnector(ctx, width/2, 170, width/2, 190, '', true);
    
    // Draw risk categories
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Low Fibrosis\\\\\\\\\n(<1.30)',
      isLowRisk,
      isLowRisk ? '#dcfce7' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Intermediate\\\\\\\\\n(1.30-2.67)',
      isIntermediateRisk,
      isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Advanced Fibrosis\\\\\\\\\n(>2.67)',
      isHighRisk,
      isHighRisk ? '#fee2e2' : '#e2e8f0'
    );
    
    // Draw arrows from age to risk categories with more spacing
    drawElbowConnector(ctx, width/2 - 40, 250, width/4, 280, '<1.30', isLowRisk);
    drawElbowConnector(ctx, width/2, 250, width/2, 280, '1.30-2.67', isIntermediateRisk);
    drawElbowConnector(ctx, width/2 + 40, 250, 3*width/4, 280, '>2.67', isHighRisk);
  } else {
    // For patients ≥ 65 years - adjusted thresholds
    const isLowRisk = fib4Score < 2.0;
    const isIntermediateRisk = fib4Score >= 2.0 && fib4Score <= 4.0;
    const isHighRisk = fib4Score > 4.0;
    
    // Draw age decision box
    drawBox(ctx, width/2 - boxWidth/2, 190, boxWidth, boxHeight, 'Age ≥ 65 years', true);
    
    // Draw arrow from score to age decision
    drawElbowConnector(ctx, width/2, 170, width/2, 190, '', true);
    
    // Draw risk categories
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Low Fibrosis\\\\\\\\\n(<2.0)',
      isLowRisk,
      isLowRisk ? '#dcfce7' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Intermediate\\\\\\\\\n(2.0-4.0)',
      isIntermediateRisk,
      isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      280, // Increased spacing
      boxWidth, 
      boxHeight, 
      'Advanced Fibrosis\\\\\\\\\n(>4.0)',
      isHighRisk,
      isHighRisk ? '#fee2e2' : '#e2e8f0'
    );
    
    // Draw arrows from age to risk categories with more spacing
    drawElbowConnector(ctx, width/2 - 40, 250, width/4, 280, '<2.0', isLowRisk);
    drawElbowConnector(ctx, width/2, 250, width/2, 280, '2.0-4.0', isIntermediateRisk);
    drawElbowConnector(ctx, width/2 + 40, 250, 3*width/4, 280, '>4.0', isHighRisk);
  }
}

function drawDas28Algorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140; // Increased from 120
  const boxHeight = 60; // Increased from 50
  
  // Calculate DAS28 score
  const das28Score = 
    0.56 * Math.sqrt(inputs.tenderJoints) + 
    0.28 * Math.sqrt(inputs.swollenJoints) + 
    0.70 * Math.log(inputs.esr) + 
    0.014 * inputs.patientGlobal;
  
  const roundedScore = parseFloat(das28Score.toFixed(2));
  
  // Draw formula box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'DAS28-ESR Formula');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    110, // Increased spacing
    boxWidth, 
    boxHeight, 
    `Score: ${roundedScore}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from formula to score
  drawElbowConnector(ctx, width/2, 80, width/2, 110, '', true);
  
  // Determine disease activity
  const isRemission = das28Score <= 2.6;
  const isLowActivity = das28Score > 2.6 && das28Score <= 3.2;
  const isModerateActivity = das28Score > 3.2 && das28Score <= 5.1;
  const isHighActivity = das28Score > 5.1;
  
  // Draw disease activity categories with better spacing
  const categoryWidth = width / 5; // Divide width into 5 parts for 4 categories
  
  drawBox(
    ctx, 
    categoryWidth * 0.5 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Remission\\\\\\\\\n(≤2.6)',
    isRemission,
    isRemission ? '#dcfce7' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    categoryWidth * 1.75 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Low Activity\\\\\\\\\n(2.61-3.2)',
    isLowActivity,
    isLowActivity ? '#d1fae5' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    categoryWidth * 3 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'Moderate Activity\\\\\\\\\n(3.21-5.1)',
    isModerateActivity,
    isModerateActivity ? '#fef9c3' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    categoryWidth * 4.25 - boxWidth/2, 
    220, // Increased spacing
    boxWidth, 
    boxHeight, 
    'High Activity\\\\\\\\\n(>5.1)',
    isHighActivity,
    isHighActivity ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to disease activity categories with better spacing
  drawElbowConnector(ctx, width/2 - 60, 170, categoryWidth * 0.5, 220, '≤2.6', isRemission);
  drawElbowConnector(ctx, width/2 - 20, 170, categoryWidth * 1.75, 220, '2.61-3.2', isLowActivity);
  drawElbowConnector(ctx, width/2 + 20, 170, categoryWidth * 3, 220, '3.21-5.1', isModerateActivity);
  drawElbowConnector(ctx, width/2 + 60, 170, categoryWidth * 4.25, 220, '>5.1', isHighActivity);
}

function drawGenericAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140; // Increased from 120
  const boxHeight = 60; // Increased from 50
  
  // Draw start box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'Score Calculation');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    110, // Increased spacing
    boxWidth, 
    boxHeight, 
    `Score: ${result.score}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from start to score
  drawElbowConnector(ctx, width/2, 80, width/2, 110, '', true);
  
  // Draw interpretation box
  drawBox(
    ctx, 
    width/2 - boxWidth*1.5/2, 
    220, // Increased spacing
    boxWidth*1.5, 
    boxHeight, 
    result.interpretation,
    true,
    result.severity === 'low' ? '#dcfce7' : 
    result.severity === 'moderate' ? '#fef9c3' : 
    '#fee2e2'
  );
  
  // Draw arrow from score to interpretation
  drawElbowConnector(ctx, width/2, 170, width/2, 220, '', true);
}