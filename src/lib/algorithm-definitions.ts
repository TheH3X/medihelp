import type { ReactNode } from 'react';

export interface AlgorithmParameter {
  id: string;
  name: string;
  type: 'number' | 'select' | 'boolean';
  unit?: string;
  options?: { value: string | number; label: string }[];
  tooltip: string;
  storable: boolean;
}

export interface AlgorithmStep {
  id: string;
  title: string;
  description?: string;
  question?: string;
  parameters: AlgorithmParameter[];
  nextStep: (inputs: Record<string, any>) => string | null; // Returns ID of next step or null if end
}

export interface AlgorithmResult {
  title: string;
  description: string;
  recommendation: string;
  severity?: 'low' | 'moderate' | 'high' | 'very-high';
  additionalData?: Record<string, any>;
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  initialStep: string;
  steps: Record<string, AlgorithmStep>;
  results: Record<string, AlgorithmResult>;
}

// Example algorithm: Chest Pain Triage
export const chestPainAlgorithm: AlgorithmDefinition = {
  id: 'chest-pain-triage',
  name: 'Chest Pain Triage Algorithm',
  description: 'Guides the initial assessment and triage of patients presenting with chest pain',
  category: 'Emergency Medicine',
  initialStep: 'initial-assessment',
  steps: {
    'initial-assessment': {
      id: 'initial-assessment',
      title: 'Initial Assessment',
      description: 'Assess for immediately life-threatening conditions',
      question: 'Does the patient have any of the following?',
      parameters: [
        {
          id: 'hypotension',
          name: 'Hypotension (SBP < 90 mmHg)',
          type: 'boolean',
          tooltip: 'Systolic blood pressure less than 90 mmHg',
          storable: false,
        },
        {
          id: 'acuteSOB',
          name: 'Acute severe shortness of breath',
          type: 'boolean',
          tooltip: 'Patient reports severe difficulty breathing or shows signs of respiratory distress',
          storable: false,
        },
        {
          id: 'syncope',
          name: 'Syncope or near-syncope',
          type: 'boolean',
          tooltip: 'Loss of consciousness or feeling like they might pass out',
          storable: false,
        },
        {
          id: 'saturation',
          name: 'Oxygen saturation',
          type: 'number',
          unit: '%',
          tooltip: 'Current oxygen saturation by pulse oximetry',
          storable: true,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.hypotension || inputs.acuteSOB || inputs.syncope || (inputs.saturation && inputs.saturation < 90)) {
          return 'high-risk';
        }
        return 'ecg-assessment';
      }
    },
    'ecg-assessment': {
      id: 'ecg-assessment',
      title: 'ECG Assessment',
      description: 'Evaluate ECG findings',
      question: 'Are any of the following present on ECG?',
      parameters: [
        {
          id: 'stElevation',
          name: 'ST-segment elevation',
          type: 'boolean',
          tooltip: 'ST-segment elevation ≥1 mm in two or more contiguous leads',
          storable: false,
        },
        {
          id: 'stDepression',
          name: 'ST-segment depression',
          type: 'boolean',
          tooltip: 'ST-segment depression ≥0.5 mm in two or more contiguous leads',
          storable: false,
        },
        {
          id: 'tWaveInversion',
          name: 'T-wave inversion',
          type: 'boolean',
          tooltip: 'New T-wave inversion in two or more contiguous leads',
          storable: false,
        },
        {
          id: 'newLBBB',
          name: 'New LBBB',
          type: 'boolean',
          tooltip: 'New left bundle branch block',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.stElevation || inputs.newLBBB) {
          return 'stemi';
        }
        if (inputs.stDepression || inputs.tWaveInversion) {
          return 'high-risk';
        }
        return 'risk-factor-assessment';
      }
    },
    'risk-factor-assessment': {
      id: 'risk-factor-assessment',
      title: 'Risk Factor Assessment',
      description: 'Evaluate cardiac risk factors',
      question: 'Does the patient have any of the following risk factors?',
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
          id: 'diabetes',
          name: 'Diabetes',
          type: 'boolean',
          tooltip: 'Diagnosed diabetes mellitus',
          storable: true,
        },
        {
          id: 'cad',
          name: 'Known CAD',
          type: 'boolean',
          tooltip: 'Known coronary artery disease or prior MI',
          storable: true,
        },
        {
          id: 'multipleRiskFactors',
          name: '≥3 cardiac risk factors',
          type: 'boolean',
          tooltip: 'Hypertension, hyperlipidemia, smoking, family history, etc.',
          storable: false,
        },
        {
          id: 'aspirin',
          name: 'Aspirin use in last 7 days',
          type: 'boolean',
          tooltip: 'Patient has been taking aspirin regularly in the past week',
          storable: true,
        }
      ],
      nextStep: (inputs) => {
        let riskPoints = 0;
        if (inputs.age >= 65) riskPoints += 1;
        if (inputs.diabetes) riskPoints += 1;
        if (inputs.cad) riskPoints += 1;
        if (inputs.multipleRiskFactors) riskPoints += 1;
        if (!inputs.aspirin) riskPoints += 1;
        
        if (riskPoints >= 3) {
          return 'intermediate-risk';
        }
        return 'symptom-assessment';
      }
    },
    'symptom-assessment': {
      id: 'symptom-assessment',
      title: 'Symptom Assessment',
      description: 'Evaluate chest pain characteristics',
      question: 'Characterize the chest pain:',
      parameters: [
        {
          id: 'painCharacter',
          name: 'Pain character',
          type: 'select',
          options: [
            { value: 'pressure', label: 'Pressure/squeezing' },
            { value: 'sharp', label: 'Sharp/stabbing' },
            { value: 'burning', label: 'Burning' },
            { value: 'dull', label: 'Dull ache' }
          ],
          tooltip: 'The quality of the chest pain',
          storable: false,
        },
        {
          id: 'painRadiation',
          name: 'Pain radiation',
          type: 'boolean',
          tooltip: 'Pain radiates to jaw, neck, arms, or back',
          storable: false,
        },
        {
          id: 'exertional',
          name: 'Exertional',
          type: 'boolean',
          tooltip: 'Pain occurs or worsens with exertion',
          storable: false,
        },
        {
          id: 'similarPrior',
          name: 'Similar to prior cardiac event',
          type: 'boolean',
          tooltip: 'Pain is similar to previous confirmed cardiac event',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (
          inputs.painCharacter === 'pressure' || 
          inputs.painRadiation || 
          inputs.exertional || 
          inputs.similarPrior
        ) {
          return 'intermediate-risk';
        }
        return 'low-risk';
      }
    }
  },
  results: {
    'stemi': {
      title: 'STEMI Pathway',
      description: 'ST-Elevation Myocardial Infarction identified',
      recommendation: 'Immediate cardiology consultation for primary PCI. Administer aspirin, consider P2Y12 inhibitor, and prepare for cardiac catheterization.',
      severity: 'very-high',
      additionalData: {
        timeTarget: 'Door-to-balloon time <90 minutes',
        medications: ['Aspirin 325mg', 'P2Y12 inhibitor (e.g., ticagrelor)', 'Anticoagulation']
      }
    },
    'high-risk': {
      title: 'High-Risk ACS Pathway',
      description: 'High-risk features for Acute Coronary Syndrome',
      recommendation: 'Urgent cardiology consultation, serial troponins, and admission to cardiac monitoring unit. Consider early invasive strategy.',
      severity: 'high',
      additionalData: {
        monitoring: 'Continuous cardiac monitoring',
        labTests: ['Serial troponins q3h', 'BMP', 'CBC'],
        medications: ['Aspirin', 'Anticoagulation', 'Consider P2Y12 inhibitor']
      }
    },
    'intermediate-risk': {
      title: 'Intermediate-Risk Pathway',
      description: 'Intermediate risk for Acute Coronary Syndrome',
      recommendation: 'Serial troponins, consider observation unit admission, and non-invasive cardiac testing within 24-72 hours if troponins negative.',
      severity: 'moderate',
      additionalData: {
        disposition: 'Observation unit or short-stay unit',
        testing: 'Consider stress test or CCTA if troponins negative',
        followUp: 'Cardiology follow-up within 1 week if discharged'
      }
    },
    'low-risk': {
      title: 'Low-Risk Pathway',
      description: 'Low risk for Acute Coronary Syndrome',
      recommendation: 'Consider single troponin, non-cardiac causes of chest pain, and possible discharge with outpatient follow-up if appropriate.',
      severity: 'low',
      additionalData: {
        considerations: 'Consider non-cardiac causes: GERD, musculoskeletal, anxiety',
        testing: 'Consider outpatient testing if indicated',
        followUp: 'Primary care follow-up within 1-2 weeks'
      }
    }
  }
};

// Example algorithm: Stroke Workup
export const strokeWorkupAlgorithm: AlgorithmDefinition = {
  id: 'stroke-workup',
  name: 'Acute Stroke Workup Algorithm',
  description: 'Guides the initial assessment and management of patients with suspected acute stroke',
  category: 'Neurology',
  initialStep: 'time-assessment',
  steps: {
    'time-assessment': {
      id: 'time-assessment',
      title: 'Time Assessment',
      description: 'Determine time of symptom onset',
      question: 'When did the symptoms begin?',
      parameters: [
        {
          id: 'lastKnownWell',
          name: 'Last known well time',
          type: 'select',
          options: [
            { value: 'less-than-4.5', label: 'Less than 4.5 hours ago' },
            { value: '4.5-to-24', label: 'Between 4.5 and 24 hours ago' },
            { value: 'more-than-24', label: 'More than 24 hours ago' },
            { value: 'unknown', label: 'Unknown time of onset' },
            { value: 'wake-up', label: 'Wake-up stroke (symptoms present upon awakening)' }
          ],
          tooltip: 'Time since patient was last known to be at neurological baseline',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.lastKnownWell === 'less-than-4.5') {
          return 'initial-assessment';
        } else if (inputs.lastKnownWell === '4.5-to-24' || inputs.lastKnownWell === 'wake-up') {
          return 'thrombectomy-assessment';
        } else {
          return 'beyond-window';
        }
      }
    },
    'initial-assessment': {
      id: 'initial-assessment',
      title: 'Initial Assessment',
      description: 'Assess for tPA eligibility',
      question: 'Does the patient have any absolute contraindications to tPA?',
      parameters: [
        {
          id: 'intracranialHemorrhage',
          name: 'Known or suspected intracranial hemorrhage',
          type: 'boolean',
          tooltip: 'Any evidence of intracranial bleeding on imaging',
          storable: false,
        },
        {
          id: 'recentSurgery',
          name: 'Major surgery within 14 days',
          type: 'boolean',
          tooltip: 'Any major surgical procedure within the past 14 days',
          storable: false,
        },
        {
          id: 'recentStroke',
          name: 'Stroke or serious head trauma within 3 months',
          type: 'boolean',
          tooltip: 'Previous stroke or serious head injury within the past 3 months',
          storable: false,
        },
        {
          id: 'activeBleeding',
          name: 'Active internal bleeding',
          type: 'boolean',
          tooltip: 'Current internal bleeding (e.g., GI bleed, hematuria)',
          storable: false,
        },
        {
          id: 'platelets',
          name: 'Platelet count',
          type: 'number',
          unit: 'K/μL',
          tooltip: 'Current platelet count',
          storable: true,
        },
        {
          id: 'inr',
          name: 'INR',
          type: 'number',
          tooltip: 'Current International Normalized Ratio',
          storable: true,
        }
      ],
      nextStep: (inputs) => {
        if (
          inputs.intracranialHemorrhage || 
          inputs.recentSurgery || 
          inputs.recentStroke || 
          inputs.activeBleeding ||
          (inputs.platelets && inputs.platelets < 100) ||
          (inputs.inr && inputs.inr > 1.7)
        ) {
          return 'tpa-contraindicated';
        }
        return 'nihss-assessment';
      }
    },
    'nihss-assessment': {
      id: 'nihss-assessment',
      title: 'Stroke Severity Assessment',
      description: 'Assess stroke severity using NIHSS',
      question: 'What is the patient\'s NIHSS score?',
      parameters: [
        {
          id: 'nihssScore',
          name: 'NIHSS Score',
          type: 'number',
          tooltip: 'National Institutes of Health Stroke Scale score (0-42)',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.nihssScore >= 6) {
          return 'lvo-assessment';
        }
        return 'tpa-eligible';
      }
    },
    'lvo-assessment': {
      id: 'lvo-assessment',
      title: 'Large Vessel Occlusion Assessment',
      description: 'Assess for large vessel occlusion',
      question: 'Is there evidence of large vessel occlusion on CTA?',
      parameters: [
        {
          id: 'lvoPresent',
          name: 'Large vessel occlusion present',
          type: 'boolean',
          tooltip: 'Occlusion of internal carotid artery, M1, or basilar artery',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.lvoPresent) {
          return 'thrombectomy-candidate';
        }
        return 'tpa-eligible';
      }
    },
    'thrombectomy-assessment': {
      id: 'thrombectomy-assessment',
      title: 'Extended Window Assessment',
      description: 'Assess for thrombectomy eligibility in extended time window',
      question: 'Is there evidence of salvageable tissue on advanced imaging?',
      parameters: [
        {
          id: 'lvoPresent',
          name: 'Large vessel occlusion present',
          type: 'boolean',
          tooltip: 'Occlusion of internal carotid artery, M1, or basilar artery',
          storable: false,
        },
        {
          id: 'infarctCore',
          name: 'Infarct core volume',
          type: 'number',
          unit: 'mL',
          tooltip: 'Volume of irreversibly damaged brain tissue',
          storable: false,
        },
        {
          id: 'mismatchRatio',
          name: 'Mismatch ratio',
          type: 'number',
          tooltip: 'Ratio of perfusion deficit to infarct core',
          storable: false,
        }
      ],
      nextStep: (inputs) => {
        if (inputs.lvoPresent && inputs.infarctCore < 70 && inputs.mismatchRatio > 1.8) {
          return 'extended-thrombectomy';
        }
        return 'beyond-window';
      }
    }
  },
  results: {
    'tpa-eligible': {
      title: 'tPA Eligible',
      description: 'Patient is eligible for intravenous thrombolysis',
      recommendation: 'Administer IV tPA at 0.9 mg/kg (max 90 mg) with 10% as bolus and remainder over 60 minutes. Monitor in ICU or stroke unit.',
      severity: 'high',
      additionalData: {
        timeTarget: 'Door-to-needle time <60 minutes',
        monitoring: 'Frequent neurological checks, BP control <180/105 mmHg',
        followUp: 'Repeat brain imaging at 24 hours before starting antithrombotics'
      }
    },
    'thrombectomy-candidate': {
      title: 'Thrombectomy Candidate',
      description: 'Patient is eligible for mechanical thrombectomy',
      recommendation: 'Administer IV tPA if eligible, and arrange immediate transfer to thrombectomy-capable center if not already at one.',
      severity: 'very-high',
      additionalData: {
        timeTarget: 'Door-to-groin puncture <90 minutes',
        transfer: 'If transfer needed, initiate immediately with direct communication to receiving neurointerventionalist',
        followUp: 'Post-procedure ICU monitoring'
      }
    },
    'extended-thrombectomy': {
      title: 'Extended Window Thrombectomy',
      description: 'Patient is eligible for thrombectomy in extended time window',
      recommendation: 'Arrange immediate transfer to thrombectomy-capable center if not already at one.',
      severity: 'high',
      additionalData: {
        timeWindow: 'Treatment up to 24 hours from last known well',
        imaging: 'Based on favorable advanced imaging (small core, large penumbra)',
        followUp: 'Post-procedure ICU monitoring'
      }
    },
    'tpa-contraindicated': {
      title: 'tPA Contraindicated',
      description: 'Patient has contraindications to intravenous thrombolysis',
      recommendation: 'Assess for thrombectomy eligibility if large vessel occlusion present. Otherwise, provide supportive care and secondary prevention.',
      severity: 'moderate',
      additionalData: {
        alternatives: 'Consider thrombectomy if LVO present',
        care: 'Admit to stroke unit for monitoring and supportive care',
        prevention: 'Initiate appropriate antithrombotics after 24 hours if no hemorrhage'
      }
    },
    'beyond-window': {
      title: 'Beyond Treatment Window',
      description: 'Patient is beyond established treatment windows',
      recommendation: 'Provide supportive care, secondary stroke prevention, and rehabilitation assessment.',
      severity: 'low',
      additionalData: {
        care: 'Admit to stroke unit for monitoring and supportive care',
        workup: 'Complete stroke etiology workup',
        prevention: 'Initiate appropriate secondary prevention measures'
      }
    }
  }
};

// List of all available algorithms
export const algorithms: AlgorithmDefinition[] = [
  chestPainAlgorithm,
  strokeWorkupAlgorithm,
  // Add more algorithms here as they are implemented
];

// Helper function to get an algorithm by ID
export function getAlgorithmById(id: string): AlgorithmDefinition | undefined {
  return algorithms.find(algo => algo.id === id);
}