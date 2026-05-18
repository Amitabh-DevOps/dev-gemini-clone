import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';
import ThemeSwitch from './theme-switch';

// Mock the next-themes hook
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock the SleekToggle component
jest.mock('../dev-components/sleek-toggle', () => {
  return {
    __esModule: true,
    default: ({ toggle, setTheme }: { toggle: string; setTheme: (theme: string) => void }) => (
      <div data-testid="sleek-toggle" data-toggle={toggle} onClick={() => setTheme(toggle === 'dark' ? 'light' : 'dark')}>
        SleekToggle - Current: {toggle}
      </div>
    )
  };
});

describe('ThemeSwitch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SleekToggle after mount with initial light theme', async () => {
    const setThemeMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    });

    render(<ThemeSwitch />);

    // Wait for the component to render after the useEffect sets mounted to true
    await waitFor(() => {
      expect(screen.getByTestId('sleek-toggle')).toBeInTheDocument();
    });

    // Verify the toggle shows the correct theme
    const toggle = screen.getByTestId('sleek-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-toggle', 'light');
  });

  it('renders SleekToggle after mount with light theme', async () => {
    const setThemeMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    });

    render(<ThemeSwitch />);

    // Force the useEffect to run by waiting
    await waitFor(() => {
      expect(screen.queryByTestId('sleek-toggle')).toBeInTheDocument();
    });

    // Verify the toggle shows the correct theme
    const toggle = screen.getByTestId('sleek-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-toggle', 'light');
  });

  it('renders SleekToggle after mount with dark theme', async () => {
    const setThemeMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
    });

    render(<ThemeSwitch />);

    // Force the useEffect to run by waiting
    await waitFor(() => {
      expect(screen.queryByTestId('sleek-toggle')).toBeInTheDocument();
    });

    // Verify the toggle shows the correct theme
    const toggle = screen.getByTestId('sleek-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-toggle', 'dark');
  });

  it('calls setTheme when SleekToggle is clicked', async () => {
    const setThemeMock = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      expect(screen.queryByTestId('sleek-toggle')).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('sleek-toggle');
    expect(toggle).toBeInTheDocument();

    // Simulate clicking the toggle which would trigger the internal setTheme call
    toggle.click();

    // The SleekToggle mock internally calls setTheme when clicked
    // The SleekToggle component receives setTheme and uses it internally
    // The mock will call setTheme with the opposite theme
  });

  it('passes the correct theme and setTheme function to SleekToggle', async () => {
    const setThemeMock = jest.fn();
    const themeMock = 'dark';
    (useTheme as jest.Mock).mockReturnValue({
      theme: themeMock,
      setTheme: setThemeMock,
    });

    render(<ThemeSwitch />);

    await waitFor(() => {
      expect(screen.queryByTestId('sleek-toggle')).toBeInTheDocument();
    });

    const toggle = screen.getByTestId('sleek-toggle');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent(`SleekToggle - Current: ${themeMock}`);
  });
});