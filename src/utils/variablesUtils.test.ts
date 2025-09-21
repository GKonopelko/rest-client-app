import {
  interpolateVariables,
  extractVariableNames,
  hasVariables,
  loadVariablesFromStorage,
  saveVariablesToStorage,
  isValidVariableName,
  findUnusedVariables,
  validateVariableValue,
  validateAllVariables,
  getVariableByName,
  updateVariable,
  exportVariables,
  importVariables,
  clearVariables,
  getVariablesCount,
  isVariablesStorageEmpty,
  Variable,
  ValidationResult,
} from './variablesUtils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('variablesUtils', () => {
  const mockVariables: Variable[] = [
    { id: '1', name: 'API_URL', value: 'https://api.example.com' },
    { id: '2', name: 'API_KEY', value: 'secret123' },
    { id: '3', name: 'USER_ID', value: '12345' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('interpolateVariables', () => {
    it('should interpolate variables in text', () => {
      const text = 'API: {{API_URL}}, Key: {{API_KEY}}';
      const result = interpolateVariables(text, mockVariables);
      expect(result).toBe('API: https://api.example.com, Key: secret123');
    });

    it('should return original text if no variables', () => {
      const text = 'Just some text without variables';
      const result = interpolateVariables(text, mockVariables);
      expect(result).toBe(text);
    });

    it('should handle empty variables array', () => {
      const text = 'API: {{API_URL}}';
      const result = interpolateVariables(text, []);
      expect(result).toBe(text);
    });
  });

  describe('extractVariableNames', () => {
    it('should extract variable names from text', () => {
      const text = 'API: {{API_URL}}, Key: {{API_KEY}}, User: {{USER_ID}}';
      const result = extractVariableNames(text);
      expect(result).toEqual(['API_URL', 'API_KEY', 'USER_ID']);
    });

    it('should return empty array for text without variables', () => {
      const text = 'Just some text without variables';
      const result = extractVariableNames(text);
      expect(result).toEqual([]);
    });

    it('should handle malformed variable syntax', () => {
      const text = '{{INVALID} { {MALFORMED}} {{VALID}}';
      const result = extractVariableNames(text);
      expect(result).toEqual(['VALID']);
    });

    it('should handle empty text', () => {
      const result = extractVariableNames('');
      expect(result).toEqual([]);
    });
  });

  describe('hasVariables', () => {
    it('should detect variables in text', () => {
      const text = 'API: {{API_URL}}';
      const result = hasVariables(text);
      expect(result).toBe(true);
    });

    it('should return false for text without variables', () => {
      const text = 'Just some text';
      const result = hasVariables(text);
      expect(result).toBe(false);
    });
  });

  describe('loadVariablesFromStorage & saveVariablesToStorage', () => {
    it('should save and load variables from localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(null);

      saveVariablesToStorage(mockVariables);

      expect(setItemSpy).toHaveBeenCalledWith(
        'superteam-spbrest-rest-client-variables',
        JSON.stringify(mockVariables)
      );

      getItemSpy.mockReturnValue(JSON.stringify(mockVariables));
      const loaded = loadVariablesFromStorage();

      expect(loaded).toEqual(mockVariables);
      expect(getItemSpy).toHaveBeenCalledWith(
        'superteam-spbrest-rest-client-variables'
      );

      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
    });

    it('should handle localStorage errors during save', () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage failed');
        });

      expect(() => saveVariablesToStorage(mockVariables)).not.toThrow();
      expect(setItemSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
    });

    it('should handle localStorage errors during load', () => {
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage failed');
        });

      const result = loadVariablesFromStorage();
      expect(result).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith(
        'superteam-spbrest-rest-client-variables'
      );

      getItemSpy.mockRestore();
    });

    it('should handle invalid JSON in storage', () => {
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue('invalid json');

      const result = loadVariablesFromStorage();
      expect(result).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith(
        'superteam-spbrest-rest-client-variables'
      );

      getItemSpy.mockRestore();
    });
  });

  describe('isValidVariableName', () => {
    it('should validate variable names', () => {
      expect(isValidVariableName('API_URL')).toBe(true);
      expect(isValidVariableName('api_key')).toBe(true);
      expect(isValidVariableName('123')).toBe(false);
      expect(isValidVariableName('')).toBe(false);
      expect(isValidVariableName('API-URL')).toBe(false);
      expect(isValidVariableName('API URL')).toBe(false);
    });
  });

  describe('findUnusedVariables', () => {
    it('should find unused variables in text', () => {
      const variables: Variable[] = [
        { id: '1', name: 'USED', value: 'value1' },
        { id: '2', name: 'UNUSED', value: 'value2' },
      ];
      const text = '{{USED}} is used here';
      const result = findUnusedVariables(text, variables);

      expect(result).toEqual([]);
    });

    it('should return variables that are in text but not in variables array', () => {
      const variables: Variable[] = [
        { id: '1', name: 'EXISTING', value: 'value1' },
      ];
      const text = '{{EXISTING}} and {{MISSING}}';
      const result = findUnusedVariables(text, variables);
      expect(result).toEqual(['MISSING']);
    });
  });

  describe('validateVariableValue', () => {
    it('should validate variable values', () => {
      const result1 = validateVariableValue('valid value');
      expect(result1.isValid).toBe(true);

      const result2 = validateVariableValue('');
      expect(result2.isValid).toBe(false);

      const result3 = validateVariableValue('a'.repeat(1001));
      expect(result3.isValid).toBe(false);
    });

    it('should detect sensitive information', () => {
      const result1 = validateVariableValue('password=secret');
      expect(result1.isValid).toBe(false);

      const result2 = validateVariableValue('token=abc123');
      expect(result2.isValid).toBe(false);

      const result3 = validateVariableValue('api_key=value');
      expect(result3.isValid).toBe(false);
    });

    it('should reject JSON objects', () => {
      const result1 = validateVariableValue('{"key": "value"}');
      expect(result1.isValid).toBe(false); // JSON объекты должны возвращать false

      const result2 = validateVariableValue('{"nested": {"key": "value"}}');
      expect(result2.isValid).toBe(false); // Вложенные JSON объекты тоже
    });

    it('should accept JSON arrays', () => {
      const result = validateVariableValue('[1, 2, 3]');
      expect(result.isValid).toBe(true); // JSON массивы должны проходить проверку
    });

    it('should validate length', () => {
      const result1 = validateVariableValue('a'.repeat(1000));
      expect(result1.isValid).toBe(true);

      const result2 = validateVariableValue('a'.repeat(1001));
      expect(result2.isValid).toBe(false);
    });
  });

  describe('validateAllVariables', () => {
    it('should validate all variables in storage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify([{ id: '1', name: 'VALID', value: 'good value' }])
      );

      const result = validateAllVariables();
      expect(result.isValid).toBe(true);
    });

    it('should detect invalid variables', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify([{ id: '1', name: 'INVALID', value: '' }])
      );

      const result = validateAllVariables();
      expect(result.isValid).toBe(false);
    });
  });

  describe('getVariableByName', () => {
    it('should find variable by name', () => {
      const result = getVariableByName('API_URL', mockVariables);
      expect(result).toEqual(mockVariables[0]);
    });

    it('should return undefined for non-existent variable', () => {
      const result = getVariableByName('NON_EXISTENT', mockVariables);
      expect(result).toBeUndefined();
    });
  });

  describe('updateVariable', () => {
    it('should update variable by id', () => {
      const variables: Variable[] = [
        { id: '1', name: 'TEST', value: 'old-value' },
      ];
      const result = updateVariable('1', { value: 'new-value' }, variables);
      expect(result[0].value).toBe('new-value');
    });
  });

  describe('exportVariables & importVariables', () => {
    it('should export and import variables', () => {
      const exported = exportVariables(mockVariables);
      expect(exported).toBe(JSON.stringify(mockVariables, null, 2));

      const imported = importVariables(exported);
      expect(
        (imported as ValidationResult & { variables?: Variable[] }).variables
      ).toEqual(mockVariables);
    });

    it('should reject invalid JSON during import', () => {
      const result = importVariables('invalid json');
      expect(result).toEqual({
        isValid: false,
        message: 'Failed to parse JSON',
      });
    });

    it('should reject non-array data', () => {
      const result = importVariables(JSON.stringify({ not: 'array' }));
      expect(result).toEqual({
        isValid: false,
        message: 'Invalid format: expected array of variables',
      });
    });

    it('should validate imported variables', () => {
      const invalidVariables = [{ id: '1', name: 'TEST', value: '' }];
      const result = importVariables(JSON.stringify(invalidVariables));
      expect(result.isValid).toBe(false);
    });
  });

  describe('clearVariables', () => {
    it('should clear variables from storage', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      clearVariables();
      expect(removeItemSpy).toHaveBeenCalledWith(
        'superteam-spbrest-rest-client-variables'
      );
      removeItemSpy.mockRestore();
    });
  });

  describe('getVariablesCount & isVariablesStorageEmpty', () => {
    it('should count variables and check if empty', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify(mockVariables)
      );

      expect(getVariablesCount()).toBe(3);
      expect(isVariablesStorageEmpty()).toBe(false);

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify([])
      );
      expect(isVariablesStorageEmpty()).toBe(true);
    });
  });
});
