import { render, screen } from '@testing-library/react';
import VariablesInfo from './VariablesInfo';
import { hasVariables } from '@/utils/variablesUtils';
import { useTranslations } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/utils/variablesUtils', () => ({
  hasVariables: vi.fn(),
  Variable: vi.fn(),
}));

describe('VariablesInfo Component', () => {
  const mockUseTranslations = vi.fn();
  const mockHasVariables = vi.mocked(hasVariables);

  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        variablesInfo: 'Variables Information',
        variablesFormat: 'Use the format',
        availableVariables: 'Available variables:',
        containsVariables: 'Contains variables that will be replaced',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof VariablesInfo>> = {}
  ) => {
    const defaultProps: React.ComponentProps<typeof VariablesInfo> = {
      url: '',
      headers: {},
      body: '',
      variables: [],
      ...props,
    };

    return render(<VariablesInfo {...defaultProps} />);
  };

  it('renders variables information title and format', () => {
    renderComponent();

    expect(screen.getByText('Variables Information')).toBeInTheDocument();
    expect(screen.getByText('Use the format')).toBeInTheDocument();
    expect(screen.getByText('{{variableName}}')).toBeInTheDocument();
  });

  it('shows "None" when no variables are available', () => {
    renderComponent({ variables: [] });

    expect(screen.getByText('Available variables: None')).toBeInTheDocument();
  });

  it('shows available variables when provided', () => {
    const variables = [
      { id: '1', name: 'var1', value: 'value1' },
      { id: '2', name: 'var2', value: 'value2' },
    ];

    renderComponent({ variables });

    expect(
      screen.getByText('Available variables: {{var1}}, {{var2}}')
    ).toBeInTheDocument();
  });

  it('does not show warning when no variables are detected', () => {
    mockHasVariables.mockReturnValue(false);

    renderComponent();

    expect(
      screen.queryByText('Contains variables that will be replaced')
    ).not.toBeInTheDocument();
  });

  it('shows warning when variables are detected in URL', () => {
    mockHasVariables.mockImplementation((str: string) =>
      str.includes('{{test}}')
    );

    renderComponent({ url: 'https://api.com/{{test}}' });

    expect(
      screen.getByText('Contains variables that will be replaced')
    ).toBeInTheDocument();
  });

  it('shows warning when variables are detected in headers', () => {
    mockHasVariables.mockImplementation((str: string) =>
      str.includes('{{headerVar}}')
    );

    renderComponent({ headers: { Authorization: 'Bearer {{headerVar}}' } });

    expect(
      screen.getByText('Contains variables that will be replaced')
    ).toBeInTheDocument();
  });

  it('shows warning when variables are detected in body', () => {
    mockHasVariables.mockImplementation((str: string) =>
      str.includes('{{bodyVar}}')
    );

    renderComponent({ body: '{"key": "{{bodyVar}}"}' });

    expect(
      screen.getByText('Contains variables that will be replaced')
    ).toBeInTheDocument();
  });

  it('shows warning when variables are detected in multiple places', () => {
    mockHasVariables.mockImplementation(
      (str: string) => str.includes('{{test}}') || str.includes('{{bodyVar}}')
    );

    renderComponent({
      url: 'https://api.com/{{test}}',
      body: '{"key": "{{bodyVar}}"}',
    });

    expect(
      screen.getByText('Contains variables that will be replaced')
    ).toBeInTheDocument();
  });

  it('handles empty headers object', () => {
    renderComponent({ headers: {} });
    expect(screen.getByText('Available variables: None')).toBeInTheDocument();
  });

  it('handles empty body string', () => {
    renderComponent({ body: '' });
    expect(screen.getByText('Available variables: None')).toBeInTheDocument();
  });

  it('handles variables with special characters in names', () => {
    const variables = [
      { id: '1', name: 'var_with_underscore', value: 'value1' },
      { id: '2', name: 'var-with-dash', value: 'value2' },
    ];

    renderComponent({ variables });

    expect(
      screen.getByText(
        'Available variables: {{var_with_underscore}}, {{var-with-dash}}'
      )
    ).toBeInTheDocument();
  });
});
