import { renderHook, act } from '@testing-library/react';
import { useVariables } from './useVariables';
import { describe, it, expect, vi } from 'vitest';
import {
  loadVariablesFromStorage,
  saveVariablesToStorage,
  type Variable,
} from '@/utils/variablesUtils';

vi.mock('@/utils/variablesUtils', () => ({
  loadVariablesFromStorage: vi.fn(() => []),
  saveVariablesToStorage: vi.fn(),
}));

describe('useVariables', () => {
  it('should initialize with empty variables', () => {
    const { result } = renderHook(() => useVariables());

    expect(result.current.variables).toEqual([]);
    expect(typeof result.current.updateVariables).toBe('function');
  });

  it('should update variables and save to storage', () => {
    const saveVariablesToStorageMock = vi.fn();
    vi.mocked(saveVariablesToStorage).mockImplementation(
      saveVariablesToStorageMock
    );

    const { result } = renderHook(() => useVariables());

    const newVariables: Variable[] = [
      { id: '1', name: 'test', value: 'value' },
    ];

    act(() => {
      result.current.updateVariables(newVariables);
    });

    expect(result.current.variables).toEqual(newVariables);
    expect(saveVariablesToStorageMock).toHaveBeenCalledWith(newVariables);
  });

  it('should load variables from storage on mount', () => {
    const savedVariables: Variable[] = [
      { id: '1', name: 'saved', value: 'value' },
    ];
    vi.mocked(loadVariablesFromStorage).mockReturnValue(savedVariables);

    const { result } = renderHook(() => useVariables());

    expect(result.current.variables).toEqual(savedVariables);
  });
});
