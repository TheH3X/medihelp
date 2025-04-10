import type { ReactNode } from 'react';

export interface ParameterDefinition {
  id: string;
  name: string;
  type: 'number' | 'select' | 'boolean';
  unit?: string;
  options?: { value: string | number; label: string }[];
  tooltip: string;
  storable: boolean;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: 'boolean';
  eliminates: boolean;
  eliminationMessage?: string;
}

export interface CalculatorDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ParameterDefinition[];
  screeningQuestions: ScreeningQuestion[];
  calculate: (params: Record<string, any>) => CalculationResult;
  interpretations: {
    ranges: { min: number; max: number; interpretation: string; severity?: string }[];
    notes?: string;
  };
  references: string[];
}

export interface CalculationResult {
  score: number;
  interpretation: string;
  severity?: 'low' | 'moderate' | 'high' | 'very-high';
}

// HAS-BLED Calculator Definition
export const hasbledCalculator: CalculatorDefinition = {
  id: 'has-bled',
  name: 'HAS-BLED Score',
  description: 'Assesses bleeding risk in patients with atrial fibrillation on anticoagulation therapy',
  category: 'Cardiology',
  parameters: [
    {
      id: 'hypertension',
      name: 'Hypertension',
      type: 'boolean',
      tooltip: 'Uncontrolled hypertension with systolic blood pressure >160 mmHg',
      storable: false,
    },
    {
      id: 'renalDisease',
      name: 'Abnormal Renal Function',
      type: 'boolean',
      tooltip: 'Presence of chronic dialysis, renal transplantation, or serum creatinine ≥200 μmol/L (2.26 mg/dL)',
      storable: false,
    },
    {
      id: 'liverDisease',
      name: 'Abnormal Liver Function',
      type: 'boolean',
      tooltip: 'Chronic hepatic disease (e.g., cirrhosis) or biochemical evidence of significant hepatic derangement (e.g., bilirubin >2x upper limit of normal, in association with AST/ALT/ALP >3x upper limit normal)',
      storable: false,
    },
    {
      id: 'strokeHistory',
      name: 'Stroke History',
      type: 'boolean',
      tooltip: 'Previous history of stroke',
      storable: false,
    },
    {
      id: 'bleedingHistory',
      name: 'Bleeding History or Predisposition',
      type: 'boolean',
      tooltip: 'Previous bleeding history and/or predisposition to bleeding (e.g., bleeding diathesis, anemia)',
      storable: false,
    },
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      tooltip: 'Age > 65 years',
      storable: true,
    },
    {
      id: 'medications',
      name: 'Medications',
      type: 'boolean',
      tooltip: 'Concomitant use of drugs such as antiplatelet agents, NSAIDs',
      storable: false,
    },
    {
      id: 'alcohol',
      name: 'Alcohol Use',
      type: 'boolean',
      tooltip: 'Alcohol consumption ≥8 drinks/week',
      storable: false,
    },
    {
      id: 'labilePTINR',
      name: 'Labile INR',
      type: 'boolean',
      tooltip: 'Unstable/high INRs or poor time in therapeutic range (e.g., <60%)',
      storable: false,
    },
  ],
  screeningQuestions: [
    {
      id: 'onAnticoagulation',
      question: 'Is the patient on anticoagulation therapy?',
      type: 'boolean',
      eliminates: false,
    },
    {
      id: 'atrialFibrillation',
      question: 'Does the patient have atrial fibrillation?',
      type: 'boolean',
      eliminates: false,
    },
  ],
  calculate: (params) => {
    let score = 0;
    
    if (params.hypertension) score += 1;
    if (params.renalDisease) score += 1;
    if (params.liverDisease) score += 1;
    if (params.strokeHistory) score += 1;
    if (params.bleedingHistory) score += 1;
    if (params.age > 65) score += 1;
    if (params.medications) score += 1;
    if (params.alcohol) score += 1;
    if (params.labilePTINR) score += 1;
    
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    
    if (score <= 1) {
      interpretation = 'Low risk of major bleeding';
      severity = 'low';
    } else if (score === 2 || score === 3) {
      interpretation = 'Intermediate risk of major bleeding';
      severity = 'moderate';
    } else {
      interpretation = 'High risk of major bleeding';
      severity = 'high';
    }
    
    return {
      score,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 1, interpretation: 'Low risk of major bleeding (0.9-1.13% risk of bleeding per year)', severity: 'low' },
      { min: 2, max: 3, interpretation: 'Intermediate risk of major bleeding (1.88-3.74% risk of bleeding per year)', severity: 'moderate' },
      { min: 4, max: 9, interpretation: 'High risk of major bleeding (>8.7% risk of bleeding per year)', severity: 'high' },
    ],
    notes: 'HAS-BLED score is used to assess bleeding risk in patients with atrial fibrillation on anticoagulation therapy.',
  },
  references: [
    'Pisters R, Lane DA, Nieuwlaat R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey. Chest. 2010;138(5):1093-1100.',
    'Lip GY, Frison L, Halperin JL, Lane DA. Comparative validation of a novel risk score for predicting bleeding risk in anticoagulated patients with atrial fibrillation: the HAS-BLED (Hypertension, Abnormal Renal/Liver Function, Stroke, Bleeding History or Predisposition, Labile INR, Elderly, Drugs/Alcohol Concomitantly) score. J Am Coll Cardiol. 2011;57(2):173-180.',
  ],
};

// CHA2DS2-VASc Calculator Definition
export const cha2ds2vascCalculator: CalculatorDefinition = {
  id: 'cha2ds2-vasc',
  name: 'CHA₂DS₂-VASc Score',
  description: 'Estimates stroke risk in patients with atrial fibrillation',
  category: 'Cardiology',
  parameters: [
    {
      id: 'congestiveHeartFailure',
      name: 'Congestive Heart Failure',
      type: 'boolean',
      tooltip: 'Signs/symptoms of heart failure or objective evidence of reduced left ventricular ejection fraction',
      storable: false,
    },
    {
      id: 'hypertension',
      name: 'Hypertension',
      type: 'boolean',
      tooltip: 'Resting blood pressure >140/90 mmHg on at least two occasions or current antihypertensive treatment',
      storable: false,
    },
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      unit: 'years',
      tooltip: 'Patient\'s age in years',
      storable: true,
    },
    {
      id: 'diabetes',
      name: 'Diabetes Mellitus',
      type: 'boolean',
      tooltip: 'Fasting glucose >125 mg/dL (7 mmol/L) or treatment with oral hypoglycemic agent and/or insulin',
      storable: false,
    },
    {
      id: 'stroke',
      name: 'Previous Stroke/TIA/Thromboembolism',
      type: 'boolean',
      tooltip: 'Previous stroke, transient ischemic attack, or thromboembolism',
      storable: false,
    },
    {
      id: 'vascularDisease',
      name: 'Vascular Disease',
      type: 'boolean',
      tooltip: 'Prior myocardial infarction, peripheral artery disease, or aortic plaque',
      storable: false,
    },
    {
      id: 'gender',
      name: 'Gender',
      type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
      tooltip: 'Patient\'s gender',
      storable: true,
    },
  ],
  screeningQuestions: [
    {
      id: 'atrialFibrillation',
      question: 'Does the patient have atrial fibrillation?',
      type: 'boolean',
      eliminates: true,
      eliminationMessage: 'This calculator is specifically designed for patients with atrial fibrillation.',
    },
  ],
  calculate: (params) => {
    let score = 0;
    
    if (params.congestiveHeartFailure) score += 1;
    if (params.hypertension) score += 1;
    if (params.age >= 75) score += 2;
    else if (params.age >= 65) score += 1;
    if (params.diabetes) score += 1;
    if (params.stroke) score += 2;
    if (params.vascularDisease) score += 1;
    if (params.gender === 'female') score += 1;
    
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    
    if (score === 0) {
      interpretation = 'Low risk of stroke';
      severity = 'low';
    } else if (score === 1) {
      interpretation = 'Low-moderate risk of stroke';
      severity = 'low';
    } else if (score >= 2) {
      interpretation = 'Moderate-high risk of stroke';
      severity = 'high';
    }
    
    return {
      score,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 0, interpretation: 'Low risk of stroke (0.2% annual risk)', severity: 'low' },
      { min: 1, max: 1, interpretation: 'Low-moderate risk of stroke (0.6% annual risk)', severity: 'low' },
      { min: 2, max: 9, interpretation: 'Moderate-high risk of stroke (>2.2% annual risk)', severity: 'high' },
    ],
    notes: 'CHA₂DS₂-VASc score is used to determine whether anticoagulation is necessary in patients with atrial fibrillation.',
  },
  references: [
    'Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation. Chest. 2010;137(2):263-272.',
    'January CT, Wann LS, Calkins H, et al. 2019 AHA/ACC/HRS Focused Update of the 2014 AHA/ACC/HRS Guideline for the Management of Patients With Atrial Fibrillation. Circulation. 2019;140(2):e125-e151.',
  ],
};

// FIB-4 Calculator Definition - UPDATED with correct formula
export const fib4Calculator: CalculatorDefinition = {
  id: 'fib-4',
  name: 'FIB-4 Index',
  description: 'Assesses liver fibrosis in patients with hepatitis C and B',
  category: 'Hepatology',
  parameters: [
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      unit: 'years',
      tooltip: 'Patient\'s age in years',
      storable: true,
    },
    {
      id: 'ast',
      name: 'AST',
      type: 'number',
      unit: 'U/L',
      tooltip: 'Aspartate aminotransferase level',
      storable: true,
    },
    {
      id: 'alt',
      name: 'ALT',
      type: 'number',
      unit: 'U/L',
      tooltip: 'Alanine aminotransferase level',
      storable: true,
    },
    {
      id: 'platelets',
      name: 'Platelet Count',
      type: 'number',
      unit: '10⁹/L',
      tooltip: 'Platelet count in 10⁹/L (or 1000/mm³)',
      storable: true,
    },
  ],
  screeningQuestions: [
    {
      id: 'hepatitisBC',
      question: 'Does the patient have hepatitis B or C?',
      type: 'boolean',
      eliminates: false,
      eliminationMessage: 'This calculator was primarily validated in patients with hepatitis B or C.',
    },
    {
      id: 'liverDisease',
      question: 'Is the patient being evaluated for liver fibrosis?',
      type: 'boolean',
      eliminates: false,
    },
  ],
  calculate: (params) => {
    // Correct FIB-4 formula: FIB-4 = (Age × AST) / (Platelets × √ALT)
    const fib4Score = (params.age * params.ast) / (params.platelets * Math.sqrt(params.alt));
    const roundedScore = parseFloat(fib4Score.toFixed(2));
    
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' = 'low';
    
    // Age-specific thresholds
    if (params.age < 65) {
      // For patients < 65 years
      if (fib4Score < 1.30) {
        interpretation = 'Low probability of advanced fibrosis';
        severity = 'low';
      } else if (fib4Score <= 2.67) {
        interpretation = 'Intermediate probability of advanced fibrosis';
        severity = 'moderate';
      } else {
        interpretation = 'High probability of advanced fibrosis';
        severity = 'high';
      }
    } else {
      // For patients ≥ 65 years - adjusted thresholds
      if (fib4Score < 2.0) {
        interpretation = 'Low probability of advanced fibrosis';
        severity = 'low';
      } else if (fib4Score <= 4.0) {
        interpretation = 'Intermediate probability of advanced fibrosis';
        severity = 'moderate';
      } else {
        interpretation = 'High probability of advanced fibrosis';
        severity = 'high';
      }
    }
    
    return {
      score: roundedScore,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      // Updated ranges based on age-specific thresholds
      { min: 0, max: 1.29, interpretation: 'Low probability of advanced fibrosis (F3-F4) in patients <65 years', severity: 'low' },
      { min: 1.30, max: 2.67, interpretation: 'Intermediate probability of advanced fibrosis (F3-F4) in patients <65 years', severity: 'moderate' },
      { min: 2.68, max: 100, interpretation: 'High probability of advanced fibrosis (F3-F4) in patients <65 years', severity: 'high' },
      // Additional note about age-specific thresholds included in the notes section
    ],
    notes: 'FIB-4 index is used to assess the extent of liver fibrosis in patients with hepatitis B or C. Age-specific thresholds should be used: For patients ≥65 years, low probability <2.0, intermediate 2.0-4.0, and high probability >4.0.',
  },
  references: [
    'Sterling RK, Lissen E, Clumeck N, et al. Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection. Hepatology. 2006;43(6):1317-1325.',
    'Vallet-Pichard A, Mallet V, Nalpas B, et al. FIB-4: an inexpensive and accurate marker of fibrosis in HCV infection. comparison with liver biopsy and fibrotest. Hepatology. 2007;46(1):32-36.',
    'McPherson S, Hardy T, Dufour JF, et al. Age as a confounding factor for the accurate non-invasive diagnosis of advanced NAFLD fibrosis. Am J Gastroenterol. 2017;112(5):740-751.',
  ],
};

// DAS28 Calculator Definition
export const das28Calculator: CalculatorDefinition = {
  id: 'das28',
  name: 'DAS28-ESR Score',
  description: 'Measures disease activity in rheumatoid arthritis',
  category: 'Rheumatology',
  parameters: [
    {
      id: 'tenderJoints',
      name: 'Tender Joint Count',
      type: 'number',
      tooltip: 'Number of tender joints (0-28)',
      storable: false,
    },
    {
      id: 'swollenJoints',
      name: 'Swollen Joint Count',
      type: 'number',
      tooltip: 'Number of swollen joints (0-28)',
      storable: false,
    },
    {
      id: 'esr',
      name: 'ESR',
      type: 'number',
      unit: 'mm/hr',
      tooltip: 'Erythrocyte sedimentation rate',
      storable: true,
    },
    {
      id: 'patientGlobal',
      name: 'Patient Global Assessment',
      type: 'number',
      tooltip: 'Patient\'s global assessment of disease activity (0-100 scale)',
      storable: false,
    },
  ],
  screeningQuestions: [
    {
      id: 'rheumatoidArthritis',
      question: 'Does the patient have rheumatoid arthritis?',
      type: 'boolean',
      eliminates: true,
      eliminationMessage: 'This calculator is specifically designed for patients with rheumatoid arthritis.',
    },
    {
      id: 'esrAvailable',
      question: 'Is ESR (erythrocyte sedimentation rate) available?',
      type: 'boolean',
      eliminates: true,
      eliminationMessage: 'ESR is required for DAS28-ESR calculation. Consider using DAS28-CRP if CRP is available instead.',
    },
  ],
  calculate: (params) => {
    // DAS28-ESR = 0.56 × √(TJC28) + 0.28 × √(SJC28) + 0.70 × ln(ESR) + 0.014 × GH
    const das28Score = 
      0.56 * Math.sqrt(params.tenderJoints) + 
      0.28 * Math.sqrt(params.swollenJoints) + 
      0.70 * Math.log(params.esr) + 
      0.014 * params.patientGlobal;
    
    const roundedScore = parseFloat(das28Score.toFixed(2));
    
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    
    if (das28Score <= 2.6) {
      interpretation = 'Remission';
      severity = 'low';
    } else if (das28Score <= 3.2) {
      interpretation = 'Low disease activity';
      severity = 'low';
    } else if (das28Score <= 5.1) {
      interpretation = 'Moderate disease activity';
      severity = 'moderate';
    } else {
      interpretation = 'High disease activity';
      severity = 'high';
    }
    
    return {
      score: roundedScore,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 2.6, interpretation: 'Remission', severity: 'low' },
      { min: 2.61, max: 3.2, interpretation: 'Low disease activity', severity: 'low' },
      { min: 3.21, max: 5.1, interpretation: 'Moderate disease activity', severity: 'moderate' },
      { min: 5.11, max: 10, interpretation: 'High disease activity', severity: 'high' },
    ],
    notes: 'DAS28-ESR is used to measure disease activity in rheumatoid arthritis and guide treatment decisions.',
  },
  references: [
    'Prevoo ML, van \'t Hof MA, Kuper HH, van Leeuwen MA, van de Putte LB, van Riel PL. Modified disease activity scores that include twenty-eight-joint counts. Development and validation in a prospective longitudinal study of patients with rheumatoid arthritis. Arthritis Rheum. 1995;38(1):44-48.',
    'Fransen J, van Riel PL. The Disease Activity Score and the EULAR response criteria. Clin Exp Rheumatol. 2005;23(5 Suppl 39):S93-S99.',
  ],
};

// List of all available calculators
export const calculators: CalculatorDefinition[] = [
  hasbledCalculator,
  cha2ds2vascCalculator,
  fib4Calculator,
  das28Calculator,
  // Add more calculators here as they are implemented
];

// Helper function to get a calculator by ID
export function getCalculatorById(id: string): CalculatorDefinition | undefined {
  return calculators.find(calc => calc.id === id);
}