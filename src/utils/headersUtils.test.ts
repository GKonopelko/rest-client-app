import {
  Header,
  headersArrayToObject,
  headersObjectToArray,
  headersArrayToString,
  headersStringToArray,
} from './headersUtils';
import { describe, it, expect } from 'vitest';

describe('headersUtils', () => {
  const mockHeaders: Header[] = [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer token' },
    { key: '  ', value: 'empty key' }, // Should be filtered
    { key: 'Accept', value: '' },
  ];

  describe('headersArrayToObject', () => {
    it('should convert headers array to object', () => {
      const result = headersArrayToObject(mockHeaders);

      expect(result).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        Accept: '',
      });
    });

    it('should handle empty array', () => {
      const result = headersArrayToObject([]);
      expect(result).toEqual({});
    });

    it('should filter headers with empty keys', () => {
      const headersWithEmptyKey: Header[] = [
        { key: '', value: 'value1' },
        { key: '   ', value: 'value2' },
        { key: 'Valid-Key', value: 'value3' },
      ];

      const result = headersArrayToObject(headersWithEmptyKey);
      expect(result).toEqual({ 'Valid-Key': 'value3' });
    });
  });

  describe('headersObjectToArray', () => {
    it('should convert headers object to array', () => {
      const headersObj = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      };

      const result = headersObjectToArray(headersObj);

      expect(result).toEqual([
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer token' },
      ]);
    });

    it('should handle empty object', () => {
      const result = headersObjectToArray({});
      expect(result).toEqual([]);
    });
  });

  describe('headersArrayToString', () => {
    it('should convert headers array to formatted JSON string', () => {
      const result = headersArrayToString(mockHeaders);

      expect(result).toBe(`{
  "Content-Type": "application/json",
  "Authorization": "Bearer token",
  "Accept": ""
}`);
    });

    it('should handle empty array', () => {
      const result = headersArrayToString([]);
      expect(result).toBe('{}');
    });
  });

  describe('headersStringToArray', () => {
    it('should convert valid JSON string to headers array', () => {
      const jsonString = `{
  "Content-Type": "application/json",
  "Authorization": "Bearer token"
}`;

      const result = headersStringToArray(jsonString);

      expect(result).toEqual([
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer token' },
      ]);
    });

    it('should return empty array for invalid JSON', () => {
      const result = headersStringToArray('invalid json');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = headersStringToArray('');
      expect(result).toEqual([]);
    });

    it('should handle empty object', () => {
      const result = headersStringToArray('{}');
      expect(result).toEqual([]);
    });
  });
});
