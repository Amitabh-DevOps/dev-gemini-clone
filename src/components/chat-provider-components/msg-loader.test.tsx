import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MsgLoader from './msg-loader';

// Mock the geminiZustand hook - needs to be at the top level
jest.mock('@/utils/gemini-zustand');
import geminiZustand from '@/utils/gemini-zustand';

// Get the mock function properly
const mockGeminiZustand = geminiZustand as jest.MockedFunction<typeof geminiZustand>;

// Mock the child components
jest.mock('./gradient-loader', () => () => <div data-testid="gradient-loader">Gradient Loader</div>);
jest.mock('react-markdown', () => ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>);
jest.mock('@/utils/shadow', () => ({
  FormatOutput: ({ children }: { children: React.ReactNode }) => <div data-testid="format-output">{children}</div>,
}));
jest.mock('react-shadow/styled-components', () => ({
  default: {
    div: (props: any) => <div data-testid="shadow-root" {...props} />,
  },
  div: (props: any) => <div data-testid="shadow-root" {...props} />,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
jest.mock('react-icons/si', () => ({
  SiGooglegemini: (props: any) => <span data-testid="gemini-icon" {...props} />,
}));
jest.mock('react-icons/md', () => ({
  MdOutlineImage: (props: any) => <span data-testid="image-icon" {...props} />,
}));

describe('MsgLoader', () => {
  const mockImage = 'test-image.jpg';
  const mockName = 'Test User';

  beforeEach(() => {
    // Default mock return value
    mockGeminiZustand.mockReturnValue({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when msgLoader is false', () => {
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: false,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.queryByTestId('gemini-icon')).not.toBeInTheDocument();
  });

  it('renders properly when msgLoader is true', () => {
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.getByTestId('gemini-icon')).toBeInTheDocument();
    expect(screen.getByTestId('gradient-loader')).toBeInTheDocument();
  });

  it('displays user image with correct props', () => {
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    const image = screen.getByRole('img', { name: mockName });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockImage);
    expect(image).toHaveAttribute('width', '35');
    expect(image).toHaveAttribute('height', '35');
  });

  it('displays user prompt in textarea', () => {
    const userPrompt = 'Sample user prompt';
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt,
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(userPrompt);
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('does not show input image name when inputImgName is null', () => {
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.queryByTestId('image-icon')).not.toBeInTheDocument();
    expect(screen.queryByText('inputImgName')).not.toBeInTheDocument();
  });

  it('shows input image name when inputImgName is provided', () => {
    const inputImgName = 'test-image.png';
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    expect(screen.getByText(inputImgName)).toBeInTheDocument();
  });

  it('shows gradient loader when llmResponse is null', () => {
    mockGeminiZustand.mockReturnValueOnce({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse: null,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.getByTestId('gradient-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('shows formatted output when llmResponse is present', () => {
    const llmResponse = 'Sample LLM response';
    // Set up the mock to return consistent values throughout the component lifecycle
    mockGeminiZustand.mockReturnValue({
      currChat: {
        userPrompt: 'Test user prompt',
        llmResponse,
      },
      msgLoader: true,
      inputImgName: null,
    });

    render(<MsgLoader name={mockName} image={mockImage} />);

    expect(screen.getByTestId('markdown')).toBeInTheDocument();
    expect(screen.getByText(llmResponse)).toBeInTheDocument();
    expect(screen.getByTestId('format-output')).toBeInTheDocument();
    expect(screen.getByTestId('shadow-root')).toBeInTheDocument();
    expect(screen.queryByTestId('gradient-loader')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes to main container', () => {
    render(<MsgLoader name={mockName} image={mockImage} />);
    
    const container = screen.getByTestId('gemini-icon').closest('div');
    // Find the actual container by looking for the fade-in-element class
    const containers = screen.getAllByText(/./);
    const mainContainer = containers.find(el => 
      el.classList?.contains('fade-in-element') || 
      (el.parentElement?.classList?.contains('fade-in-element')) ||
      (el.parentElement?.parentElement?.classList?.contains('fade-in-element'))
    );
    
    expect(mainContainer).toBeInTheDocument();
  });
});