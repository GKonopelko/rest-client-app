import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeGeneratorModal from './CodeGeneratorModal';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/utils/codeGenerator', () => ({
  generateCode: vi.fn(),
}));

const { generateCode } = await import('@/utils/codeGenerator');

describe('CodeGeneratorModal Component', () => {
  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    method: 'GET',
    interpolatedValues: {
      interpolatedUrl: 'https://api.example.com/users',
      interpolatedHeaders: '{"Content-Type": "application/json"}',
      interpolatedBody: '{"name": "test"}',
      hasUnresolvedVars: false,
      unresolvedVars: [],
    },
    errorMessages: {
      unresolvedVariablesError: 'Unresolved variables: {vars}',
      invalidHeadersFormat: 'Invalid headers format',
      generationError: 'Error generating {lang} code: {error}',
      unknownError: 'Unknown error',
      generalGenerationError: 'General error: {error}',
    },
    translations: {
      modalTitle: 'Code Generator',
      closeButton: 'Close',
      generatingCode: 'Generating code...',
      codeNotAvailable: 'Code not available',
      generatingAllLanguages: 'Generating code for all languages...',
      codeForRequestTemplate: 'Code for {method} request in {language}',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (generateCode as Mock).mockReturnValue(
      'curl -X GET https://api.example.com'
    );
  });

  const renderModal = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(<CodeGeneratorModal {...mergedProps} />);
  };

  it('renders modal with title and language selector', async () => {
    renderModal();

    await waitFor(() => {
      expect(screen.getByText('Code Generator')).toBeInTheDocument();
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls generateAllCodes when modal becomes visible', async () => {
    renderModal();

    await waitFor(() => {
      expect(generateCode).toHaveBeenCalled();
    });
  });

  it('does not call generateAllCodes when modal is not visible', () => {
    renderModal({ isVisible: false });
    expect(generateCode).not.toHaveBeenCalled();
  });

  it('shows error message when there are unresolved variables', async () => {
    renderModal({
      interpolatedValues: {
        ...defaultProps.interpolatedValues,
        hasUnresolvedVars: true,
        unresolvedVars: ['var1', 'var2'],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText('Unresolved variables: var1, var2')
      ).toBeInTheDocument();
    });
  });

  it('shows error message for invalid headers format', async () => {
    renderModal({
      interpolatedValues: {
        ...defaultProps.interpolatedValues,
        interpolatedHeaders: 'invalid-json',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid headers format')).toBeInTheDocument();
    });
  });

  it('displays generated code for selected language', async () => {
    (generateCode as Mock).mockReturnValue(
      'curl -X GET https://api.example.com'
    );

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText('curl -X GET https://api.example.com')
      ).toBeInTheDocument();
    });
  });

  it('handles language change', async () => {
    (generateCode as Mock)
      .mockReturnValueOnce('curl code')
      .mockReturnValueOnce('javascript code');

    renderModal();

    await waitFor(() => {
      expect(screen.getByText('curl code')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const option = await screen.findByText('JavaScript (Fetch)');
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('javascript code')).toBeInTheDocument();
    });
  });

  it('displays generation error for specific language', async () => {
    (generateCode as Mock).mockImplementation(() => {
      throw new Error('Generation failed');
    });

    renderModal();

    await waitFor(() => {
      expect(
        screen.getByText(/Error generating .* code: Generation failed/)
      ).toBeInTheDocument();
    });
  });

  it('shows code title with method and language', async () => {
    (generateCode as Mock).mockReturnValue('test code');

    renderModal({ method: 'POST' });

    await waitFor(() => {
      expect(
        screen.getByText('Code for POST request in cURL')
      ).toBeInTheDocument();
    });
  });
});
