export interface Variable {
  id: string;
  name: string;
  value: string;
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
  } catch (error) {
    console.error('Failed to save variables to local storage:', error);
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
