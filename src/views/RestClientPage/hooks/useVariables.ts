import { useState, useEffect } from 'react';
import {
  Variable,
  loadVariablesFromStorage,
  saveVariablesToStorage,
} from '@/utils/variablesUtils';

export const useVariables = () => {
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);
  }, []);

  const updateVariables = (newVariables: Variable[]) => {
    setVariables(newVariables);
    saveVariablesToStorage(newVariables);
  };

  return { variables, updateVariables };
};
