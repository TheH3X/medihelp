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
  additionalData?: Record<string, any>;
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

// Framingham Risk Score Calculator Definition
export const framinghamRiskCalculator: CalculatorDefinition = {
  id: 'framingham-risk',
  name: 'Framingham Risk Score',
  description: 'Estimates 10-year cardiovascular risk based on multiple risk factors',
  category: 'Cardiology',
  parameters: [
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      unit: 'years',
      tooltip: 'Patient\'s age in years (30-79)',
      storable: true,
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
    {
      id: 'totalCholesterol',
      name: 'Total Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'Total cholesterol level',
      storable: true,
    },
    {
      id: 'hdlCholesterol',
      name: 'HDL Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'HDL cholesterol level',
      storable: true,
    },
    {
      id: 'systolicBP',
      name: 'Systolic Blood Pressure',
      type: 'number',
      unit: 'mmHg',
      tooltip: 'Systolic blood pressure',
      storable: true,
    },
    {
      id: 'onHypertensionTreatment',
      name: 'On Hypertension Treatment',
      type: 'boolean',
      tooltip: 'Is the patient currently on medication for hypertension?',
      storable: true,
    },
    {
      id: 'smoker',
      name: 'Current Smoker',
      type: 'boolean',
      tooltip: 'Does the patient currently smoke cigarettes?',
      storable: true,
    },
  ],
  screeningQuestions: [
    {
      id: 'ageRange',
      question: 'Is the patient between 30 and 79 years old?',
      type: 'boolean',
      eliminates: true,
      eliminationMessage: 'This calculator is validated for patients aged 30-79 years.',
    },
    {
      id: 'priorCVD',
      question: 'Does the patient have prior cardiovascular disease?',
      type: 'boolean',
      eliminates: true,
      eliminationMessage: 'This calculator is intended for primary prevention. Patients with established cardiovascular disease are automatically considered high risk.',
    },
  ],
  calculate: (params) => {
    // Get age points based on gender and age
    let points = 0;
    const age = params.age;
    const gender = params.gender;
    
    // Age points for men
    if (gender === 'male') {
      if (age >= 30 && age <= 34) points += 0;
      else if (age >= 35 && age <= 39) points += 2;
      else if (age >= 40 && age <= 44) points += 5;
      else if (age >= 45 && age <= 49) points += 6;
      else if (age >= 50 && age <= 54) points += 8;
      else if (age >= 55 && age <= 59) points += 10;
      else if (age >= 60 && age <= 64) points += 11;
      else if (age >= 65 && age <= 69) points += 12;
      else if (age >= 70 && age <= 74) points += 14;
      else if (age >= 75) points += 15;
    } 
    // Age points for women
    else {
      if (age >= 30 && age <= 34) points += 0;
      else if (age >= 35 && age <= 39) points += 2;
      else if (age >= 40 && age <= 44) points += 4;
      else if (age >= 45 && age <= 49) points += 5;
      else if (age >= 50 && age <= 54) points += 7;
      else if (age >= 55 && age <= 59) points += 8;
      else if (age >= 60 && age <= 64) points += 9;
      else if (age >= 65 && age <= 69) points += 10;
      else if (age >= 70 && age <= 74) points += 11;
      else if (age >= 75) points += 12;
    }
    
    // Total cholesterol points based on gender
    const tc = params.totalCholesterol;
    if (gender === 'male') {
      if (tc < 4.10) points += 0;
      else if (tc >= 4.10 && tc <= 5.19) points += 1;
      else if (tc >= 5.20 && tc <= 6.19) points += 2;
      else if (tc >= 6.20 && tc <= 7.20) points += 3;
      else if (tc > 7.20) points += 4;
    } else {
      if (tc < 4.10) points += 0;
      else if (tc >= 4.10 && tc <= 5.19) points += 1;
      else if (tc >= 5.20 && tc <= 6.19) points += 3;
      else if (tc >= 6.20 && tc <= 7.20) points += 4;
      else if (tc > 7.20) points += 5;
    }
    
    // HDL cholesterol points
    const hdl = params.hdlCholesterol;
    if (hdl >= 1.50) points += -2;
    else if (hdl >= 1.30 && hdl <= 1.49) points += -1;
    else if (hdl >= 1.20 && hdl <= 1.29) points += 0;
    else if (hdl >= 0.90 && hdl <= 1.19) points += 1;
    else if (hdl < 0.90) points += 2;
    
    // Systolic BP points based on treatment status
    const sbp = params.systolicBP;
    const treated = params.onHypertensionTreatment;
    
    if (gender === 'male') {
      if (!treated) {
        if (sbp < 120) points += -2;
        else if (sbp >= 120 && sbp <= 129) points += 0;
        else if (sbp >= 130 && sbp <= 139) points += 1;
        else if (sbp >= 140 && sbp <= 159) points += 2;
        else if (sbp >= 160) points += 3;
      } else {
        if (sbp < 120) points += 0;
        else if (sbp >= 120 && sbp <= 129) points += 2;
        else if (sbp >= 130 && sbp <= 139) points += 3;
        else if (sbp >= 140 && sbp <= 159) points += 4;
        else if (sbp >= 160) points += 5;
      }
    } else {
      if (!treated) {
        if (sbp < 120) points += -3;
        else if (sbp >= 120 && sbp <= 129) points += 0;
        else if (sbp >= 130 && sbp <= 139) points += 1;
        else if (sbp >= 140 && sbp <= 149) points += 2;
        else if (sbp >= 150 && sbp <= 159) points += 4;
        else if (sbp >= 160) points += 5;
      } else {
        if (sbp < 120) points += -1;
        else if (sbp >= 120 && sbp <= 129) points += 2;
        else if (sbp >= 130 && sbp <= 139) points += 3;
        else if (sbp >= 140 && sbp <= 149) points += 5;
        else if (sbp >= 150 && sbp <= 159) points += 6;
        else if (sbp >= 160) points += 7;
      }
    }
    
    // Smoking points
    if (params.smoker) {
      if (gender === 'male') points += 4;
      else points += 3;
    }
    
    // Calculate 10-year risk based on points and gender
    let risk = 0;
    if (gender === 'male') {
      if (points <= -3) risk = 1;
      else if (points === -2) risk = 1.1;
      else if (points === -1) risk = 1.4;
      else if (points === 0) risk = 1.6;
      else if (points === 1) risk = 1.9;
      else if (points === 2) risk = 2.3;
      else if (points === 3) risk = 2.8;
      else if (points === 4) risk = 3.3;
      else if (points === 5) risk = 3.9;
      else if (points === 6) risk = 4.7;
      else if (points === 7) risk = 5.6;
      else if (points === 8) risk = 6.7;
      else if (points === 9) risk = 7.9;
      else if (points === 10) risk = 9.4;
      else if (points === 11) risk = 11.2;
      else if (points === 12) risk = 13.2;
      else if (points === 13) risk = 15.6;
      else if (points === 14) risk = 18.4;
      else if (points === 15) risk = 21.6;
      else if (points === 16) risk = 25.3;
      else if (points === 17) risk = 29.4;
      else if (points >= 18) risk = 30;
    } else {
      if (points <= -2) risk = 1;
      else if (points === -1) risk = 1.0;
      else if (points === 0) risk = 1.1;
      else if (points === 1) risk = 1.5;
      else if (points === 2) risk = 1.8;
      else if (points === 3) risk = 2.1;
      else if (points === 4) risk = 2.5;
      else if (points === 5) risk = 2.9;
      else if (points === 6) risk = 3.4;
      else if (points === 7) risk = 3.9;
      else if (points === 8) risk = 4.6;
      else if (points === 9) risk = 5.4;
      else if (points === 10) risk = 6.3;
      else if (points === 11) risk = 7.4;
      else if (points === 12) risk = 8.6;
      else if (points === 13) risk = 10.0;
      else if (points === 14) risk = 11.6;
      else if (points === 15) risk = 13.5;
      else if (points === 16) risk = 15.6;
      else if (points === 17) risk = 18.1;
      else if (points === 18) risk = 20.9;
      else if (points === 19) risk = 24.0;
      else if (points >= 20) risk = 27.5;
    }
    
    // Determine ESC/EAS risk category based on risk percentage
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    
    if (risk < 1) {
      interpretation = 'Low cardiovascular risk (<1% 10-year risk)';
      severity = 'low';
    } else if (risk < 5) {
      interpretation = 'Low cardiovascular risk (<5% 10-year risk)';
      severity = 'low';
    } else if (risk < 10) {
      interpretation = 'Moderate cardiovascular risk (5-10% 10-year risk)';
      severity = 'moderate';
    } else if (risk < 20) {
      interpretation = 'High cardiovascular risk (10-20% 10-year risk)';
      severity = 'high';
    } else {
      interpretation = 'Very high cardiovascular risk (≥20% 10-year risk)';
      severity = 'very-high';
    }
    
    // Determine LDL target based on risk category
    let ldlTarget = '';
    if (severity === 'low') {
      ldlTarget = 'LDL target: <3.0 mmol/L';
    } else if (severity === 'moderate') {
      ldlTarget = 'LDL target: <2.6 mmol/L';
    } else if (severity === 'high') {
      ldlTarget = 'LDL target: <1.8 mmol/L or ≥50% reduction';
    } else if (severity === 'very-high') {
      ldlTarget = 'LDL target: <1.4 mmol/L or ≥50% reduction';
    }
    
    interpretation += '. ' + ldlTarget;
    
    return {
      score: risk,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 1, interpretation: 'Low cardiovascular risk (<1% 10-year risk)', severity: 'low' },
      { min: 1, max: 4.9, interpretation: 'Low cardiovascular risk (<5% 10-year risk)', severity: 'low' },
      { min: 5, max: 9.9, interpretation: 'Moderate cardiovascular risk (5-10% 10-year risk)', severity: 'moderate' },
      { min: 10, max: 19.9, interpretation: 'High cardiovascular risk (10-20% 10-year risk)', severity: 'high' },
      { min: 20, max: 100, interpretation: 'Very high cardiovascular risk (≥20% 10-year risk)', severity: 'very-high' },
    ],
    notes: 'The Framingham Risk Score estimates 10-year risk of cardiovascular disease based on age, gender, total cholesterol, HDL cholesterol, smoking status, and blood pressure. Risk categories are based on ESC/EAS guidelines.',
  },
  references: [
    'D\'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General cardiovascular risk profile for use in primary care: the Framingham Heart Study. Circulation. 2008;117(6):743-753.',
    'Mach F, Baigent C, Catapano AL, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk. Eur Heart J. 2020;41(1):111-188.',
  ],
};

// CV Risk Assessment Calculator Definition
export const cvRiskCalculator: CalculatorDefinition = {
  id: 'cv-risk',
  name: 'Cardiovascular Risk Assessment',
  description: 'Evaluates cardiovascular risk categories and determines if Framingham risk scoring is needed',
  category: 'Cardiology',
  parameters: [
    // Required parameters
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      unit: 'years',
      tooltip: 'Patient\'s age in years',
      storable: true,
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
    {
      id: 'smoking',
      name: 'Smoking',
      type: 'boolean',
      tooltip: 'Current smoker',
      storable: true,
    },
    {
      id: 'onHPTRx',
      name: 'On Hypertension Treatment',
      type: 'boolean',
      tooltip: 'Patient is currently on medication for hypertension',
      storable: true,
    },
    {
      id: 'untreatedTC',
      name: 'Untreated Total Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'Total cholesterol level without lipid-lowering therapy',
      storable: true,
    },
    {
      id: 'untreatedHDL',
      name: 'Untreated HDL',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'HDL cholesterol level without lipid-lowering therapy',
      storable: true,
    },
    {
      id: 'untreatedLDL',
      name: 'Untreated LDL',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'LDL cholesterol level without lipid-lowering therapy',
      storable: true,
    },
    {
      id: 'untreatedSBP',
      name: 'Untreated Systolic BP',
      type: 'number',
      unit: 'mmHg',
      tooltip: 'Systolic blood pressure without antihypertensive therapy',
      storable: true,
    },
    
    // Additional information - recommended
    {
      id: 'knownDLP',
      name: 'Known Dyslipidemia',
      type: 'boolean',
      tooltip: 'Patient has been diagnosed with dyslipidemia',
      storable: true,
    },
    {
      id: 'onStatin',
      name: 'On Statin Therapy',
      type: 'boolean',
      tooltip: 'Patient is currently taking statin medication',
      storable: true,
    },
    {
      id: 'apoB',
      name: 'ApoB',
      type: 'number',
      unit: 'g/L',
      tooltip: 'Apolipoprotein B level',
      storable: true,
    },
    {
      id: 'tcOver7_5',
      name: 'TC ≥ 7.5',
      type: 'boolean',
      tooltip: 'Total cholesterol level is 7.5 mmol/L or higher',
      storable: false,
    },
    {
      id: 'currentLDL',
      name: 'Current LDL',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'Current LDL cholesterol level (with or without treatment)',
      storable: true,
    },
    {
      id: 'ldlOver5_0',
      name: 'LDL ≥ 5.0',
      type: 'boolean',
      tooltip: 'LDL cholesterol level is 5.0 mmol/L or higher',
      storable: false,
    },
    {
      id: 'currentNonHDL',
      name: 'Current Non-HDL',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'Current non-HDL cholesterol level (Total Cholesterol minus HDL)',
      storable: true,
    },
    
    // Comorbidities
    {
      id: 'knownHPT',
      name: 'Known Hypertension',
      type: 'boolean',
      tooltip: 'Patient has been diagnosed with hypertension',
      storable: true,
    },
    {
      id: 'dm2',
      name: 'Type 2 Diabetes',
      type: 'boolean',
      tooltip: 'Patient has Type 2 Diabetes Mellitus',
      storable: true,
    },
    {
      id: 'dm1',
      name: 'Type 1 Diabetes',
      type: 'boolean',
      tooltip: 'Patient has Type 1 Diabetes Mellitus',
      storable: true,
    },
    {
      id: 'ckd',
      name: 'Chronic Kidney Disease',
      type: 'boolean',
      tooltip: 'Patient has Chronic Kidney Disease',
      storable: true,
    },
    {
      id: 'sbpOver180',
      name: 'SBP ≥ 180',
      type: 'boolean',
      tooltip: 'Systolic blood pressure is 180 mmHg or higher',
      storable: false,
    },
    {
      id: 'dbpOver110',
      name: 'DBP ≥ 110',
      type: 'boolean',
      tooltip: 'Diastolic blood pressure is 110 mmHg or higher',
      storable: false,
    },
    {
      id: 'albuminuria',
      name: 'Albuminuria',
      type: 'boolean',
      tooltip: 'Presence of albumin in the urine',
      storable: true,
    },
    {
      id: 'egfr',
      name: 'eGFR',
      type: 'number',
      unit: 'mL/min/1.73m²',
      tooltip: 'Estimated glomerular filtration rate',
      storable: true,
    },
    
    // Complication History
    {
      id: 'cad',
      name: 'Coronary Artery Disease',
      type: 'boolean',
      tooltip: 'History of coronary artery disease',
      storable: true,
    },
    {
      id: 'cerebroVD',
      name: 'Cerebrovascular Disease',
      type: 'boolean',
      tooltip: 'History of cerebrovascular disease',
      storable: true,
    },
    {
      id: 'pad',
      name: 'Peripheral Arterial Disease',
      type: 'boolean',
      tooltip: 'History of peripheral arterial disease',
      storable: true,
    },
    {
      id: 'ami',
      name: 'Acute Myocardial Infarction',
      type: 'boolean',
      tooltip: 'History of acute myocardial infarction',
      storable: true,
    },
    
    // Asymptomatic atheroma
    {
      id: 'coronaryAtheroma',
      name: 'Coronary Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic coronary atheroma on imaging',
      storable: true,
    },
    {
      id: 'carotidAtheroma',
      name: 'Carotid Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic carotid atheroma on imaging',
      storable: true,
    },
    {
      id: 'lowerLimbAtheroma',
      name: 'Lower Limb Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic lower limb atheroma on imaging',
      storable: true,
    },
  ],
  screeningQuestions: [
    {
      id: 'cvRiskAssessment',
      question: 'Is this patient being evaluated for cardiovascular risk?',
      type: 'boolean',
      eliminates: false,
    },
  ],
  calculate: (params) => {
    // Check for Very High Risk criteria
    const hasEstablishedAtherosclerosis = params.cad || params.cerebroVD || params.pad;
    
    const hasType2DiabetesWithRiskFactors = params.dm2 && 
      (params.smoking || params.knownHPT || params.knownDLP || params.age > 40);
    
    const hasType1DiabetesWithAlbuminuria = params.dm1 && params.albuminuria;
    
    const hasGeneticDyslipidemia = params.tcOver7_5 || params.ldlOver5_0;
    
    const hasSevereCKD = params.egfr !== undefined && params.egfr < 30;
    
    const hasAsymptomaticAtheroma = params.coronaryAtheroma || 
      params.carotidAtheroma || params.lowerLimbAtheroma;
    
    const isVeryHighRisk = hasEstablishedAtherosclerosis || 
      hasType2DiabetesWithRiskFactors || 
      hasType1DiabetesWithAlbuminuria || 
      hasGeneticDyslipidemia || 
      hasSevereCKD || 
      hasAsymptomaticAtheroma;
    
    // Check for High Risk criteria
    const hasMarkedlyElevatedBP = params.sbpOver180 || params.dbpOver110;
    
    const hasUncomplicatedDiabetes = (params.dm1 || (params.dm2 && params.age < 40)) && 
      !(params.smoking || params.knownHPT || params.knownDLP);
    
    const hasModerateKidneyDisease = params.egfr !== undefined && 
      params.egfr >= 30 && params.egfr < 60;
    
    const isHighRisk = hasMarkedlyElevatedBP || hasUncomplicatedDiabetes || hasModerateKidneyDisease;
    
    // Determine if Framingham risk scoring is needed
    const needsFramingham = !isVeryHighRisk && !isHighRisk;
    
    // Determine risk category and interpretation
    let riskCategory = '';
    let interpretation = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    
    if (isVeryHighRisk) {
      riskCategory = 'Very High Risk';
      interpretation = 'Patient meets criteria for Very High cardiovascular risk. Framingham risk scoring is not required.';
      severity = 'very-high';
    } else if (isHighRisk) {
      riskCategory = 'High Risk';
      interpretation = 'Patient meets criteria for High cardiovascular risk. Framingham risk scoring is not required.';
      severity = 'high';
    } else {
      riskCategory = 'Requires Framingham Scoring';
      interpretation = 'Patient does not meet criteria for automatic High or Very High risk classification. Framingham risk scoring is recommended.';
      severity = 'moderate';
    }
    
    // Return a score of 0-2 representing risk category (0=needs Framingham, 1=High, 2=Very High)
    const score = isVeryHighRisk ? 2 : (isHighRisk ? 1 : 0);
    
    return {
      score,
      interpretation,
      severity,
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 0, interpretation: 'Requires Framingham risk scoring to determine cardiovascular risk', severity: 'moderate' },
      { min: 1, max: 1, interpretation: 'High cardiovascular risk - Framingham risk scoring not required', severity: 'high' },
      { min: 2, max: 2, interpretation: 'Very High cardiovascular risk - Framingham risk scoring not required', severity: 'very-high' },
    ],
    notes: 'This assessment determines whether a patient falls into automatic High or Very High cardiovascular risk categories based on clinical criteria. If the patient does not meet these criteria, Framingham risk scoring is recommended for further risk stratification.',
  },
  references: [
    'South African Dyslipidaemia Guideline Consensus Statement: 2018 Update',
    'European Society of Cardiology (ESC) and European Atherosclerosis Society (EAS) Guidelines for the management of dyslipidaemias',
    'American College of Cardiology/American Heart Association Guideline on the Assessment of Cardiovascular Risk',
  ],
};

// NEW: Combined CV Risk and Framingham Calculator
export const combinedCVRiskCalculator: CalculatorDefinition = {
  id: 'combined-cv-risk',
  name: 'Combined CV Risk Assessment',
  description: 'Comprehensive cardiovascular risk assessment with integrated Framingham risk scoring when needed',
  category: 'Cardiology',
  parameters: [
    // Basic demographics
    {
      id: 'age',
      name: 'Age',
      type: 'number',
      unit: 'years',
      tooltip: 'Patient\'s age in years',
      storable: true,
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
    
    // Risk factors
    {
      id: 'smoking',
      name: 'Current Smoker',
      type: 'boolean',
      tooltip: 'Does the patient currently smoke cigarettes?',
      storable: true,
    },
    {
      id: 'knownHPT',
      name: 'Known Hypertension',
      type: 'boolean',
      tooltip: 'Patient has been diagnosed with hypertension',
      storable: true,
    },
    {
      id: 'onHypertensionTreatment',
      name: 'On Hypertension Treatment',
      type: 'boolean',
      tooltip: 'Is the patient currently on medication for hypertension?',
      storable: true,
    },
    {
      id: 'systolicBP',
      name: 'Systolic Blood Pressure',
      type: 'number',
      unit: 'mmHg',
      tooltip: 'Current systolic blood pressure',
      storable: true,
    },
    {
      id: 'diastolicBP',
      name: 'Diastolic Blood Pressure',
      type: 'number',
      unit: 'mmHg',
      tooltip: 'Current diastolic blood pressure',
      storable: true,
    },
    {
      id: 'sbpOver180',
      name: 'SBP ≥ 180',
      type: 'boolean',
      tooltip: 'Systolic blood pressure is 180 mmHg or higher',
      storable: false,
    },
    {
      id: 'dbpOver110',
      name: 'DBP ≥ 110',
      type: 'boolean',
      tooltip: 'Diastolic blood pressure is 110 mmHg or higher',
      storable: false,
    },
    
    // Lipid profile
    {
      id: 'totalCholesterol',
      name: 'Total Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'Total cholesterol level',
      storable: true,
    },
    {
      id: 'hdlCholesterol',
      name: 'HDL Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'HDL cholesterol level',
      storable: true,
    },
    {
      id: 'ldlCholesterol',
      name: 'LDL Cholesterol',
      type: 'number',
      unit: 'mmol/L',
      tooltip: 'LDL cholesterol level',
      storable: true,
    },
    {
      id: 'tcOver7_5',
      name: 'TC ≥ 7.5 mmol/L',
      type: 'boolean',
      tooltip: 'Total cholesterol level is 7.5 mmol/L or higher',
      storable: false,
    },
    {
      id: 'ldlOver5_0',
      name: 'LDL ≥ 5.0 mmol/L',
      type: 'boolean',
      tooltip: 'LDL cholesterol level is 5.0 mmol/L or higher',
      storable: false,
    },
    {
      id: 'knownDLP',
      name: 'Known Dyslipidemia',
      type: 'boolean',
      tooltip: 'Patient has been diagnosed with dyslipidemia',
      storable: true,
    },
    {
      id: 'onStatin',
      name: 'On Statin Therapy',
      type: 'boolean',
      tooltip: 'Patient is currently taking statin medication',
      storable: true,
    },
    
    // Diabetes
    {
      id: 'dm1',
      name: 'Type 1 Diabetes',
      type: 'boolean',
      tooltip: 'Patient has Type 1 Diabetes Mellitus',
      storable: true,
    },
    {
      id: 'dm2',
      name: 'Type 2 Diabetes',
      type: 'boolean',
      tooltip: 'Patient has Type 2 Diabetes Mellitus',
      storable: true,
    },
    {
      id: 'albuminuria',
      name: 'Albuminuria',
      type: 'boolean',
      tooltip: 'Presence of albumin in the urine',
      storable: true,
    },
    
    // Kidney function
    {
      id: 'egfr',
      name: 'eGFR',
      type: 'number',
      unit: 'mL/min/1.73m²',
      tooltip: 'Estimated glomerular filtration rate',
      storable: true,
    },
    {
      id: 'ckd',
      name: 'Chronic Kidney Disease',
      type: 'boolean',
      tooltip: 'Patient has Chronic Kidney Disease',
      storable: true,
    },
    
    // Established disease
    {
      id: 'cad',
      name: 'Coronary Artery Disease',
      type: 'boolean',
      tooltip: 'History of coronary artery disease',
      storable: true,
    },
    {
      id: 'cerebroVD',
      name: 'Cerebrovascular Disease',
      type: 'boolean',
      tooltip: 'History of cerebrovascular disease',
      storable: true,
    },
    {
      id: 'pad',
      name: 'Peripheral Arterial Disease',
      type: 'boolean',
      tooltip: 'History of peripheral arterial disease',
      storable: true,
    },
    {
      id: 'ami',
      name: 'Acute Myocardial Infarction',
      type: 'boolean',
      tooltip: 'History of acute myocardial infarction',
      storable: true,
    },
    
    // Asymptomatic atheroma
    {
      id: 'coronaryAtheroma',
      name: 'Coronary Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic coronary atheroma on imaging',
      storable: true,
    },
    {
      id: 'carotidAtheroma',
      name: 'Carotid Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic carotid atheroma on imaging',
      storable: true,
    },
    {
      id: 'lowerLimbAtheroma',
      name: 'Lower Limb Atheroma',
      type: 'boolean',
      tooltip: 'Presence of asymptomatic lower limb atheroma on imaging',
      storable: true,
    },
  ],
  screeningQuestions: [
    {
      id: 'cvRiskAssessment',
      question: 'Is this patient being evaluated for cardiovascular risk?',
      type: 'boolean',
      eliminates: false,
    },
    {
      id: 'ageRange',
      question: 'Is the patient between 30 and 79 years old?',
      type: 'boolean',
      eliminates: false,
      eliminationMessage: 'Framingham risk scoring is validated for patients aged 30-79 years. Risk assessment will still be performed.',
    },
  ],
  calculate: (params) => {
    // STEP 1: CV Risk Assessment to determine if Framingham is needed
    
    // Check for Very High Risk criteria
    const hasEstablishedAtherosclerosis = params.cad || params.cerebroVD || params.pad || params.ami;
    
    const hasType2DiabetesWithRiskFactors = params.dm2 && 
      (params.smoking || params.knownHPT || params.knownDLP || params.age > 40);
    
    const hasType1DiabetesWithAlbuminuria = params.dm1 && params.albuminuria;
    
    const hasGeneticDyslipidemia = params.tcOver7_5 || params.ldlOver5_0;
    
    const hasSevereCKD = params.egfr !== undefined && params.egfr < 30;
    
    const hasAsymptomaticAtheroma = params.coronaryAtheroma || 
      params.carotidAtheroma || params.lowerLimbAtheroma;
    
    const isVeryHighRisk = hasEstablishedAtherosclerosis || 
      hasType2DiabetesWithRiskFactors || 
      hasType1DiabetesWithAlbuminuria || 
      hasGeneticDyslipidemia || 
      hasSevereCKD || 
      hasAsymptomaticAtheroma;
    
    // Check for High Risk criteria
    const hasMarkedlyElevatedBP = params.sbpOver180 || params.dbpOver110 || 
      params.systolicBP >= 180 || params.diastolicBP >= 110;
    
    const hasUncomplicatedDiabetes = (params.dm1 || (params.dm2 && params.age < 40)) && 
      !(params.smoking || params.knownHPT || params.knownDLP);
    
    const hasModerateKidneyDisease = params.egfr !== undefined && 
      params.egfr >= 30 && params.egfr < 60;
    
    const isHighRisk = hasMarkedlyElevatedBP || hasUncomplicatedDiabetes || hasModerateKidneyDisease;
    
    // Determine if Framingham risk scoring is needed
    const needsFramingham = !isVeryHighRisk && !isHighRisk;
    
    // STEP 2: Calculate Framingham risk if needed, or assign default risk
    let framinghamRisk = 0;
    let riskCategory = '';
    let severity: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    let ldlTarget = '';
    let treatmentRecommendation = '';
    
    // If auto-high or auto-very high, assign default risk values
    if (isVeryHighRisk) {
      framinghamRisk = 30; // Default for very high risk
      riskCategory = 'Very High Risk';
      severity = 'very-high';
    } else if (isHighRisk) {
      framinghamRisk = 15; // Default for high risk
      riskCategory = 'High Risk';
      severity = 'high';
    } else {
      // Calculate Framingham risk
      // Get age points based on gender and age
      let points = 0;
      const age = params.age;
      const gender = params.gender;
      
      // Age points for men
      if (gender === 'male') {
        if (age >= 30 && age <= 34) points += 0;
        else if (age >= 35 && age <= 39) points += 2;
        else if (age >= 40 && age <= 44) points += 5;
        else if (age >= 45 && age <= 49) points += 6;
        else if (age >= 50 && age <= 54) points += 8;
        else if (age >= 55 && age <= 59) points += 10;
        else if (age >= 60 && age <= 64) points += 11;
        else if (age >= 65 && age <= 69) points += 12;
        else if (age >= 70 && age <= 74) points += 14;
        else if (age >= 75) points += 15;
      } 
      // Age points for women
      else {
        if (age >= 30 && age <= 34) points += 0;
        else if (age >= 35 && age <= 39) points += 2;
        else if (age >= 40 && age <= 44) points += 4;
        else if (age >= 45 && age <= 49) points += 5;
        else if (age >= 50 && age <= 54) points += 7;
        else if (age >= 55 && age <= 59) points += 8;
        else if (age >= 60 && age <= 64) points += 9;
        else if (age >= 65 && age <= 69) points += 10;
        else if (age >= 70 && age <= 74) points += 11;
        else if (age >= 75) points += 12;
      }
      
      // Total cholesterol points based on gender
      const tc = params.totalCholesterol;
      if (gender === 'male') {
        if (tc < 4.10) points += 0;
        else if (tc >= 4.10 && tc <= 5.19) points += 1;
        else if (tc >= 5.20 && tc <= 6.19) points += 2;
        else if (tc >= 6.20 && tc <= 7.20) points += 3;
        else if (tc > 7.20) points += 4;
      } else {
        if (tc < 4.10) points += 0;
        else if (tc >= 4.10 && tc <= 5.19) points += 1;
        else if (tc >= 5.20 && tc <= 6.19) points += 3;
        else if (tc >= 6.20 && tc <= 7.20) points += 4;
        else if (tc > 7.20) points += 5;
      }
      
      // HDL cholesterol points
      const hdl = params.hdlCholesterol;
      if (hdl >= 1.50) points += -2;
      else if (hdl >= 1.30 && hdl <= 1.49) points += -1;
      else if (hdl >= 1.20 && hdl <= 1.29) points += 0;
      else if (hdl >= 0.90 && hdl <= 1.19) points += 1;
      else if (hdl < 0.90) points += 2;
      
      // Systolic BP points based on treatment status
      const sbp = params.systolicBP;
      const treated = params.onHypertensionTreatment;
      
      if (gender === 'male') {
        if (!treated) {
          if (sbp < 120) points += -2;
          else if (sbp >= 120 && sbp <= 129) points += 0;
          else if (sbp >= 130 && sbp <= 139) points += 1;
          else if (sbp >= 140 && sbp <= 159) points += 2;
          else if (sbp >= 160) points += 3;
        } else {
          if (sbp < 120) points += 0;
          else if (sbp >= 120 && sbp <= 129) points += 2;
          else if (sbp >= 130 && sbp <= 139) points += 3;
          else if (sbp >= 140 && sbp <= 159) points += 4;
          else if (sbp >= 160) points += 5;
        }
      } else {
        if (!treated) {
          if (sbp < 120) points += -3;
          else if (sbp >= 120 && sbp <= 129) points += 0;
          else if (sbp >= 130 && sbp <= 139) points += 1;
          else if (sbp >= 140 && sbp <= 149) points += 2;
          else if (sbp >= 150 && sbp <= 159) points += 4;
          else if (sbp >= 160) points += 5;
        } else {
          if (sbp < 120) points += -1;
          else if (sbp >= 120 && sbp <= 129) points += 2;
          else if (sbp >= 130 && sbp <= 139) points += 3;
          else if (sbp >= 140 && sbp <= 149) points += 5;
          else if (sbp >= 150 && sbp <= 159) points += 6;
          else if (sbp >= 160) points += 7;
        }
      }
      
      // Smoking points
      if (params.smoking) {
        if (gender === 'male') points += 4;
        else points += 3;
      }
      
      // Calculate 10-year risk based on points and gender
      if (gender === 'male') {
        if (points <= -3) framinghamRisk = 1;
        else if (points === -2) framinghamRisk = 1.1;
        else if (points === -1) framinghamRisk = 1.4;
        else if (points === 0) framinghamRisk = 1.6;
        else if (points === 1) framinghamRisk = 1.9;
        else if (points === 2) framinghamRisk = 2.3;
        else if (points === 3) framinghamRisk = 2.8;
        else if (points === 4) framinghamRisk = 3.3;
        else if (points === 5) framinghamRisk = 3.9;
        else if (points === 6) framinghamRisk = 4.7;
        else if (points === 7) framinghamRisk = 5.6;
        else if (points === 8) framinghamRisk = 6.7;
        else if (points === 9) framinghamRisk = 7.9;
        else if (points === 10) framinghamRisk = 9.4;
        else if (points === 11) framinghamRisk = 11.2;
        else if (points === 12) framinghamRisk = 13.2;
        else if (points === 13) framinghamRisk = 15.6;
        else if (points === 14) framinghamRisk = 18.4;
        else if (points === 15) framinghamRisk = 21.6;
        else if (points === 16) framinghamRisk = 25.3;
        else if (points === 17) framinghamRisk = 29.4;
        else if (points >= 18) framinghamRisk = 30;
      } else {
        if (points <= -2) framinghamRisk = 1;
        else if (points === -1) framinghamRisk = 1.0;
        else if (points === 0) framinghamRisk = 1.1;
        else if (points === 1) framinghamRisk = 1.5;
        else if (points === 2) framinghamRisk = 1.8;
        else if (points === 3) framinghamRisk = 2.1;
        else if (points === 4) framinghamRisk = 2.5;
        else if (points === 5) framinghamRisk = 2.9;
        else if (points === 6) framinghamRisk = 3.4;
        else if (points === 7) framinghamRisk = 3.9;
        else if (points === 8) framinghamRisk = 4.6;
        else if (points === 9) framinghamRisk = 5.4;
        else if (points === 10) framinghamRisk = 6.3;
        else if (points === 11) framinghamRisk = 7.4;
        else if (points === 12) framinghamRisk = 8.6;
        else if (points === 13) framinghamRisk = 10.0;
        else if (points === 14) framinghamRisk = 11.6;
        else if (points === 15) framinghamRisk = 13.5;
        else if (points === 16) framinghamRisk = 15.6;
        else if (points === 17) framinghamRisk = 18.1;
        else if (points === 18) framinghamRisk = 20.9;
        else if (points === 19) framinghamRisk = 24.0;
        else if (points >= 20) framinghamRisk = 27.5;
      }
      
      // Determine risk category based on Framingham risk
      if (framinghamRisk < 3) {
        riskCategory = 'Low Risk';
        severity = 'low';
      } else if (framinghamRisk < 15) {
        riskCategory = 'Moderate Risk';
        severity = 'moderate';
      } else if (framinghamRisk < 30) {
        riskCategory = 'High Risk';
        severity = 'high';
      } else {
        riskCategory = 'Very High Risk';
        severity = 'very-high';
      }
    }
    
    // STEP 3: Determine LDL target and treatment recommendation based on risk category and current LDL
    const currentLDL = params.ldlCholesterol || 0;
    
    // Determine LDL target based on risk category
    if (riskCategory === 'Low Risk') {
      ldlTarget = '<3.0 mmol/L';
    } else if (riskCategory === 'Moderate Risk') {
      ldlTarget = '<2.6 mmol/L';
    } else if (riskCategory === 'High Risk') {
      ldlTarget = '<1.8 mmol/L';
    } else if (riskCategory === 'Very High Risk') {
      ldlTarget = '<1.4 mmol/L';
    }
    
    // Determine treatment recommendation based on risk category and current LDL
    if (riskCategory === 'Low Risk') {
      if (currentLDL < 3.0) {
        treatmentRecommendation = 'Lifestyle advice';
      } else if (currentLDL >= 3.0 && currentLDL < 4.9) {
        treatmentRecommendation = 'Lifestyle advice';
      } else if (currentLDL >= 4.9) {
        treatmentRecommendation = 'Lifestyle advice + statin';
      }
    } else if (riskCategory === 'Moderate Risk') {
      if (currentLDL < 2.6) {
        treatmentRecommendation = 'Lifestyle advice';
      } else if (currentLDL >= 2.6 && currentLDL < 4.9) {
        treatmentRecommendation = 'Lifestyle advice + statin';
      } else if (currentLDL >= 4.9) {
        treatmentRecommendation = 'Lifestyle intervention, consider drug if uncontrolled';
      }
    } else if (riskCategory === 'High Risk') {
      if (currentLDL < 1.8) {
        treatmentRecommendation = 'Lifestyle advice';
      } else {
        treatmentRecommendation = 'Lifestyle intervention AND drug intervention';
      }
    } else if (riskCategory === 'Very High Risk') {
      if (currentLDL < 1.4) {
        treatmentRecommendation = 'Lifestyle advice';
      } else {
        treatmentRecommendation = 'Lifestyle intervention AND drug intervention';
      }
    }
    
    // Create interpretation
    let interpretation = `${riskCategory} (${framinghamRisk.toFixed(1)}% 10-year risk). `;
    interpretation += `LDL target: ${ldlTarget}. `;
    interpretation += `Recommendation: ${treatmentRecommendation}.`;
    
    // Return result with additional data for the UI
    return {
      score: framinghamRisk,
      interpretation,
      severity,
      additionalData: {
        riskCategory,
        ldlTarget,
        treatmentRecommendation,
        needsFramingham,
        isHighRisk,
        isVeryHighRisk,
        currentLDL
      }
    };
  },
  interpretations: {
    ranges: [
      { min: 0, max: 2.9, interpretation: 'Low cardiovascular risk (<3% 10-year risk)', severity: 'low' },
      { min: 3, max: 14.9, interpretation: 'Moderate cardiovascular risk (3-15% 10-year risk)', severity: 'moderate' },
      { min: 15, max: 29.9, interpretation: 'High cardiovascular risk (15-30% 10-year risk)', severity: 'high' },
      { min: 30, max: 100, interpretation: 'Very high cardiovascular risk (≥30% 10-year risk)', severity: 'very-high' },
    ],
    notes: 'This combined calculator first assesses if the patient meets criteria for automatic High or Very High risk classification. If not, Framingham risk scoring is performed. Treatment recommendations are based on risk category and current LDL levels.',
  },
  references: [
    'Mach F, Baigent C, Catapano AL, et al. 2019 ESC/EAS Guidelines for the management of dyslipidaemias: lipid modification to reduce cardiovascular risk. Eur Heart J. 2020;41(1):111-188.',
    'D\'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General cardiovascular risk profile for use in primary care: the Framingham Heart Study. Circulation. 2008;117(6):743-753.',
    'South African Dyslipidaemia Guideline Consensus Statement: 2018 Update',
  ],
};

// List of all available calculators
export const calculators: CalculatorDefinition[] = [
  hasbledCalculator,
  cha2ds2vascCalculator,
  fib4Calculator,
  das28Calculator,
  cvRiskCalculator,
  framinghamRiskCalculator,
  combinedCVRiskCalculator, // Add the new combined calculator
  // Add more calculators here as they are implemented
];

// Helper function to get a calculator by ID
export function getCalculatorById(id: string): CalculatorDefinition | undefined {
  return calculators.find(calc => calc.id === id);
}