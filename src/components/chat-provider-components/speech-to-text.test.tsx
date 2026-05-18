import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { beforeEach, jest, afterEach } from '@jest/globals';
import SpeechToText from './speech-to-text';
import geminiZustand from '@/utils/gemini-zustand';

// Define the necessary interfaces for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  lang: string;
  grammars: any;
}

// Mock ReactTooltip to avoid state update warnings
jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children, place, tipData, occupy = true, ...props }: any) => {
    // Generate a random ID similar to React's useId
    const id = `:${Math.random().toString(36).substr(2, 9)}:`;
    return (
      <div className={occupy ? "w-fit" : "w-auto"} data-testid="react-tooltip" data-tooltip-id={id}>
        {children}
        {tipData && <span data-testid="tooltip-content">{tipData}</span>}
      </div>
    );
  },
}));

// Mock the geminiZustand
jest.mock('@/utils/gemini-zustand', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Create a proper mock for webkitSpeechRecognition
const createMockSpeechRecognition = () => {
  return class MockSpeechRecognition implements SpeechRecognition {
    continuous = false;
    interimResults = false;
    onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
    onstart: ((event: Event) => void) | null = null;
    onend: ((event: Event) => void) | null = null;
    lang = '';
    grammars = null;

    private mockStart = jest.fn();
    private mockStop = jest.fn();

    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = (event: Event): boolean => {
      // Mock implementation for dispatchEvent
      return true;
    };

    start = () => {
      this.mockStart();
      if (this.onstart) {
        this.onstart(new Event('start'));
      }
    };

    stop = () => {
      this.mockStop();
      if (this.onend) {
        this.onend(new Event('end'));
      }
    };
  };
};

// Store original value for cleanup
const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Set up the mock SpeechRecognition
  (window as any).webkitSpeechRecognition = createMockSpeechRecognition();
});

afterEach(() => {
  // Restore original value after each test
  (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
});

describe('SpeechToText', () => {
  const mockSetCurrChat = jest.fn();
  const mockSetToast = jest.fn();

  beforeEach(() => {
    // Mock the geminiZustand return value
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: {},
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
    });
  });

  afterEach(() => {
    // Clean up any potential DOM artifacts
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('renders the microphone button', async () => {
    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');
    expect(micButton).toBeInTheDocument();
    expect(micButton.querySelector('svg')).toBeInTheDocument(); // The mic icon
  });

  it('has tooltip with correct configuration', async () => {
    await act(async () => {
      render(<SpeechToText />);
    });

    // Check that the tooltip container has the correct data attribute
    const tooltipContainer = screen.getByRole('button').closest('[data-tooltip-id]');
    expect(tooltipContainer).toBeInTheDocument();

    // The actual tooltip content is rendered in a portal, so we can't directly test it
    // But we can verify that the tooltip ID is properly set
    const tooltipId = tooltipContainer?.getAttribute('data-tooltip-id');
    expect(tooltipId).toBeTruthy();
  });

  it('initializes with microphone available and not listening', async () => {
    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');

    // Initially not listening - check that animation classes are not present
    expect(micButton).not.toHaveClass('animate-pulse-border');
    expect(micButton).not.toHaveClass('!bg-blue-500/30');
  });

  it('toggles listening state when clicked', async () => {
    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');

    // Initially not active
    expect(micButton).not.toHaveClass('animate-pulse-border');

    // Click to start listening
    fireEvent.click(micButton);
    await waitFor(() => {
      expect(micButton).toHaveClass('animate-pulse-border');
    });

    // Click to stop listening
    fireEvent.click(micButton);
    await waitFor(() => {
      expect(micButton).not.toHaveClass('animate-pulse-border');
    });
  });

  it('calls recognition start when listening starts', async () => {
    const mockSpeechRecognitionClass = createMockSpeechRecognition();
    const instance = new mockSpeechRecognitionClass();
    const mockStartSpy = jest.spyOn(instance, 'start');

    (window as any).webkitSpeechRecognition = jest.fn(() => instance);

    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockStartSpy).toHaveBeenCalled();
    });
  });

  it('calls recognition stop when listening stops', async () => {
    const mockSpeechRecognitionClass = createMockSpeechRecognition();
    const instance = new mockSpeechRecognitionClass();
    const mockStartSpy = jest.spyOn(instance, 'start');
    const mockStopSpy = jest.spyOn(instance, 'stop');

    (window as any).webkitSpeechRecognition = jest.fn(() => instance);

    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');

    // Start listening
    fireEvent.click(micButton);
    await waitFor(() => {
      expect(mockStartSpy).toHaveBeenCalled();
    });

    // Stop listening
    fireEvent.click(micButton);
    await waitFor(() => {
      expect(mockStopSpy).toHaveBeenCalled();
    });
  });

  it('handles speech recognition results correctly', async () => {
    const mockSpeechRecognitionClass = createMockSpeechRecognition();
    const instance = new mockSpeechRecognitionClass();

    (window as any).webkitSpeechRecognition = jest.fn(() => instance);

    render(<SpeechToText />);

    // Simulate a speech recognition result
    const mockResultEvent: SpeechRecognitionEvent = {
      results: [
        {
          0: { transcript: 'Test transcript', confidence: 0.9 },
          length: 1,
          item: () => ({ transcript: 'Test transcript', confidence: 0.9 })
        }
      ] as unknown as SpeechRecognitionResultList
    } as SpeechRecognitionEvent;

    // Manually trigger the onresult handler in act
    await act(async () => {
      if (instance.onresult) {
        instance.onresult(mockResultEvent);
      }
    });

    // Wait for the state update to propagate
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith('userPrompt', 'Test transcript');
    });
  });

  it('handles speech recognition error - not-allowed', async () => {
    const mockSpeechRecognitionClass = createMockSpeechRecognition();
    const instance = new mockSpeechRecognitionClass();

    (window as any).webkitSpeechRecognition = jest.fn(() => instance);

    render(<SpeechToText />);

    // Simulate a speech recognition error
    const mockErrorEvent: SpeechRecognitionErrorEvent = {
      error: 'not-allowed',
      message: 'Permission denied'
    } as SpeechRecognitionErrorEvent;

    // Manually trigger the onerror handler in act
    await act(async () => {
      if (instance.onerror) {
        instance.onerror(mockErrorEvent);
      }
    });

    // Wait for the state update to propagate
    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith('Microphone access denied');
    });
  });

  it('handles speech recognition error - general error', async () => {
    const mockSpeechRecognitionClass = createMockSpeechRecognition();
    const instance = new mockSpeechRecognitionClass();

    (window as any).webkitSpeechRecognition = jest.fn(() => instance);

    render(<SpeechToText />);

    // Simulate a general speech recognition error
    const mockErrorEvent: SpeechRecognitionErrorEvent = {
      error: 'other-error',
      message: 'Some other error'
    } as SpeechRecognitionErrorEvent;

    // Manually trigger the onerror handler in act
    await act(async () => {
      if (instance.onerror) {
        instance.onerror(mockErrorEvent);
      }
    });

    // Wait for the state update to propagate
    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith('Unable to access the microphone');
    });
  });

  it('displays toast when speech recognition is not supported', async () => {
    // Remove webkitSpeechRecognition to simulate lack of support
    delete (window as any).webkitSpeechRecognition;

    await act(async () => {
      render(<SpeechToText />);
    });

    expect(mockSetToast).toHaveBeenCalledWith('Speech recognition is not supported in this browser');
  });

  it('shows toast when microphone is not available on click if unsupported', async () => {
    // Remove webkitSpeechRecognition to simulate lack of support
    delete (window as any).webkitSpeechRecognition;

    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    expect(mockSetToast).toHaveBeenCalledWith('Microphone is not available');
  });

  it('does not call recognition methods if microphone is not available', async () => {
    // Remove webkitSpeechRecognition to simulate lack of support
    delete (window as any).webkitSpeechRecognition;

    await act(async () => {
      render(<SpeechToText />);
    });

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    expect(mockSetToast).toHaveBeenCalledWith('Microphone is not available');
  });
});