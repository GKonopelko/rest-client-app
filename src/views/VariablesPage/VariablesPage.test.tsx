import { render, screen, fireEvent } from '@testing-library/react';
import VariablesPage from './VariablesPage';
import { useTranslations } from 'next-intl';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { message } from 'antd';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import {
  isValidVariableName as mockIsValidVariableName,
  validateVariableValue as mockValidateVariableValue,
} from '@/utils/variablesUtils';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(),
}));

vi.mock('antd', () => ({
  Button: ({
    children,
    onClick,
    icon,
    type,
    danger,
    size,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    icon: React.ReactNode;
    type?: string;
    danger?: boolean;
    size?: string;
  }) => (
    <button
      onClick={onClick}
      data-type={type}
      data-danger={danger}
      data-size={size}
    >
      {icon}
      {children}
    </button>
  ),
  Input: ({
    placeholder,
    value,
    onChange,
    onBlur,
    className,
    status,
  }: {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    className?: string;
    status?: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={className}
      data-status={status}
    />
  ),
  Table: ({
    columns,
    dataSource,
    rowKey,
    locale,
  }: {
    columns: Array<{
      key: string;
      dataIndex?: string;
      render?: (value: unknown, record: unknown) => React.ReactNode;
      title?: string;
    }>;
    dataSource: unknown[];
    rowKey: string;
    locale: { emptyText: string };
  }) => (
    <div data-testid="table">
      {dataSource.map((item: unknown) => (
        <div
          key={(item as { [key: string]: string })[rowKey]}
          data-testid="table-row"
        >
          {columns.map((column) => (
            <div key={column.key} data-testid={`column-${column.key}`}>
              {column.render
                ? column.render(
                    (item as { [key: string]: unknown })[
                      column.dataIndex as string
                    ],
                    item
                  )
                : String(
                    (item as { [key: string]: unknown })[
                      column.dataIndex as string
                    ] || ''
                  )}
            </div>
          ))}
        </div>
      ))}
      {dataSource.length === 0 && (
        <div data-testid="empty-table">{locale.emptyText}</div>
      )}
    </div>
  ),
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Title: ({
      children,
      level,
    }: {
      children: React.ReactNode;
      level?: number;
    }) => <div data-level={level}>{children}</div>,
  },
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span>+</span>,
  DeleteOutlined: () => <span>×</span>,
}));

vi.mock('@/utils/variablesUtils', () => ({
  isValidVariableName: vi.fn(),
  validateVariableValue: vi.fn(),
  STORAGE_KEY: 'test-variables',
}));

interface TestVariable {
  id: string;
  name: string;
  value: string;
}

describe('VariablesPage Component', () => {
  const mockUseTranslations = vi.fn();
  const mockSetVariables = vi.fn();
  const mockMessageError = vi.fn();
  const mockMessageSuccess = vi.fn();

  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    (useLocalStorage as Mock).mockReturnValue([[], mockSetVariables]);
    (message.error as Mock).mockImplementation(mockMessageError);
    (message.success as Mock).mockImplementation(mockMessageSuccess);

    vi.mocked(mockIsValidVariableName).mockReturnValue(true);
    vi.mocked(mockValidateVariableValue).mockReturnValue({
      isValid: true,
      message: '',
    });

    mockUseTranslations.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        title: 'Variables',
        description: 'Manage your variables',
        formatHint: 'format hint',
        addNew: 'Add New Variable',
        nameColumn: 'Name',
        valueColumn: 'Value',
        actionsColumn: 'Actions',
        namePlaceholder: 'Enter variable name',
        valuePlaceholder: 'Enter variable value',
        addButton: 'Add',
        deleteButton: 'Delete',
        yourVariables: 'Your Variables',
        noVariables: 'No variables',
        nameRequired: 'Name is required',
        valueRequired: 'Value is required',
        invalidName: 'Invalid name',
        duplicateName: 'Duplicate name',
        invalidValue: 'Invalid value',
        addSuccess: 'Variable added',
        deleteSuccess: 'Variable deleted',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderVariablesPage = (initialVariables: TestVariable[] = []) => {
    (useLocalStorage as Mock).mockReturnValue([
      initialVariables,
      mockSetVariables,
    ]);
    return render(<VariablesPage />);
  };

  it('renders the component with title and description', () => {
    renderVariablesPage();
    expect(screen.getByText('Variables')).toBeInTheDocument();
    expect(screen.getByText(/Manage your variables/)).toBeInTheDocument();
  });

  it('shows input fields and add button', () => {
    renderVariablesPage();
    expect(
      screen.getByPlaceholderText('Enter variable name')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter variable value')
    ).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('shows empty state when no variables exist', () => {
    renderVariablesPage();
    expect(screen.getByTestId('empty-table')).toBeInTheDocument();
    expect(screen.getByText('No variables')).toBeInTheDocument();
  });

  it('displays existing variables in table', () => {
    const variables = [
      { id: '1', name: 'testVar', value: 'testValue' },
      { id: '2', name: 'anotherVar', value: 'anotherValue' },
    ];
    renderVariablesPage(variables);

    const rows = screen.getAllByTestId('table-row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('{{testVar}}')).toBeInTheDocument();
    expect(screen.getByText('testValue')).toBeInTheDocument();
  });

  it('truncates long values in table', () => {
    const longValue = 'a'.repeat(60);
    renderVariablesPage([{ id: '1', name: 'test', value: longValue }]);

    expect(
      screen.getByText(`${longValue.substring(0, 50)}...`)
    ).toBeInTheDocument();
  });

  it('adds a new variable when form is valid', () => {
    renderVariablesPage();

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    const valueInput = screen.getByPlaceholderText('Enter variable value');
    const addButton = screen.getByText('Add');

    fireEvent.change(nameInput, { target: { value: 'newVar' } });
    fireEvent.change(valueInput, { target: { value: 'newValue' } });
    fireEvent.click(addButton);

    expect(mockSetVariables).toHaveBeenCalledWith(expect.any(Function));
    expect(mockMessageSuccess).toHaveBeenCalledWith('Variable added');
  });

  it('shows error when name is empty', () => {
    renderVariablesPage();

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    const addButton = screen.getByText('Add');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    fireEvent.click(addButton);

    expect(mockMessageError).toHaveBeenCalledWith('Name is required');
  });

  it('shows error when name is invalid', () => {
    vi.mocked(mockIsValidVariableName).mockReturnValue(false);
    renderVariablesPage();

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    const addButton = screen.getByText('Add');

    fireEvent.change(nameInput, { target: { value: 'invalid name' } });
    fireEvent.blur(nameInput);

    fireEvent.click(addButton);

    expect(mockMessageError).toHaveBeenCalledWith('Invalid name');
  });

  it('shows error when name is duplicate', () => {
    const variables = [{ id: '1', name: 'existingVar', value: 'value' }];
    renderVariablesPage(variables);

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    const addButton = screen.getByText('Add');

    fireEvent.change(nameInput, { target: { value: 'existingVar' } });
    fireEvent.blur(nameInput);

    fireEvent.click(addButton);

    expect(mockMessageError).toHaveBeenCalledWith('Duplicate name');
  });

  it('shows error when value is empty', () => {
    renderVariablesPage();

    const valueInput = screen.getByPlaceholderText('Enter variable value');
    const addButton = screen.getByText('Add');

    fireEvent.change(valueInput, { target: { value: '' } });
    fireEvent.blur(valueInput);

    fireEvent.click(addButton);

    expect(mockMessageError).toHaveBeenCalledWith('Value is required');
  });

  it('shows error when value is invalid', () => {
    vi.mocked(mockValidateVariableValue).mockReturnValue({
      isValid: false,
      message: 'Invalid value format',
    });
    renderVariablesPage();

    const valueInput = screen.getByPlaceholderText('Enter variable value');
    const addButton = screen.getByText('Add');

    fireEvent.change(valueInput, { target: { value: 'invalid value' } });
    fireEvent.blur(valueInput);

    fireEvent.click(addButton);

    expect(mockMessageError).toHaveBeenCalledWith('Invalid value format');
  });

  it('deletes a variable', () => {
    const variables = [{ id: '1', name: 'testVar', value: 'testValue' }];
    renderVariablesPage(variables);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockSetVariables).toHaveBeenCalledWith(expect.any(Function));
    expect(mockMessageSuccess).toHaveBeenCalledWith('Variable deleted');
  });

  it('clears input fields after successful addition', () => {
    renderVariablesPage();

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    const valueInput = screen.getByPlaceholderText('Enter variable value');
    const addButton = screen.getByText('Add');

    fireEvent.change(nameInput, { target: { value: 'newVar' } });
    fireEvent.change(valueInput, { target: { value: 'newValue' } });
    fireEvent.click(addButton);

    const setVariablesCallback = mockSetVariables.mock.calls[0][0];
    const newVariables = setVariablesCallback([]);
    expect(newVariables).toEqual([
      {
        id: expect.any(String),
        name: 'newVar',
        value: 'newValue',
      },
    ]);
  });

  it('validates name on blur', () => {
    renderVariablesPage();

    const nameInput = screen.getByPlaceholderText('Enter variable name');
    fireEvent.change(nameInput, { target: { value: 'test' } });
    fireEvent.blur(nameInput);

    expect(mockIsValidVariableName).toHaveBeenCalledWith('test');
  });

  it('validates value on blur', () => {
    renderVariablesPage();

    const valueInput = screen.getByPlaceholderText('Enter variable value');
    fireEvent.change(valueInput, { target: { value: 'test value' } });
    fireEvent.blur(valueInput);

    expect(mockValidateVariableValue).toHaveBeenCalledWith('test value');
  });
});
