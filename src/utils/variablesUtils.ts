export interface Variable {
  id: string;
  name: string;
  value: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const STORAGE_KEY = 'superteam-spbrest-rest-client-variables';

export function interpolateVariables(
  text: string,
  variables: Variable[]
): string {
  if (!text || !variables.length) return text;

  return variables.reduce((result, variable) => {
    const pattern = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    return result.replace(pattern, variable.value);
  }, text);
}

export function extractVariableNames(text: string): string[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  const matches = text.match(pattern);
  if (!matches) return [];

  return matches.map((match) => match.replace(/\{\{|\}\}/g, '').trim());
}

export function hasVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

export function loadVariablesFromStorage(): Variable[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveVariablesToStorage(variables: Variable[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
  } catch (_error) {
    console.error('Failed to save variables to local storage:', _error);
  }
}

export function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function findUnusedVariables(
  text: string,
  variables: Variable[]
): string[] {
  const usedNames = extractVariableNames(text);
  const availableNames = variables.map((v) => v.name);
  return usedNames.filter((name) => !availableNames.includes(name));
}

export function validateVariableValue(value: string): ValidationResult {
  if (!value.trim()) {
    return { isValid: false, message: 'Value is required' };
  }

  if (value.includes('{{') || value.includes('}}')) {
    return {
      isValid: false,
      message: 'Value cannot contain variable syntax {{}}',
    };
  }

  if (value.length > 1000) {
    return {
      isValid: false,
      message: 'Value is too long (max 1000 characters)',
    };
  }

  if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
    try {
      JSON.parse(value);
      return {
        isValid: false,
        message:
          'Value appears to be JSON object. Use simple values for variables.',
      };
    } catch {
      // Not valid JSON
    }
  }

  const sensitivePatterns = [
    /password=/i,
    /token=/i,
    /api[_-]?key=/i,
    /secret=/i,
    /bearer\s+/i,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(value)) {
      return {
        isValid: false,
        message:
          'Value appears to contain sensitive information. Please be cautious.',
      };
    }
  }

  return { isValid: true };
}

export function validateAllVariables(): ValidationResult {
  try {
    const variables = loadVariablesFromStorage();

    for (const variable of variables) {
      if (!isValidVariableName(variable.name)) {
        return {
          isValid: false,
          message: `Invalid variable name: ${variable.name}`,
        };
      }

      const valueValidation = validateVariableValue(variable.value);
      if (!valueValidation.isValid) {
        return {
          isValid: false,
          message: `Invalid value for ${variable.name}: ${valueValidation.message}`,
        };
      }
    }

    return { isValid: true };
  } catch (_error) {
    return {
      isValid: false,
      message: 'Failed to validate variables',
    };
  }
}

export function getVariableByName(
  name: string,
  variables: Variable[]
): Variable | undefined {
  return variables.find((v) => v.name === name);
}

export function updateVariable(
  id: string,
  updates: Partial<Variable>,
  variables: Variable[]
): Variable[] {
  return variables.map((v) => (v.id === id ? { ...v, ...updates } : v));
}

export function exportVariables(variables: Variable[]): string {
  return JSON.stringify(variables, null, 2);
}

export function importVariables(
  jsonString: string
): ValidationResult & { variables?: Variable[] } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      return {
        isValid: false,
        message: 'Invalid format: expected array of variables',
      };
    }

    for (const item of parsed) {
      if (!item.id || !item.name || !item.value) {
        return {
          isValid: false,
          message: 'Invalid variable format: missing required fields',
        };
      }

      if (!isValidVariableName(item.name)) {
        return {
          isValid: false,
          message: `Invalid variable name: ${item.name}`,
        };
      }

      const valueValidation = validateVariableValue(item.value);
      if (!valueValidation.isValid) {
        return {
          isValid: false,
          message: `Invalid value for ${item.name}: ${valueValidation.message}`,
        };
      }
    }

    return { isValid: true, variables: parsed };
  } catch (_error) {
    return { isValid: false, message: 'Failed to parse JSON' };
  }
}

export function clearVariables(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_error) {
    console.error('Failed to clear variables from storage:', _error);
  }
}

export function getVariablesCount(): number {
  const variables = loadVariablesFromStorage();
  return variables.length;
}

export function isVariablesStorageEmpty(): boolean {
  return getVariablesCount() === 0;
}
