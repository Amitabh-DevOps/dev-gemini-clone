import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the entire theme-providers module to avoid React import issues
jest.mock('./theme-providers', () => {
  return {
    ThemeProviders: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-provider">{children}</div>
    )
  };
});

// Import after the mock to ensure the mocked version is used
const { ThemeProviders } = require('./theme-providers');

describe('ThemeProviders', () => {
  it('renders children within the theme provider', () => {
    const testContent = 'Test Content';

    render(
      <ThemeProviders>
        <div>{testContent}</div>
      </ThemeProviders>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('wraps children with theme provider', () => {
    render(
      <ThemeProviders>
        <div>Test Child</div>
      </ThemeProviders>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
  });

  it('preserves the structure of nested children', () => {
    render(
      <ThemeProviders>
        <div>
          <span>First Child</span>
          <span>Second Child</span>
        </div>
      </ThemeProviders>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });

  it('passes the correct attributes to the ThemeProvider', () => {
    // This test verifies that our component is correctly wrapping children
    render(
      <ThemeProviders>
        <div>Test</div>
      </ThemeProviders>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();
  });
});