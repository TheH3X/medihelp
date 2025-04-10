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
    .join('\\n');
  
  // Create clinical text
  return `${calculatorName} Assessment\\n\\n` +
    `Inputs:\\n${inputsText}\\n\\n` +
    `Score: ${result.score}\\n` +
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
    .join('\\n');
  
  // Create printer-friendly text
  return `${calculatorName} Assessment\\n\\n` +
    `Date: ${new Date().toLocaleDateString()}\\n\\n` +
    `Inputs:\\n${inputsText}\\n\\n` +
    `Score: ${result.score}\\n` +
    `Interpretation: ${result.interpretation}\\n\\n` +
    `This assessment was generated using the Clinical Calculator App.`;
}