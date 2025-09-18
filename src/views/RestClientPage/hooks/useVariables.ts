import { useState, useEffect } from 'react';
import { Variable, loadVariablesFromStorage } from '@/utils/variablesUtils';

export const useVariables = () => {
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    const savedVariables = loadVariablesFromStorage();
    setVariables(savedVariables);
  }, []);

  return { variables };
};
