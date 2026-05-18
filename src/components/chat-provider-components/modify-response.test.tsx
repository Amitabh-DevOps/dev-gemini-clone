import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModifyResponse from './modify-response';
import geminiZustand from '@/utils/gemini-zustand';
import DevPopover from '../dev-components/dev-popover';
import DevButton from '../dev-components/dev-button';
import ReactTooltip from '../dev-components/react-tooltip';

// Mock the geminiZustand
jest.mock('@/utils/gemini-zustand');
const mockGeminiZustand = geminiZustand as jest.MockedFunction<any>;

// Mock the child components to test the ModifyResponse component in isolation
jest.mock('../dev-components/dev-popover', () => ({
  __esModule: true,
  default: ({ popButton, children }: { popButton: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="dev-popover">
      {popButton}
      <div data-testid="popover-content">{children}</div>
    </div>
  ),
}));

jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, onClick, asIcon, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: any }) => (
    <button
      data-testid="dev-button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children, tipData }: { children: React.ReactNode; tipData: string }) => (
    <div data-testid="react-tooltip" title={tipData}>
      {children}
    </div>
  ),
}));

describe('ModifyResponse', () => {
  const defaultProps = {
    chatUniqueId: 'test-unique-id',
    llmResponse: 'This is a sample response from the LLM',
  };

  const mockSetCurrChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGeminiZustand.mockReturnValue({
      setCurrChat: mockSetCurrChat,
    });
  });

  it('renders without crashing', () => {
    render(<ModifyResponse {...defaultProps} />);
    
    // Check that the main button with the LuSlidersHorizontal icon is rendered
    expect(screen.getByTestId('react-tooltip')).toBeInTheDocument();
    expect(screen.getByTitle('Modify response')).toBeInTheDocument();
  });

  it('renders the main modify button', () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const buttons = screen.getAllByTestId('dev-button');
    // The first button should be the main toggle button
    expect(buttons[0]).toBeInTheDocument();
  });

  it('displays the correct tooltip text', () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const tooltip = screen.getByTestId('react-tooltip');
    expect(tooltip).toHaveAttribute('title', 'Modify response');
  });

  it('renders all modify buttons when popover is open', () => {
    render(<ModifyResponse {...defaultProps} />);

    // Since we're mocking DevPopover, the content is always visible
    const popoverContent = screen.getByTestId('popover-content');
    expect(popoverContent).toBeInTheDocument();

    // Check that all modify options are present
    expect(screen.getByText('Generate Response')).toBeInTheDocument();

    const allButtons = screen.getAllByTestId('dev-button');
    // One main button + five modify buttons
    expect(allButtons).toHaveLength(6);

    // Check for specific modify buttons by text to distinguish them from the main button
    expect(screen.getByText('Shorter')).toBeInTheDocument();
    expect(screen.getByText('Longer')).toBeInTheDocument();
    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(screen.getByText('Simpler')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('finds and interacts with the main toggle button separately', () => {
    render(<ModifyResponse {...defaultProps} />);

    // Find the main button by its unique characteristics (opacity-80 class)
    const buttons = screen.getAllByTestId('dev-button');
    const mainButton = buttons[0]; // The first button is the main toggle

    expect(mainButton).toHaveClass('opacity-80');
  });

  it('calls setCurrChat with correct parameters when Shorter button is clicked', async () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const shorterButton = screen.getByText('Shorter');
    expect(shorterButton).toBeInTheDocument();
    
    fireEvent.click(shorterButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Shorten this response: This is a sample response from the LLM'
      );
    });
  });

  it('calls setCurrChat with correct parameters when Longer button is clicked', async () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const longerButton = screen.getByText('Longer');
    expect(longerButton).toBeInTheDocument();
    
    fireEvent.click(longerButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Lengthen this response: This is a sample response from the LLM'
      );
    });
  });

  it('calls setCurrChat with correct parameters when Simple button is clicked', async () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const simpleButton = screen.getByText('Simple');
    expect(simpleButton).toBeInTheDocument();
    
    fireEvent.click(simpleButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Simplify this response: This is a sample response from the LLM'
      );
    });
  });

  it('calls setCurrChat with correct parameters when Simpler button is clicked', async () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const simplerButton = screen.getByText('Simpler');
    expect(simplerButton).toBeInTheDocument();
    
    fireEvent.click(simplerButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Simplify this response: This is a sample response from the LLM'
      );
    });
  });

  it('calls setCurrChat with correct parameters when Professional button is clicked', async () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const professionalButton = screen.getByText('Professional');
    expect(professionalButton).toBeInTheDocument();
    
    fireEvent.click(professionalButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Make more formal this response: This is a sample response from the LLM'
      );
    });
  });

  it('correctly formats the user prompt for different response lengths', async () => {
    const differentResponse = 'A different LLM response to test';
    render(<ModifyResponse chatUniqueId="test-unique-id" llmResponse={differentResponse} />);
    
    const shorterButton = screen.getByText('Shorter');
    fireEvent.click(shorterButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Shorten this response: A different LLM response to test'
      );
    });
  });

  it('handles empty llmResponse prop correctly', async () => {
    render(<ModifyResponse chatUniqueId="test-unique-id" llmResponse="" />);
    
    const shorterButton = screen.getByText('Shorter');
    fireEvent.click(shorterButton);
    
    await waitFor(() => {
      expect(mockSetCurrChat).toHaveBeenCalledWith(
        'userPrompt',
        'Shorten this response: '
      );
    });
  });

  it('passes the correct props to DevPopover', () => {
    render(<ModifyResponse {...defaultProps} />);
    
    // Check that DevPopover is rendered with correct structure
    const popover = screen.getByTestId('dev-popover');
    expect(popover).toBeInTheDocument();
    
    // Check that the popButton is rendered inside the popover
    const tooltip = screen.getByTestId('react-tooltip');
    expect(popover).toContainElement(tooltip);
  });

  it('has the correct styling classes for the popover content', () => {
    render(<ModifyResponse {...defaultProps} />);
    
    const popoverContent = screen.getByTestId('popover-content');
    // Since we're mocking the actual DevPopover content rendering, we need to look at the div
    expect(popoverContent).toBeInTheDocument();
  });
});