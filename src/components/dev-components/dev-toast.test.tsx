import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DevToast from './dev-toast';
import geminiZustand from '@/utils/gemini-zustand';
import { jest } from '@jest/globals';

// Mock the geminiZustand
jest.mock('@/utils/gemini-zustand');

describe('DevToast', () => {
  const mockSetToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for testing setTimeout
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: null,
      setToast: mockSetToast,
    });
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  it('should not render when devToast is null', () => {
    render(<DevToast />);

    const toastElement = screen.queryByTestId('dev-toast');
    expect(toastElement).not.toBeInTheDocument();
  });

  it('should render when devToast has a value', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: 'Test toast message',
      setToast: mockSetToast,
    });

    render(<DevToast />);

    const toastElement = screen.getByText('Test toast message');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveClass('dev-toast');
  });

  it('should display the correct toast message', () => {
    const toastMessage = 'This is a test toast';
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: toastMessage,
      setToast: mockSetToast,
    });

    render(<DevToast />);

    const toastElement = screen.getByText(toastMessage);
    expect(toastElement).toBeInTheDocument();
  });

  it('should have correct CSS classes applied', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: 'Test toast',
      setToast: mockSetToast,
    });

    render(<DevToast />);

    const toastElement = screen.getByText('Test toast');
    expect(toastElement).toHaveClass('bottom-6');
    expect(toastElement).toHaveClass('left-6');
    expect(toastElement).toHaveClass('text-left');
    expect(toastElement).toHaveClass('dark:text-black');
    expect(toastElement).toHaveClass('text-white');
    expect(toastElement).toHaveClass('w-80');
    expect(toastElement).toHaveClass('text-sm');
    expect(toastElement).toHaveClass('font-light');
    expect(toastElement).toHaveClass('p-3');
    expect(toastElement).toHaveClass('fixed');
    expect(toastElement).toHaveClass('z-50');
    expect(toastElement).toHaveClass('dark:bg-rtlLight');
    expect(toastElement).toHaveClass('bg-rtlDark');
    expect(toastElement).toHaveClass('rounded');
  });

  it('should automatically dismiss the toast after 2 seconds', async () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: 'Auto-dismiss test',
      setToast: mockSetToast,
    });

    const { rerender } = render(<DevToast />);

    // Initially the toast should be visible
    expect(screen.getByText('Auto-dismiss test')).toBeInTheDocument();

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    // The mock should have been called to dismiss the toast
    expect(mockSetToast).toHaveBeenCalledWith(null);

    // Since useEffect runs asynchronously, we need to update the mock return value and re-render
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      devToast: null, // Now the toast should be null
      setToast: mockSetToast,
    });

    // Re-render to reflect the new state
    rerender(<DevToast />);

    // The toast should no longer be in the document
    const toastElement = screen.queryByText('Auto-dismiss test');
    expect(toastElement).not.toBeInTheDocument();
  });

  it('should not trigger auto-dismiss when devToast is initially null', () => {
    render(<DevToast />);

    // Should not call setToast to dismiss anything
    expect(mockSetToast).not.toHaveBeenCalled();
  });

  it('should re-render and reset timeout when devToast changes', async () => {
    const mockState = {
      devToast: 'Initial toast',
      setToast: mockSetToast,
    };

    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue(mockState);

    const { rerender } = render(<DevToast />);

    // Initially the toast should be visible
    expect(screen.getByText('Initial toast')).toBeInTheDocument();

    // Clear mock calls to test the update behavior
    mockSetToast.mockClear();

    // Update the mock to return a new toast value
    mockState.devToast = 'Updated toast';

    // Re-render the component
    rerender(<DevToast />);

    // The new toast should be visible
    expect(screen.getByText('Updated toast')).toBeInTheDocument();

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    // The mock should have been called to dismiss the new toast
    expect(mockSetToast).toHaveBeenCalledWith(null);
  });
});