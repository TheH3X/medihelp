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
      case 'framingham-risk':
        drawFraminghamAlgorithm(ctx, result, inputs);
        break;
      case 'cv-risk':
        drawCVRiskAlgorithm(ctx, result, inputs);
        break;
      case 'combined-cv-risk':
        drawCombinedCVRiskAlgorithm(ctx, result, inputs);
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
  const lines = text.split('\\\\\\n');
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
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'HAS-BLED\\\\\\nScore Calculation');
  
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
    'Low Risk\\\\\\n(0-1)',
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
    'Intermediate Risk\\\\\\n(2-3)',
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
    'High Risk\\\\\\n(≥4)',
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
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'CHA₂DS₂-VASc\\\\\\nScore Calculation');
  
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
    'Low Risk\\\\\\n(0)',
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
    'Low-Moderate Risk\\\\\\n(1)',
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
    'Moderate-High Risk\\\\\\n(≥2)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories
  drawArrow(ctx, width/2 - 40, 150, width/4, 200, 'Score = 0', isLowRisk);
  drawArrow(ctx, width/2, 150, width/2, 200, 'Score = 1', isLowModerateRisk);
  drawArrow(ctx, width/2 + 40, 150, 3*width/4, 200, 'Score ≥ 2', isHighRisk);
}

function drawFib4Algorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140;
  const boxHeight = 50;
  
  // Calculate FIB-4 score
  const fib4Score = (inputs.age * inputs.ast) / (inputs.platelets * Math.sqrt(inputs.alt));
  const roundedScore = parseFloat(fib4Score.toFixed(2));
  
  // Draw formula box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'FIB-4 = (Age × AST) /\\\\\\n(Platelets × √ALT)');
  
  // Draw score box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight, 
    `Score: ${roundedScore}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from formula to score
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Age-specific thresholds
  const isUnder65 = inputs.age < 65;
  
  if (isUnder65) {
    // For patients < 65 years
    const isLowRisk = fib4Score < 1.30;
    const isIntermediateRisk = fib4Score >= 1.30 && fib4Score <= 2.67;
    const isHighRisk = fib4Score > 2.67;
    
    // Draw age decision box
    drawBox(ctx, width/2 - boxWidth/2, 180, boxWidth, boxHeight, 'Age < 65 years', true);
    
    // Draw arrow from score to age decision
    drawArrow(ctx, width/2, 150, width/2, 180, '', true);
    
    // Draw risk categories
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Low Fibrosis\\\\\\n(<1.30)',
      isLowRisk,
      isLowRisk ? '#dcfce7' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Intermediate\\\\\\n(1.30-2.67)',
      isIntermediateRisk,
      isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Advanced Fibrosis\\\\\\n(>2.67)',
      isHighRisk,
      isHighRisk ? '#fee2e2' : '#e2e8f0'
    );
    
    // Draw arrows from age to risk categories
    drawArrow(ctx, width/2 - 40, 230, width/4, 260, '<1.30', isLowRisk);
    drawArrow(ctx, width/2, 230, width/2, 260, '1.30-2.67', isIntermediateRisk);
    drawArrow(ctx, width/2 + 40, 230, 3*width/4, 260, '>2.67', isHighRisk);
  } else {
    // For patients ≥ 65 years - adjusted thresholds
    const isLowRisk = fib4Score < 2.0;
    const isIntermediateRisk = fib4Score >= 2.0 && fib4Score <= 4.0;
    const isHighRisk = fib4Score > 4.0;
    
    // Draw age decision box
    drawBox(ctx, width/2 - boxWidth/2, 180, boxWidth, boxHeight, 'Age ≥ 65 years', true);
    
    // Draw arrow from score to age decision
    drawArrow(ctx, width/2, 150, width/2, 180, '', true);
    
    // Draw risk categories
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Low Fibrosis\\\\\\n(<2.0)',
      isLowRisk,
      isLowRisk ? '#dcfce7' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Intermediate\\\\\\n(2.0-4.0)',
      isIntermediateRisk,
      isIntermediateRisk ? '#fef9c3' : '#e2e8f0'
    );
    
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      260, 
      boxWidth, 
      boxHeight, 
      'Advanced Fibrosis\\\\\\n(>4.0)',
      isHighRisk,
      isHighRisk ? '#fee2e2' : '#e2e8f0'
    );
    
    // Draw arrows from age to risk categories
    drawArrow(ctx, width/2 - 40, 230, width/4, 260, '<2.0', isLowRisk);
    drawArrow(ctx, width/2, 230, width/2, 260, '2.0-4.0', isIntermediateRisk);
    drawArrow(ctx, width/2 + 40, 230, 3*width/4, 260, '>4.0', isHighRisk);
  }
}

function drawDas28Algorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140;
  const boxHeight = 50;
  
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
    100, 
    boxWidth, 
    boxHeight, 
    `Score: ${roundedScore}`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from formula to score
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Determine disease activity
  const isRemission = das28Score <= 2.6;
  const isLowActivity = das28Score > 2.6 && das28Score <= 3.2;
  const isModerateActivity = das28Score > 3.2 && das28Score <= 5.1;
  const isHighActivity = das28Score > 5.1;
  
  // Draw disease activity categories
  drawBox(
    ctx, 
    width/5 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Remission\\\\\\n(≤2.6)',
    isRemission,
    isRemission ? '#dcfce7' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    2*width/5 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Low Activity\\\\\\n(2.61-3.2)',
    isLowActivity,
    isLowActivity ? '#d1fae5' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    3*width/5 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Moderate Activity\\\\\\n(3.21-5.1)',
    isModerateActivity,
    isModerateActivity ? '#fef9c3' : '#e2e8f0'
  );
  
  drawBox(
    ctx, 
    4*width/5 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'High Activity\\\\\\n(>5.1)',
    isHighActivity,
    isHighActivity ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw arrows from score to disease activity categories
  drawArrow(ctx, width/2 - 60, 150, width/5, 200, '≤2.6', isRemission);
  drawArrow(ctx, width/2 - 20, 150, 2*width/5, 200, '2.61-3.2', isLowActivity);
  drawArrow(ctx, width/2 + 20, 150, 3*width/5, 200, '3.21-5.1', isModerateActivity);
  drawArrow(ctx, width/2 + 60, 150, 4*width/5, 200, '>5.1', isHighActivity);
}

function drawFraminghamAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140;
  const boxHeight = 50;
  
  // Draw title box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'Framingham Risk Score');
  
  // Draw inputs summary box
  const gender = inputs.gender === 'male' ? 'Male' : 'Female';
  const age = inputs.age;
  const tc = inputs.totalCholesterol;
  const hdl = inputs.hdlCholesterol;
  const sbp = inputs.systolicBP;
  const treated = inputs.onHypertensionTreatment ? 'Yes' : 'No';
  const smoker = inputs.smoker ? 'Yes' : 'No';
  
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight*1.5, 
    `Inputs:\\\\\\nAge: ${age}, ${gender}\\\\\\nTC: ${tc}, HDL: ${hdl}\\\\\\nSBP: ${sbp}, Treated: ${treated}\\\\\\nSmoker: ${smoker}`,
    false,
    '#e2e8f0'
  );
  
  // Draw arrow from title to inputs
  drawArrow(ctx, width/2 - boxWidth/4, 70, width/4, 100, '', false);
  
  // Draw score box
  const risk = result.score;
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    100, 
    boxWidth, 
    boxHeight, 
    `10-Year Risk: ${risk}%`,
    true,
    '#e2e8f0'
  );
  
  // Draw arrow from title to score
  drawArrow(ctx, width/2 + boxWidth/4, 70, 3*width/4, 100, '', true);
  
  // Draw risk categories
  const isLowRisk = risk < 5;
  const isModerateRisk = risk >= 5 && risk < 10;
  const isHighRisk = risk >= 10 && risk < 20;
  const isVeryHighRisk = risk >= 20;
  
  // Draw low risk box
  drawBox(
    ctx, 
    width/5 - boxWidth/2, 
    220, 
    boxWidth, 
    boxHeight, 
    'Low Risk\\\\\\n(<5%)',
    isLowRisk,
    isLowRisk ? '#dcfce7' : '#e2e8f0'
  );
  
  // Draw moderate risk box
  drawBox(
    ctx, 
    2*width/5 - boxWidth/2, 
    220, 
    boxWidth, 
    boxHeight, 
    'Moderate Risk\\\\\\n(5-10%)',
    isModerateRisk,
    isModerateRisk ? '#fef9c3' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    3*width/5 - boxWidth/2, 
    220, 
    boxWidth, 
    boxHeight, 
    'High Risk\\\\\\n(10-20%)',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw very high risk box
  drawBox(
    ctx, 
    4*width/5 - boxWidth/2, 
    220, 
    boxWidth, 
    boxHeight, 
    'Very High Risk\\\\\\n(≥20%)',
    isVeryHighRisk,
    isVeryHighRisk ? '#fecaca' : '#e2e8f0'
  );
  
  // Draw arrows from score to risk categories
  drawArrow(ctx, 3*width/4, 150, width/5, 220, '<5%', isLowRisk);
  drawArrow(ctx, 3*width/4, 150, 2*width/5, 220, '5-10%', isModerateRisk);
  drawArrow(ctx, 3*width/4, 150, 3*width/5, 220, '10-20%', isHighRisk);
  drawArrow(ctx, 3*width/4, 150, 4*width/5, 220, '≥20%', isVeryHighRisk);
}

function drawCVRiskAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140;
  const boxHeight = 50;
  
  // Draw title box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'CV Risk Assessment');
  
  // Draw risk factors box
  let riskFactors = [];
  if (inputs.cad) riskFactors.push('CAD');
  if (inputs.cerebroVD) riskFactors.push('Cerebrovascular Disease');
  if (inputs.pad) riskFactors.push('PAD');
  if (inputs.dm2 && (inputs.smoking || inputs.knownHPT || inputs.knownDLP || inputs.age > 40)) 
    riskFactors.push('T2DM with risk factors');
  if (inputs.dm1 && inputs.albuminuria) 
    riskFactors.push('T1DM with albuminuria');
  if (inputs.tcOver7_5 || inputs.ldlOver5_0) 
    riskFactors.push('Genetic dyslipidemia');
  if (inputs.egfr !== undefined && inputs.egfr < 30) 
    riskFactors.push('Severe CKD');
  if (inputs.coronaryAtheroma || inputs.carotidAtheroma || inputs.lowerLimbAtheroma) 
    riskFactors.push('Asymptomatic atheroma');
  
  // Draw decision tree
  drawBox(ctx, width/2 - boxWidth/2, 100, boxWidth, boxHeight, 'Risk Assessment');
  
  // Draw arrow from title to decision
  drawArrow(ctx, width/2, 70, width/2, 100, '', true);
  
  // Draw risk category boxes
  const needsFramingham = result.score === 0;
  const isHighRisk = result.score === 1;
  const isVeryHighRisk = result.score === 2;
  
  // Draw Framingham needed box
  drawBox(
    ctx, 
    width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Needs Framingham\\\\\\nScoring',
    needsFramingham,
    needsFramingham ? '#e2e8f0' : '#e2e8f0'
  );
  
  // Draw high risk box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'High Risk',
    isHighRisk,
    isHighRisk ? '#fee2e2' : '#e2e8f0'
  );
  
  // Draw very high risk box
  drawBox(
    ctx, 
    3*width/4 - boxWidth/2, 
    200, 
    boxWidth, 
    boxHeight, 
    'Very High Risk',
    isVeryHighRisk,
    isVeryHighRisk ? '#fecaca' : '#e2e8f0'
  );
  
  // Draw arrows from decision to risk categories
  drawArrow(ctx, width/2 - 40, 150, width/4, 200, 'No auto-high criteria', needsFramingham);
  drawArrow(ctx, width/2, 150, width/2, 200, 'High risk criteria', isHighRisk);
  drawArrow(ctx, width/2 + 40, 150, 3*width/4, 200, 'Very high risk criteria', isVeryHighRisk);
  
  // Draw LDL target box
  let ldlTarget = '';
  if (needsFramingham) {
    ldlTarget = 'Determine with Framingham';
  } else if (isHighRisk) {
    ldlTarget = 'LDL target: <1.8 mmol/L';
  } else if (isVeryHighRisk) {
    ldlTarget = 'LDL target: <1.4 mmol/L';
  }
  
  drawBox(
    ctx, 
    width/2 - boxWidth*1.2/2, 
    260, 
    boxWidth*1.2, 
    boxHeight, 
    ldlTarget,
    true,
    '#e2e8f0'
  );
  
  // Draw arrows to LDL target
  if (needsFramingham) {
    drawArrow(ctx, width/4, 250, width/2 - boxWidth*0.3, 260, '', true);
  } else if (isHighRisk) {
    drawArrow(ctx, width/2, 250, width/2, 260, '', true);
  } else if (isVeryHighRisk) {
    drawArrow(ctx, 3*width/4, 250, width/2 + boxWidth*0.3, 260, '', true);
  }
}

function drawCombinedCVRiskAlgorithm(
  ctx: CanvasRenderingContext2D, 
  result: CalculationResult, 
  inputs: Record<string, any>
) {
  const width = ctx.canvas.width / window.devicePixelRatio;
  const height = ctx.canvas.height / window.devicePixelRatio;
  const boxWidth = 140;
  const boxHeight = 50;
  
  // Extract additional data
  const additionalData = result.additionalData || {};
  const needsFramingham = additionalData.needsFramingham;
  const isHighRisk = additionalData.isHighRisk;
  const isVeryHighRisk = additionalData.isVeryHighRisk;
  const framinghamRisk = result.score;
  
  // Draw title box
  drawBox(ctx, width/2 - boxWidth/2, 20, boxWidth, boxHeight, 'Combined CV Risk\\\\\\nAssessment');
  
  // Draw initial assessment box
  drawBox(
    ctx, 
    width/2 - boxWidth/2, 
    80, 
    boxWidth, 
    boxHeight, 
    'Initial Risk\\\\\\nAssessment',
    true
  );
  
  // Draw arrow from title to initial assessment
  drawArrow(ctx, width/2, 70, width/2, 80, '', true);
  
  // Draw risk category paths
  if (isVeryHighRisk) {
    // Very high risk path
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      160, 
      boxWidth, 
      boxHeight, 
      'Very High Risk\\\\\\nCriteria Met',
      true,
      '#fee2e2'
    );
    
    drawArrow(ctx, width/2 + 40, 130, 3*width/4, 160, 'Auto Very High', true);
    
    drawBox(
      ctx, 
      3*width/4 - boxWidth/2, 
      240, 
      boxWidth, 
      boxHeight, 
      `Risk: 30%\\\\\\nLDL Target: <1.4`,
      true,
      '#fecaca'
    );
    
    drawArrow(ctx, 3*width/4, 210, 3*width/4, 240, '', true);
  } 
  else if (isHighRisk) {
    // High risk path
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      160, 
      boxWidth, 
      boxHeight, 
      'High Risk\\\\\\nCriteria Met',
      true,
      '#fee2e2'
    );
    
    drawArrow(ctx, width/2, 130, width/2, 160, 'Auto High', true);
    
    drawBox(
      ctx, 
      width/2 - boxWidth/2, 
      240, 
      boxWidth, 
      boxHeight, 
      `Risk: 15%\\\\\\nLDL Target: <1.8`,
      true,
      '#fee2e2'
    );
    
    drawArrow(ctx, width/2, 210, width/2, 240, '', true);
  }
  else {
    // Framingham path
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      160, 
      boxWidth, 
      boxHeight, 
      'Needs Framingham\\\\\\nScoring',
      true,
      '#e2e8f0'
    );
    
    drawArrow(ctx, width/2 - 40, 130, width/4, 160, 'No auto criteria', true);
    
    // Framingham calculation box
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      240, 
      boxWidth, 
      boxHeight, 
      'Framingham\\\\\\nCalculation',
      true
    );
    
    drawArrow(ctx, width/4, 210, width/4, 240, '', true);
    
    // Framingham result box
    drawBox(
      ctx, 
      width/4 - boxWidth/2, 
      320, 
      boxWidth, 
      boxHeight, 
      `Risk: ${framinghamRisk.toFixed(1)}%`,
      true,
      getRiskColor(framinghamRisk)
    );
    
    drawArrow(ctx, width/4, 290, width/4, 320, '', true);
  }
  
  // Draw treatment recommendation box
  const ldlTarget = additionalData.ldlTarget || '';
  const treatmentRecommendation = additionalData.treatmentRecommendation || '';
  
  drawBox(
    ctx, 
    width/2 - boxWidth*1.2/2, 
    height - boxHeight - 20, 
    boxWidth*1.2, 
    boxHeight, 
    `${ldlTarget}\\\\\\n${treatmentRecommendation}`,
    true
  );
  
  // Draw arrow to treatment recommendation
  if (isVeryHighRisk) {
    drawArrow(ctx, 3*width/4, 290, width/2, height - boxHeight - 20, '', true);
  } else if (isHighRisk) {
    drawArrow(ctx, width/2, 290, width/2, height - boxHeight - 20, '', true);
  } else {
    drawArrow(ctx, width/4, 370, width/2, height - boxHeight - 20, '', true);
  }
}

function getRiskColor(risk: number): string {
  if (risk < 3) return '#dcfce7'; // Low risk - green
  if (risk < 15) return '#fef9c3'; // Moderate risk - yellow
  if (risk < 30) return '#fee2e2'; // High risk - light red
  return '#fecaca'; // Very high risk - red
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