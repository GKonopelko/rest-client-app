import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import CodeGenerator from './CodeGenerator';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/utils/variablesUtils', () => ({
  interpolateVariables: vi.fn(),
  loadVariablesFromStorage: vi.fn(),
  extractVariableNames: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('./CodeGeneratorModal', () => ({
  default: vi.fn(() => null),
}));

const { interpolateVariables, loadVariablesFromStorage, extractVariableNames } =
  await import('@/utils/variablesUtils');

const mockUseTranslations = vi.fn();

describe('CodeGenerator Component', () => {
  const defaultProps = {
    method: 'POST',
    url: 'https://api.example.com/users',
    headers: '{"Content-Type":"application/json"}',
    body: '{"name":"John"}',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        generateCodeButton: 'Generate Code',
        modalTitle: 'Generated Code',
        closeButton: 'Close',
        generatingCode: 'Generating code...',
        codeNotAvailable: 'Code not available',
        generatingAllLanguages: 'Generating code for all languages...',
      };
      return translations[key] || key;
    });

    (loadVariablesFromStorage as Mock).mockReturnValue([]);
    (interpolateVariables as Mock).mockImplementation((value: string) => value);
    (extractVariableNames as Mock).mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) => {
    return render(<CodeGenerator {...defaultProps} {...props} />);
  };

  it('renders generate code button', () => {
    renderComponent();
    expect(screen.getByText('Generate Code')).toBeInTheDocument();
  });

  it('handles invalid JSON headers gracefully - no interpolation', () => {
    renderComponent({
      headers: 'invalid-json',
    });

    fireEvent.click(screen.getByText('Generate Code'));

    expect(interpolateVariables).not.toHaveBeenCalled();
  });

  it('handles valid JSON headers with interpolation', () => {
    renderComponent({
      headers: '{"Content-Type":"application/json"}',
    });

    fireEvent.click(screen.getByText('Generate Code'));

    expect(interpolateVariables).toHaveBeenCalledTimes(3);
  });

  it('uses external variables when provided', () => {
    const externalVariables = [{ name: 'token', value: 'secret' }];

    renderComponent({ variables: externalVariables });

    expect(loadVariablesFromStorage).not.toHaveBeenCalled();
  });

  it('loads variables from storage when no external variables provided', () => {
    renderComponent();

    expect(loadVariablesFromStorage).toHaveBeenCalled();
  });

  it('handles interpolation errors gracefully', () => {
    (interpolateVariables as Mock).mockImplementation(() => {
      throw new Error('Interpolation failed');
    });

    renderComponent();
    fireEvent.click(screen.getByText('Generate Code'));

    expect(interpolateVariables).toHaveBeenCalled();
  });

  it('detects unresolved variables', () => {
    (extractVariableNames as Mock).mockReturnValue(['unresolved_var']);

    renderComponent();
    fireEvent.click(screen.getByText('Generate Code'));

    expect(extractVariableNames).toHaveBeenCalled();
  });

  it('passes correct interpolated values to modal', () => {
    const interpolatedUrl = 'https://api.example.com/users';
    const interpolatedHeaders = '{"Content-Type":"application/json"}';
    const interpolatedBody = '{"name":"John"}';

    (interpolateVariables as Mock)
      .mockReturnValueOnce(interpolatedUrl)
      .mockReturnValueOnce(interpolatedHeaders)
      .mockReturnValueOnce(interpolatedBody);

    renderComponent();
    fireEvent.click(screen.getByText('Generate Code'));

    expect(interpolateVariables).toHaveBeenCalledWith(defaultProps.url, []);
    expect(interpolateVariables).toHaveBeenCalledWith(
      '{"Content-Type":"application/json"}',
      []
    );
    expect(interpolateVariables).toHaveBeenCalledWith(defaultProps.body, []);
  });

  it('handles empty headers and body', () => {
    renderComponent({
      headers: '',
      body: '',
    });

    fireEvent.click(screen.getByText('Generate Code'));
    expect(interpolateVariables).toHaveBeenCalled();
  });

  it('calls interpolateVariables with correct parameters', () => {
    const testVariables = [{ name: 'var1', value: 'value1' }];
    (loadVariablesFromStorage as Mock).mockReturnValue(testVariables);

    renderComponent();

    expect(interpolateVariables).toHaveBeenCalledWith(
      defaultProps.url,
      testVariables
    );
  });

  it('opens modal when button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Generate Code'));
    expect(screen.getByText('Generate Code')).toBeInTheDocument();
  });
});
