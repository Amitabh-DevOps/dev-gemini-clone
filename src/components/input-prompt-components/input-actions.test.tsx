import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputActions from './input-actions';
import geminiZustand from '@/utils/gemini-zustand';

// Mock the child components and dependencies
jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, onClick, asIcon, ...props }: any) => {
    // Create a unique test id based on props for differentiation
    const testId = props.variant === 'v3' && props.type === 'submit' ? 'submit-button' :
                  props.className?.includes('!bg-accentBlue/50') ? 'cancel-button' :
                  props.className?.includes('md:!hidden !flex') ? 'camera-button' :
                  props.className?.includes('p-3 relative') ? 'upload-button' : 'dev-button';

    return (
      <button
        onClick={onClick}
        data-testid={testId}
        {...props}
      >
        {children}
      </button>
    );
  }
}));

jest.mock('../chat-provider-components/speech-to-text', () => ({
  __esModule: true,
  default: () => <div data-testid="speech-to-text">SpeechToText</div>
}));

jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children, tipData, ...props }: any) => (
    <div data-testid="tooltip" data-tip={tipData} {...props}>
      {children}
    </div>
  )
}));

jest.mock('@/utils/gemini-zustand');

const mockGeminiZustand = geminiZustand as jest.MockedFunction<any>;

describe('InputActions', () => {
  const mockGenerateMsg = jest.fn();
  const mockHandleCancel = jest.fn();
  const mockHandleImageUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: '' },
      msgLoader: false
    });
  });

  it('renders without crashing', () => {
    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );
    // Should see at least one button when not loading and no prompt
    expect(screen.getAllByTestId(/button/)).toBeTruthy();
  });

  it('shows upload and submit buttons when not loading and userPrompt exists', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: 'test prompt' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    // Check for image upload button
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    // Check for camera button
    expect(screen.getByTestId('camera-button')).toBeInTheDocument();
    // Check for speech to text component
    expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();
    // Check for submit button (only visible when there's a user prompt and not loading)
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();

    // Check tooltips - there should be 3 total (Upload image, Upload photo, Submit)
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips).toHaveLength(3); // Upload image, Upload photo, Submit
    expect(tooltips[0]).toHaveAttribute('data-tip', 'Upload image');
    expect(tooltips[1]).toHaveAttribute('data-tip', 'Upload photo');
    expect(tooltips[2]).toHaveAttribute('data-tip', 'Submit');
  });

  it('shows stop response button when loading and userPrompt exists', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: 'test prompt' },
      msgLoader: true
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const toolTip = screen.getByTestId('tooltip');
    expect(toolTip).toHaveAttribute('data-tip', 'Stop response');
    const button = screen.getByTestId('cancel-button');
    expect(button).toHaveClass('!bg-accentBlue/50');
  });

  it('shows upload buttons when not loading and no userPrompt', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: '' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    // Should show upload buttons but not submit button
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('camera-button')).toBeInTheDocument();
    expect(screen.getByTestId('speech-to-text')).toBeInTheDocument();

    // Verify all tooltips exist
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips).toHaveLength(3); // Upload image, Upload photo, Submit (but submit button is hidden)
  });

  it('triggers handleCancel when stop response button is clicked', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: 'test prompt' },
      msgLoader: true
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const button = screen.getByTestId('cancel-button');
    fireEvent.click(button);
    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });

  it('triggers generateMsg when submit button is clicked', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: 'test prompt' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(mockGenerateMsg).toHaveBeenCalledTimes(1);
  });

  it('triggers handleImageUpload when image input changes', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: '' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const fileInput = screen.getByTestId('upload-button').querySelector('input[type="file"]');

    if (fileInput instanceof HTMLInputElement) {
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(mockHandleImageUpload).toHaveBeenCalledTimes(1);
    }
  });

  it('renders camera input for mobile with correct attributes', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: '' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const cameraButton = screen.getByTestId('camera-button');
    const fileInput = cameraButton.querySelector('input');
    expect(fileInput).toHaveAttribute('capture', 'environment');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('hides submit button when no user prompt exists', () => {
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: '' },
      msgLoader: false
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    // Submit button exists in DOM but is visually hidden with CSS classes when there's no user prompt
    const submitButton = screen.queryByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
    // Check that the submit button has classes that make it invisible
    expect(submitButton).toHaveClass('*:w-0');
    expect(submitButton).toHaveClass('*:scale-0');
    expect(submitButton).toHaveClass('pointer-events-none');
  });

  it('shows correct tooltip text in different states', () => {
    // Test state when loading and userPrompt exists
    mockGeminiZustand.mockReturnValue({
      currChat: { userPrompt: 'test prompt' },
      msgLoader: true
    });

    render(
      <InputActions
        generateMsg={mockGenerateMsg}
        handleCancel={mockHandleCancel}
        handleImageUpload={mockHandleImageUpload}
      />
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-tip', 'Stop response');
  });
});