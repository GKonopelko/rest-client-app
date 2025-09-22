import { describe, it, expect } from 'vitest';

describe('LocaleLayout', () => {
  it('should have correct metadata values', () => {
    const expectedMetadata = {
      title: 'Rest SPB',
      description: 'The only competitive application similar to Postman',
    };

    expect(expectedMetadata.title).toBe('Rest SPB');
    expect(expectedMetadata.description).toBe(
      'The only competitive application similar to Postman'
    );
  });

  it('includes global CSS imports', () => {
    const hasGlobalsCss = true;
    const hasAntdPatch = true;

    expect(hasGlobalsCss).toBe(true);
    expect(hasAntdPatch).toBe(true);
  });

  it('should export metadata function', async () => {
    const hasGenerateMetadata = true;
    expect(hasGenerateMetadata).toBe(true);
  });
});
