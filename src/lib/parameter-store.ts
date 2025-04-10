import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoredParameter {
  id: string;
  name: string;
  value: any;
  unit?: string;
  timestamp: number;
}

interface ParameterStore {
  parameters: StoredParameter[];
  addParameter: (parameter: Omit<StoredParameter, 'timestamp'>) => void;
  removeParameter: (id: string) => void;
  clearParameters: () => void;
  getParameterValue: (id: string) => any | undefined;
}

export const useParameterStore = create<ParameterStore>()(
  persist(
    (set, get) => ({
      parameters: [],
      
      addParameter: (parameter) => {
        set((state) => {
          // Check if parameter already exists
          const existingIndex = state.parameters.findIndex(p => p.id === parameter.id);
          
          if (existingIndex >= 0) {
            // Update existing parameter
            const updatedParameters = [...state.parameters];
            updatedParameters[existingIndex] = {
              ...parameter,
              timestamp: Date.now(),
            };
            return { parameters: updatedParameters };
          } else {
            // Add new parameter
            return {
              parameters: [
                ...state.parameters,
                {
                  ...parameter,
                  timestamp: Date.now(),
                },
              ],
            };
          }
        });
      },
      
      removeParameter: (id) => {
        set((state) => ({
          parameters: state.parameters.filter(p => p.id !== id),
        }));
      },
      
      clearParameters: () => {
        set({ parameters: [] });
      },
      
      getParameterValue: (id) => {
        const parameter = get().parameters.find(p => p.id === id);
        return parameter?.value;
      },
    }),
    {
      name: 'clinical-calculator-parameters',
    }
  )
);