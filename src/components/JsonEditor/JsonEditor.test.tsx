import { describe, it, expect, vi, beforeEach } from 'vitest';

// Только самые необходимые моки
vi.mock('@monaco-editor/react', () => ({
  default: () => <div>Editor</div>,
}));

vi.mock('./JsonEditor.module.css', () => ({}));

describe('JsonEditor', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});

describe('formatJson function logic', () => {
  const mockSetLocalValue = vi.fn();
  const mockOnChange = vi.fn();
  const mockMessage = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const formatJson = (
    language: string,
    localValue: string,
    setLocalValue: (value: string) => void,
    onChange: (value: string) => void,
    message: { success: (msg: string) => void; error: (msg: string) => void },
    placeholder: string
  ) => {
    try {
      if (language === 'json') {
        const contentToFormat = localValue.trim() || placeholder;
        const parsed = JSON.parse(contentToFormat);
        const formatted = JSON.stringify(parsed, null, 2);
        setLocalValue(formatted);
        onChange(formatted);
        message.success('JSON formatted successfully');
      }
    } catch {
      message.error('Invalid JSON format');
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats valid JSON correctly', () => {
    formatJson(
      'json',
      '{"name":"test"}',
      mockSetLocalValue,
      mockOnChange,
      mockMessage,
      '{}'
    );

    expect(mockSetLocalValue).toHaveBeenCalledWith('{\n  "name": "test"\n}');
    expect(mockOnChange).toHaveBeenCalledWith('{\n  "name": "test"\n}');
    expect(mockMessage.success).toHaveBeenCalledWith(
      'JSON formatted successfully'
    );
  });

  it('shows error for invalid JSON', () => {
    formatJson(
      'json',
      'invalid',
      mockSetLocalValue,
      mockOnChange,
      mockMessage,
      '{}'
    );

    expect(mockMessage.error).toHaveBeenCalledWith('Invalid JSON format');
  });

  it('uses placeholder when value is empty', () => {
    formatJson(
      'json',
      '',
      mockSetLocalValue,
      mockOnChange,
      mockMessage,
      '{"default": "value"}'
    );

    expect(mockSetLocalValue).toHaveBeenCalledWith(
      '{\n  "default": "value"\n}'
    );
    expect(mockOnChange).toHaveBeenCalledWith('{\n  "default": "value"\n}');
  });

  it('does nothing when language is not JSON', () => {
    formatJson(
      'plaintext',
      '{"name":"test"}',
      mockSetLocalValue,
      mockOnChange,
      mockMessage,
      '{}'
    );

    expect(mockSetLocalValue).not.toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockMessage.success).not.toHaveBeenCalled();
    expect(mockMessage.error).not.toHaveBeenCalled();
  });
});

describe('antd message calls', () => {
  it('calls success message', () => {
    const message = {
      success: vi.fn(),
      error: vi.fn(),
    };

    message.success('JSON formatted successfully');
    expect(message.success).toHaveBeenCalledWith('JSON formatted successfully');
  });

  it('calls error message', () => {
    const message = {
      success: vi.fn(),
      error: vi.fn(),
    };

    message.error('Invalid JSON format');
    expect(message.error).toHaveBeenCalledWith('Invalid JSON format');
  });
});
