import type { ParameterDefinition } from './calculator-definitions';

export interface AlgorithmNode {
  id: string;
  type: 'question' | 'decision' | 'action' | 'result';
  content: string;
  description?: string;
  parameters?: ParameterDefinition[];
  branches?: {
    condition: string;
    evaluator: (params: Record<string, any>) => boolean;
    nextNodeId: string;
    label: string;
  }[];
  recommendations?: string[];
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  startNodeId: string;
  nodes: Record<string, AlgorithmNode>;
  preparationInfo: {
    requiredParameters: string[]; // IDs of parameters needed at start
    potentialParameters: string[]; // IDs of parameters that might be needed later
  };
  references: string[];
}

// Cardiovascular Risk Assessment Algorithm
const cvRiskAlgorithm: AlgorithmDefinition = {
  id: 'cv-risk',
  name: 'Cardiovascular Risk Assessment',
  description: 'Algorithm for assessing cardiovascular risk and determining treatment approach',
  category: 'Cardiology',
  startNodeId: 'initial-assessment',
  nodes: {
    'initial-assessment': {
      id: 'initial-assessment',
      type: 'question',
      content: 'Does the patient have established cardiovascular disease?',
      parameters: [
        {
          id: 'established-cvd',
          name: 'Established CVD',
          type: 'boolean',
          tooltip: 'Previous myocardial infarction, stroke, or peripheral artery disease',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'has-cvd',
          evaluator: (params) => params['established-cvd'] === true,
          nextNodeId: 'secondary-prevention',
          label: 'Yes'
        },
        {
          condition: 'no-cvd',
          evaluator: (params) => params['established-cvd'] === false,
          nextNodeId: 'primary-prevention',
          label: 'No'
        }
      ]
    },
    'secondary-prevention': {
      id: 'secondary-prevention',
      type: 'result',
      content: 'Secondary Prevention',
      description: 'Patient requires secondary prevention strategies',
      recommendations: [
        'High-intensity statin therapy',
        'Blood pressure management to target <130/80 mmHg',
        'Antiplatelet therapy',
        'Lifestyle modifications'
      ]
    },
    'primary-prevention': {
      id: 'primary-prevention',
      type: 'question',
      content: 'Calculate 10-year ASCVD risk score',
      parameters: [
        {
          id: 'ascvd-risk',
          name: 'ASCVD Risk Score',
          type: 'number',
          unit: '%',
          tooltip: '10-year risk of atherosclerotic cardiovascular disease',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'low-risk',
          evaluator: (params) => params['ascvd-risk'] < 5,
          nextNodeId: 'low-risk',
          label: '<5%'
        },
        {
          condition: 'borderline-risk',
          evaluator: (params) => params['ascvd-risk'] >= 5 && params['ascvd-risk'] < 7.5,
          nextNodeId: 'borderline-risk',
          label: '5-7.5%'
        },
        {
          condition: 'intermediate-risk',
          evaluator: (params) => params['ascvd-risk'] >= 7.5 && params['ascvd-risk'] < 20,
          nextNodeId: 'intermediate-risk',
          label: '7.5-20%'
        },
        {
          condition: 'high-risk',
          evaluator: (params) => params['ascvd-risk'] >= 20,
          nextNodeId: 'high-risk',
          label: '≥20%'
        }
      ]
    },
    'low-risk': {
      id: 'low-risk',
      type: 'result',
      content: 'Low Risk (<5%)',
      description: 'Patient has low 10-year risk of ASCVD',
      recommendations: [
        'Emphasize lifestyle modifications',
        'Consider statin only if family history of premature ASCVD or other risk-enhancing factors',
        'Reassess in 4-6 years'
      ]
    },
    'borderline-risk': {
      id: 'borderline-risk',
      type: 'question',
      content: 'Are risk-enhancing factors present?',
      description: 'Risk-enhancing factors include family history of premature ASCVD, metabolic syndrome, chronic kidney disease, etc.',
      parameters: [
        {
          id: 'risk-enhancers',
          name: 'Risk Enhancers Present',
          type: 'boolean',
          tooltip: 'Presence of risk-enhancing factors such as family history of premature ASCVD, metabolic syndrome, chronic kidney disease, etc.',
          storable: false,
        }
      ],
      branches: [
        {
          condition: 'has-enhancers',
          evaluator: (params) => params['risk-enhancers'] === true,
          nextNodeId: 'borderline-with-enhancers',
          label: 'Yes'
        },
        {
          condition: 'no-enhancers',
          evaluator: (params) => params['risk-enhancers'] === false,
          nextNodeId: 'borderline-without-enhancers',
          label: 'No'
        }
      ]
    },
    'borderline-with-enhancers': {
      id: 'borderline-with-enhancers',
      type: 'result',
      content: 'Borderline Risk with Risk Enhancers',
      description: 'Patient has borderline risk with additional risk-enhancing factors',
      recommendations: [
        'Consider moderate-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Monitor lipid levels and reassess risk in 1-2 years'
      ]
    },
    'borderline-without-enhancers': {
      id: 'borderline-without-enhancers',
      type: 'result',
      content: 'Borderline Risk without Risk Enhancers',
      description: 'Patient has borderline risk without additional risk-enhancing factors',
      recommendations: [
        'Emphasize lifestyle modifications',
        'Consider statin based on clinician-patient risk discussion',
        'Reassess in 2-4 years'
      ]
    },
    'intermediate-risk': {
      id: 'intermediate-risk',
      type: 'question',
      content: 'Are risk-enhancing factors present or would coronary artery calcium (CAC) scoring help decision-making?',
      parameters: [
        {
          id: 'risk-decision',
          name: 'Risk Assessment Decision',
          type: 'select',
          options: [
            { value: 'enhancers', label: 'Risk enhancers present' },
            { value: 'cac', label: 'Perform CAC scoring' },
            { value: 'neither', label: 'Neither' }
          ],
          tooltip: 'Decision on how to further refine risk assessment',
          storable: false,
        }
      ],
      branches: [
        {
          condition: 'has-enhancers',
          evaluator: (params) => params['risk-decision'] === 'enhancers',
          nextNodeId: 'intermediate-with-enhancers',
          label: 'Risk enhancers present'
        },
        {
          condition: 'perform-cac',
          evaluator: (params) => params['risk-decision'] === 'cac',
          nextNodeId: 'cac-scoring',
          label: 'Perform CAC scoring'
        },
        {
          condition: 'neither',
          evaluator: (params) => params['risk-decision'] === 'neither',
          nextNodeId: 'intermediate-standard',
          label: 'Neither'
        }
      ]
    },
    'intermediate-with-enhancers': {
      id: 'intermediate-with-enhancers',
      type: 'result',
      content: 'Intermediate Risk with Risk Enhancers',
      description: 'Patient has intermediate risk with additional risk-enhancing factors',
      recommendations: [
        'Initiate moderate-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Target 30-49% LDL-C reduction',
        'Monitor lipid levels and reassess risk annually'
      ]
    },
    'intermediate-standard': {
      id: 'intermediate-standard',
      type: 'result',
      content: 'Intermediate Risk',
      description: 'Patient has intermediate risk without additional assessment',
      recommendations: [
        'Consider moderate-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Target 30-49% LDL-C reduction',
        'Monitor lipid levels and reassess risk in 1-2 years'
      ]
    },
    'cac-scoring': {
      id: 'cac-scoring',
      type: 'question',
      content: 'What is the coronary artery calcium (CAC) score?',
      parameters: [
        {
          id: 'cac-score',
          name: 'CAC Score',
          type: 'select',
          options: [
            { value: 'zero', label: 'CAC = 0' },
            { value: 'low', label: 'CAC = 1-99' },
            { value: 'high', label: 'CAC ≥ 100' }
          ],
          tooltip: 'Coronary artery calcium score from CT scan',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'cac-zero',
          evaluator: (params) => params['cac-score'] === 'zero',
          nextNodeId: 'cac-zero',
          label: 'CAC = 0'
        },
        {
          condition: 'cac-low',
          evaluator: (params) => params['cac-score'] === 'low',
          nextNodeId: 'cac-low',
          label: 'CAC = 1-99'
        },
        {
          condition: 'cac-high',
          evaluator: (params) => params['cac-score'] === 'high',
          nextNodeId: 'cac-high',
          label: 'CAC ≥ 100'
        }
      ]
    },
    'cac-zero': {
      id: 'cac-zero',
      type: 'result',
      content: 'CAC Score = 0',
      description: 'Patient has intermediate risk but CAC score of zero',
      recommendations: [
        'Consider withholding statin therapy',
        'Emphasize lifestyle modifications',
        'Reassess in 5-7 years'
      ]
    },
    'cac-low': {
      id: 'cac-low',
      type: 'result',
      content: 'CAC Score = 1-99',
      description: 'Patient has intermediate risk with low positive CAC score',
      recommendations: [
        'Initiate moderate-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Target 30-49% LDL-C reduction',
        'Monitor lipid levels and reassess risk annually'
      ]
    },
    'cac-high': {
      id: 'cac-high',
      type: 'result',
      content: 'CAC Score ≥ 100',
      description: 'Patient has intermediate risk with high CAC score',
      recommendations: [
        'Initiate moderate to high-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Target ≥50% LDL-C reduction',
        'Consider additional risk factors and comorbidities',
        'Monitor lipid levels and reassess risk every 6 months'
      ]
    },
    'high-risk': {
      id: 'high-risk',
      type: 'result',
      content: 'High Risk (≥20%)',
      description: 'Patient has high 10-year risk of ASCVD',
      recommendations: [
        'Initiate high-intensity statin therapy',
        'Emphasize lifestyle modifications',
        'Target ≥50% LDL-C reduction',
        'Consider additional risk factors and comorbidities',
        'Monitor lipid levels and reassess risk every 6 months'
      ]
    }
  },
  preparationInfo: {
    requiredParameters: ['established-cvd'],
    potentialParameters: ['age', 'gender', 'total-cholesterol', 'hdl-cholesterol', 'systolic-bp', 'smoking-status', 'diabetes']
  },
  references: [
    '2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease',
    '2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Blood Cholesterol'
  ]
};

// Combined CV Risk Algorithm (Framingham + ESC/EAS Guidelines)
const combinedCVRiskAlgorithm: AlgorithmDefinition = {
  id: 'combined-cv-risk',
  name: 'Combined CV Risk Assessment',
  description: 'Comprehensive cardiovascular risk assessment combining Framingham risk score with European guidelines',
  category: 'Cardiology',
  startNodeId: 'initial-assessment',
  nodes: {
    'initial-assessment': {
      id: 'initial-assessment',
      type: 'question',
      content: 'Does the patient have any of the following conditions?',
      description: 'Check for conditions that automatically classify as very high risk',
      parameters: [
        {
          id: 'cad',
          name: 'Documented CAD',
          type: 'boolean',
          tooltip: 'Coronary artery disease (previous MI, ACS, coronary revascularization, other arterial revascularization procedures)',
          storable: true,
        },
        {
          id: 'cerebroVD',
          name: 'Cerebrovascular Disease',
          type: 'boolean',
          tooltip: 'Stroke or TIA',
          storable: true,
        },
        {
          id: 'pad',
          name: 'Peripheral Artery Disease',
          type: 'boolean',
          tooltip: 'Peripheral arterial disease',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'has-cvd',
          evaluator: (params) => params['cad'] === true || params['cerebroVD'] === true || params['pad'] === true,
          nextNodeId: 'very-high-risk',
          label: 'Yes (Secondary Prevention)'
        },
        {
          condition: 'no-cvd',
          evaluator: (params) => params['cad'] !== true && params['cerebroVD'] !== true && params['pad'] !== true,
          nextNodeId: 'check-diabetes',
          label: 'No (Primary Prevention)'
        }
      ]
    },
    'check-diabetes': {
      id: 'check-diabetes',
      type: 'question',
      content: 'Does the patient have diabetes?',
      parameters: [
        {
          id: 'dm1',
          name: 'Type 1 Diabetes',
          type: 'boolean',
          tooltip: 'Type 1 diabetes mellitus',
          storable: true,
        },
        {
          id: 'dm2',
          name: 'Type 2 Diabetes',
          type: 'boolean',
          tooltip: 'Type 2 diabetes mellitus',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'has-diabetes',
          evaluator: (params) => params['dm1'] === true || params['dm2'] === true,
          nextNodeId: 'diabetes-assessment',
          label: 'Yes'
        },
        {
          condition: 'no-diabetes',
          evaluator: (params) => params['dm1'] !== true && params['dm2'] !== true,
          nextNodeId: 'check-severe-conditions',
          label: 'No'
        }
      ]
    },
    'diabetes-assessment': {
      id: 'diabetes-assessment',
      type: 'question',
      content: 'Diabetes risk assessment',
      description: 'Check for diabetes-related risk factors',
      parameters: [
        {
          id: 'albuminuria',
          name: 'Albuminuria',
          type: 'boolean',
          tooltip: 'Presence of albuminuria',
          storable: true,
        },
        {
          id: 'smoking',
          name: 'Current Smoker',
          type: 'boolean',
          tooltip: 'Currently smokes tobacco',
          storable: true,
        },
        {
          id: 'knownHPT',
          name: 'Hypertension',
          type: 'boolean',
          tooltip: 'Diagnosed hypertension or on antihypertensive medication',
          storable: true,
        },
        {
          id: 'knownDLP',
          name: 'Dyslipidemia',
          type: 'boolean',
          tooltip: 'Diagnosed dyslipidemia or on lipid-lowering medication',
          storable: true,
        },
        {
          id: 'age',
          name: 'Age',
          type: 'number',
          unit: 'years',
          tooltip: 'Patient age in years',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'dm1-with-albuminuria',
          evaluator: (params) => params['dm1'] === true && params['albuminuria'] === true,
          nextNodeId: 'very-high-risk',
          label: 'T1DM with albuminuria'
        },
        {
          condition: 'dm2-with-risk-factors',
          evaluator: (params) => params['dm2'] === true && (params['smoking'] === true || params['knownHPT'] === true || params['knownDLP'] === true || (params['age'] !== undefined && params['age'] > 40)),
          nextNodeId: 'high-risk',
          label: 'T2DM with risk factors'
        },
        {
          condition: 'other-diabetes',
          evaluator: (params) => true, // Default branch for other diabetes cases
          nextNodeId: 'framingham-calculation',
          label: 'Other diabetes cases'
        }
      ]
    },
    'check-severe-conditions': {
      id: 'check-severe-conditions',
      type: 'question',
      content: 'Does the patient have any of these severe conditions?',
      parameters: [
        {
          id: 'tcOver7_5',
          name: 'TC > 7.5 mmol/L',
          type: 'boolean',
          tooltip: 'Total cholesterol > 7.5 mmol/L (290 mg/dL)',
          storable: true,
        },
        {
          id: 'ldlOver5_0',
          name: 'LDL-C > 5.0 mmol/L',
          type: 'boolean',
          tooltip: 'LDL cholesterol > 5.0 mmol/L (190 mg/dL)',
          storable: true,
        },
        {
          id: 'egfr',
          name: 'eGFR',
          type: 'number',
          unit: 'mL/min/1.73m²',
          tooltip: 'Estimated glomerular filtration rate',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'severe-dyslipidemia',
          evaluator: (params) => params['tcOver7_5'] === true || params['ldlOver5_0'] === true,
          nextNodeId: 'high-risk',
          label: 'Severe dyslipidemia'
        },
        {
          condition: 'severe-ckd',
          evaluator: (params) => params['egfr'] !== undefined && params['egfr'] < 30,
          nextNodeId: 'very-high-risk',
          label: 'Severe CKD (eGFR < 30)'
        },
        {
          condition: 'moderate-ckd',
          evaluator: (params) => params['egfr'] !== undefined && params['egfr'] >= 30 && params['egfr'] < 60,
          nextNodeId: 'high-risk',
          label: 'Moderate CKD (eGFR 30-59)'
        },
        {
          condition: 'no-severe-conditions',
          evaluator: (params) => true, // Default branch
          nextNodeId: 'check-subclinical-atherosclerosis',
          label: 'None of these conditions'
        }
      ]
    },
    'check-subclinical-atherosclerosis': {
      id: 'check-subclinical-atherosclerosis',
      type: 'question',
      content: 'Is there evidence of subclinical atherosclerosis?',
      parameters: [
        {
          id: 'coronaryAtheroma',
          name: 'Coronary Atheroma',
          type: 'boolean',
          tooltip: 'Significant coronary atheroma on imaging',
          storable: true,
        },
        {
          id: 'carotidAtheroma',
          name: 'Carotid Atheroma',
          type: 'boolean',
          tooltip: 'Significant carotid atheroma on imaging',
          storable: true,
        },
        {
          id: 'lowerLimbAtheroma',
          name: 'Lower Limb Atheroma',
          type: 'boolean',
          tooltip: 'Significant lower limb atheroma on imaging',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'has-atherosclerosis',
          evaluator: (params) => params['coronaryAtheroma'] === true || params['carotidAtheroma'] === true || params['lowerLimbAtheroma'] === true,
          nextNodeId: 'high-risk',
          label: 'Evidence of atherosclerosis'
        },
        {
          condition: 'no-atherosclerosis',
          evaluator: (params) => params['coronaryAtheroma'] !== true && params['carotidAtheroma'] !== true && params['lowerLimbAtheroma'] !== true,
          nextNodeId: 'framingham-calculation',
          label: 'No evidence of atherosclerosis'
        }
      ]
    },
    'framingham-calculation': {
      id: 'framingham-calculation',
      type: 'question',
      content: 'Calculate Framingham Risk Score',
      description: 'Enter parameters to calculate 10-year cardiovascular risk',
      parameters: [
        {
          id: 'age',
          name: 'Age',
          type: 'number',
          unit: 'years',
          tooltip: 'Patient age in years',
          storable: true,
        },
        {
          id: 'gender',
          name: 'Gender',
          type: 'select',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ],
          tooltip: 'Patient gender',
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
          name: 'Systolic BP',
          type: 'number',
          unit: 'mmHg',
          tooltip: 'Systolic blood pressure',
          storable: true,
        },
        {
          id: 'onHypertensionTreatment',
          name: 'On Hypertension Treatment',
          type: 'boolean',
          tooltip: 'Currently on medication for hypertension',
          storable: true,
        },
        {
          id: 'smoker',
          name: 'Current Smoker',
          type: 'boolean',
          tooltip: 'Currently smokes tobacco',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'calculate',
          evaluator: (params) => true,
          nextNodeId: 'framingham-result',
          label: 'Calculate Risk'
        }
      ]
    },
    'framingham-result': {
      id: 'framingham-result',
      type: 'question',
      content: 'Framingham Risk Score Result',
      description: 'Based on the calculated risk score, determine risk category',
      parameters: [
        {
          id: 'framinghamRisk',
          name: 'Framingham Risk',
          type: 'number',
          unit: '%',
          tooltip: '10-year risk of cardiovascular disease',
          storable: true,
        },
        {
          id: 'currentLDL',
          name: 'Current LDL-C',
          type: 'number',
          unit: 'mmol/L',
          tooltip: 'Current LDL cholesterol level',
          storable: true,
        }
      ],
      branches: [
        {
          condition: 'low-risk',
          evaluator: (params) => params['framinghamRisk'] < 5,
          nextNodeId: 'low-risk-treatment',
          label: 'Low Risk (<5%)'
        },
        {
          condition: 'moderate-risk',
          evaluator: (params) => params['framinghamRisk'] >= 5 && params['framinghamRisk'] < 15,
          nextNodeId: 'moderate-risk-treatment',
          label: 'Moderate Risk (5-15%)'
        },
        {
          condition: 'high-risk',
          evaluator: (params) => params['framinghamRisk'] >= 15,
          nextNodeId: 'high-risk-treatment',
          label: 'High Risk (≥15%)'
        }
      ]
    },
    'very-high-risk': {
      id: 'very-high-risk',
      type: 'result',
      content: 'Very High Risk',
      description: 'Patient is at very high cardiovascular risk',
      recommendations: [
        'LDL-C target: <1.4 mmol/L (<55 mg/dL) and ≥50% reduction from baseline',
        'High-intensity statin therapy (e.g., atorvastatin 40-80 mg or rosuvastatin 20-40 mg)',
        'Consider combination therapy if target not achieved with maximum tolerated statin',
        'Aggressive management of all risk factors',
        'Consider antiplatelet therapy for secondary prevention'
      ]
    },
    'high-risk': {
      id: 'high-risk',
      type: 'result',
      content: 'High Risk',
      description: 'Patient is at high cardiovascular risk',
      recommendations: [
        'LDL-C target: <1.8 mmol/L (<70 mg/dL) and ≥50% reduction from baseline',
        'High-intensity statin therapy (e.g., atorvastatin 20-40 mg or rosuvastatin 10-20 mg)',
        'Consider combination therapy if target not achieved with maximum tolerated statin',
        'Aggressive management of all risk factors'
      ]
    },
    'low-risk-treatment': {
      id: 'low-risk-treatment',
      type: 'result',
      content: 'Low Risk Treatment Recommendations',
      description: 'Treatment recommendations for low-risk patients',
      recommendations: [
        'LDL-C target: <3.0 mmol/L (<116 mg/dL)',
        'Lifestyle modifications as primary intervention',
        'Consider statin therapy only if LDL-C remains >3.0 mmol/L despite lifestyle changes',
        'Reassess cardiovascular risk in 5 years'
      ]
    },
    'moderate-risk-treatment': {
      id: 'moderate-risk-treatment',
      type: 'result',
      content: 'Moderate Risk Treatment Recommendations',
      description: 'Treatment recommendations for moderate-risk patients',
      recommendations: [
        'LDL-C target: <2.6 mmol/L (<100 mg/dL)',
        'Lifestyle modifications as primary intervention',
        'Consider moderate-intensity statin therapy if LDL-C remains >2.6 mmol/L despite lifestyle changes',
        'Reassess cardiovascular risk in 2 years'
      ]
    },
    'high-risk-treatment': {
      id: 'high-risk-treatment',
      type: 'result',
      content: 'High Risk Treatment Recommendations (Framingham)',
      description: 'Treatment recommendations for high-risk patients based on Framingham score',
      recommendations: [
        'LDL-C target: <1.8 mmol/L (<70 mg/dL)',
        'Moderate to high-intensity statin therapy',
        'Aggressive lifestyle modifications',
        'Consider combination therapy if target not achieved with maximum tolerated statin',
        'Manage all modifiable risk factors',
        'Reassess cardiovascular risk annually'
      ]
    }
  },
  preparationInfo: {
    requiredParameters: ['age', 'gender'],
    potentialParameters: [
      'totalCholesterol', 'hdlCholesterol', 'systolicBP', 'onHypertensionTreatment', 
      'smoker', 'cad', 'cerebroVD', 'pad', 'dm1', 'dm2', 'egfr', 'currentLDL'
    ]
  },
  references: [
    '2019 ESC/EAS Guidelines for the management of dyslipidaemias',
    '2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease',
    'Framingham Heart Study Risk Score Calculator'
  ]
};

// Export the algorithms
export const algorithms: AlgorithmDefinition[] = [
  cvRiskAlgorithm,
  combinedCVRiskAlgorithm
];

// Helper function to get an algorithm by ID
export function getAlgorithmById(id: string): AlgorithmDefinition | undefined {
  return algorithms.find(algo => algo.id === id);
}