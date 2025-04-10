import type { CalculationResult } from './calculator-definitions';

interface FormatResultOptions {
  calculatorName: string;
  result: CalculationResult;
  inputs: Record<string, any>;
  parameterLabels: Record<string, string>;
}

export function formatWebResult(options: FormatResultOptions) {
  return {
    score: options.result.score,
    interpretation: options.result.interpretation,
    severity: options.result.severity,
  };
}

export function formatClinicalText(options: FormatResultOptions): string {
  const { calculatorName, result, inputs, parameterLabels } = options;
  
  // Format inputs as readable text
  const inputsText = Object.entries(inputs)
    .map(([key, value]) => {
      const label = parameterLabels[key] || key;
      if (typeof value === 'boolean') {
        return `${label}: ${value ? 'Yes' : 'No'}`;
      }
      return `${label}: ${value}`;
    })
    .join('\\\n');
  
  // Special handling for combined CV risk calculator
  if (calculatorName.includes('Combined CV Risk')) {
    const additionalData = result.additionalData || {};
    const riskCategory = additionalData.riskCategory || '';
    const ldlTarget = additionalData.ldlTarget || '';
    const treatmentRecommendation = additionalData.treatmentRecommendation || '';
    
    return `${calculatorName} Assessment\\\n\\\n` +
      `Inputs:\\\n${inputsText}\\\n\\\n` +
      `Risk Score: ${typeof result.score === 'number' ? result.score.toFixed(1) : result.score}% 10-year risk\\\n` +
      `Risk Category: ${riskCategory}\\\n` +
      `LDL Target: ${ldlTarget}\\\n` +
      `Treatment Recommendation: ${treatmentRecommendation}\\\n\\\n` +
      `Interpretation: ${result.interpretation}`;
  }
  
  // Standard format for other calculators
  return `${calculatorName} Assessment\\\n\\\n` +
    `Inputs:\\\n${inputsText}\\\n\\\n` +
    `Score: ${result.score}\\\n` +
    `Interpretation: ${result.interpretation}`;
}

export function formatPrinterFriendly(options: FormatResultOptions): string {
  const { calculatorName, result, inputs, parameterLabels } = options;
  
  // Format inputs as readable text
  const inputsText = Object.entries(inputs)
    .map(([key, value]) => {
      const label = parameterLabels[key] || key;
      if (typeof value === 'boolean') {
        return `${label}: ${value ? 'Yes' : 'No'}`;
      }
      return `${label}: ${value}`;
    })
    .join('\\\n');
  
  // Special handling for combined CV risk calculator
  if (calculatorName.includes('Combined CV Risk')) {
    const additionalData = result.additionalData || {};
    const riskCategory = additionalData.riskCategory || '';
    const ldlTarget = additionalData.ldlTarget || '';
    const treatmentRecommendation = additionalData.treatmentRecommendation || '';
    
    return `${calculatorName} Assessment\\\n\\\n` +
      `Date: ${new Date().toLocaleDateString()}\\\n\\\n` +
      `Inputs:\\\n${inputsText}\\\n\\\n` +
      `Risk Score: ${typeof result.score === 'number' ? result.score.toFixed(1) : result.score}% 10-year risk\\\n` +
      `Risk Category: ${riskCategory}\\\n` +
      `LDL Target: ${ldlTarget}\\\n` +
      `Treatment Recommendation: ${treatmentRecommendation}\\\n\\\n` +
      `Interpretation: ${result.interpretation}\\\n\\\n` +
      `This assessment was generated using the Clinical Calculator App.`;
  }
  
  // Standard format for other calculators
  return `${calculatorName} Assessment\\\n\\\n` +
    `Date: ${new Date().toLocaleDateString()}\\\n\\\n` +
    `Inputs:\\\n${inputsText}\\\n\\\n` +
    `Score: ${result.score}\\\n` +
    `Interpretation: ${result.interpretation}\\\n\\\n` +
    `This assessment was generated using the Clinical Calculator App.`;
}