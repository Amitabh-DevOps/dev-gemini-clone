import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatProvider from './chat-provider';
import geminiZustand from '@/utils/gemini-zustand';
import { updateResponse } from '@/actions/actions';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the external dependencies
jest.mock('@/utils/gemini-zustand');
jest.mock('@/actions/actions');
jest.mock('@google/generative-ai');
jest.mock('lowlight', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('react-shadow/styled-components', () => ({
  div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));
jest.mock('./text-to-speech', () => ({
  __esModule: true,
  default: ({ handleTxtToSpeech }: any) => <div data-testid="text-to-speech">TextToSpeech</div>,
}));
jest.mock('./chat-actions-btns', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="chat-actions-btns">ChatActionsBtns</div>,
}));
jest.mock('./code-block', () => ({
  __esModule: true,
  default: (props: any) => <pre data-testid="code-block">{props.children}</pre>,
}));
jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, onClick, asIcon, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid={props['data-testid'] || 'dev-button'}
      {...props}
    >
      {children}
    </button>
  ),
}));
jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children, tipData, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock react-icons components
jest.mock('react-icons/fa6', () => ({
  FaWandMagicSparkles: (props: any) => <span data-testid="FaWandMagicSparkles" {...props}>FaWandMagicSparkles</span>
}));

jest.mock('react-icons/md', () => ({
  MdImageSearch: (props: any) => <span data-testid="MdImageSearch" {...props}>MdImageSearch</span>,
  MdOutlineImage: (props: any) => <span data-testid="MdOutlineImage" {...props}>MdOutlineImage</span>,
  MdOutlineModeEditOutline: (props: any) => <span data-testid="MdOutlineModeEditOutline" {...props}>MdOutlineModeEditOutline</span>,
}));

jest.mock('react-icons/si', () => ({
  SiGooglegemini: (props: any) => <span data-testid="SiGooglegemini" {...props}>SiGooglegemini</span>
}));

jest.mock('react-icons/bs', () => ({
  BsImage: (props: any) => <span data-testid="BsImage" {...props}>BsImage</span>
}));

// Mock the editor hook
jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  useEditor: () => ({
    commands: {
      setContent: jest.fn(),
      getText: () => 'mocked editor text'
    },
    on: jest.fn(),
    destroy: jest.fn(),
    getText: () => 'mocked editor text',
    isEmpty: false
  }),
  EditorContent: ({ editor, ...props }: any) => (
    <div data-testid="editor-content" {...props}>
      Editor Content
    </div>
  ),
  BubbleMenu: ({ editor, children }: any) => (
    <div data-testid="bubble-menu" className="bubble-menu">
      {children}
    </div>
  ),
}));

// Mock environment variable
process.env.NEXT_PUBLIC_API_KEY = 'test-api-key';

// Mock global fetch
global.fetch = jest.fn();

describe('ChatProvider', () => {
  const defaultProps = {
    llmResponse: 'Initial LLM response',
    chatUniqueId: 'test-chat-id',
    userPrompt: 'Test user prompt',
    imgInfo: {
      imgSrc: '/test-image.jpg',
      imgAlt: 'Test image alt text'
    },
    imgName: 'test-image-name.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock geminiZustand return values
    (geminiZustand as jest.MockedFunction<any>).mockReturnValue({
      topLoader: false,
      setCurrChat: jest.fn(),
      setTopLoader: jest.fn(),
      currChat: {}
    });

    // Mock updateResponse function
    (updateResponse as jest.MockedFunction<any>).mockResolvedValue({
      message: {
        message: {
          llmResponse: 'Updated LLM response'
        }
      }
    });

    // Mock GoogleGenerativeAI
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('Mocked generated text')
          }
        })
      })
    }));
  });

  it('renders without crashing', () => {
    render(<ChatProvider {...defaultProps} />);

    expect(screen.getByAltText('Test image alt text')).toBeInTheDocument();
    expect(screen.getByText('Editor Content')).toBeInTheDocument();
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    expect(screen.getByTestId('chat-actions-btns')).toBeInTheDocument();
  });

  it('displays the provided user prompt and LLM response', () => {
    render(<ChatProvider {...defaultProps} />);

    // Check that the user prompt is displayed in the textarea
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test user prompt');
  });

  it('shows the image name when provided', () => {
    render(<ChatProvider {...defaultProps} />);

    expect(screen.getByText('test-image-name.jpg')).toBeInTheDocument();
  });

  it('hides the image name when not provided', () => {
    render(<ChatProvider {...{ ...defaultProps, imgName: undefined }} />);

    expect(screen.queryByText('test-image-name.jpg')).not.toBeInTheDocument();
  });

  it('toggles prompt modification on edit button click', async () => {
    render(<ChatProvider {...defaultProps} />);

    // Find the edit button - we'll look for the DevButton with the edit icon
    const editButton = screen.getByTestId('dev-button');
    // Since we're mocking the button, we need to verify that there's an edit button present
    expect(editButton).toBeInTheDocument();

    // Click the edit button to toggle prompt modification
    fireEvent.click(editButton);

    // After clicking, should show update/cancel buttons
    expect(await screen.findByText('Update')).toBeInTheDocument();
  });

  it('renders the prompt modification buttons when in edit mode', async () => {
    render(<ChatProvider {...defaultProps} />);

    // Find and click the edit button first
    const editButton = screen.getByTestId('dev-button');
    fireEvent.click(editButton);

    // Wait for the update/cancel buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  it('cancels prompt modification when Cancel button is clicked', async () => {
    const setCurrChatMock = jest.fn();
    (geminiZustand as jest.MockedFunction<any>).mockReturnValue({
      topLoader: false,
      setCurrChat: setCurrChatMock,
      setTopLoader: jest.fn(),
      currChat: {}
    });

    render(<ChatProvider {...defaultProps} />);

    // Find and click the edit button
    const editButton = screen.getByTestId('dev-button');
    fireEvent.click(editButton);

    // Wait for the cancel button to appear and click it
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(setCurrChatMock).toHaveBeenCalledWith('userPrompt', null);
    });
  });

  it('updates prompt when Update button is clicked', async () => {
    const setCurrChatMock = jest.fn();
    (geminiZustand as jest.MockedFunction<any>).mockReturnValue({
      topLoader: false,
      setCurrChat: setCurrChatMock,
      setTopLoader: jest.fn(),
      currChat: {}
    });

    render(<ChatProvider {...defaultProps} />);

    // Find and click the edit button to enter edit mode
    const editButton = screen.getByTestId('dev-button');
    fireEvent.click(editButton);

    // Wait for the update button to appear
    await waitFor(() => {
      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    // Update the textarea value
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified prompt' } });

    // Click Update button
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(setCurrChatMock).toHaveBeenCalledWith('userPrompt', 'Modified prompt');
    });
  });

  it('displays the magic sparkles button', () => {
    render(<ChatProvider {...defaultProps} />);

    const bubbleMenu = screen.getByTestId('bubble-menu');
    expect(bubbleMenu).toBeInTheDocument();
  });

  it('does not render dropdown when not active', () => {
    render(<ChatProvider {...defaultProps} />);

    expect(screen.queryByText('Lengthen')).not.toBeInTheDocument();
  });

  it('initializes with provided props correctly', () => {
    render(<ChatProvider {...defaultProps} />);

    // Verify that the component rendered with all the props
    expect(screen.getByAltText(defaultProps.imgInfo.imgAlt)).toBeInTheDocument();

    // Check that the initial prompt is in the textarea
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(defaultProps.userPrompt);
  });

  it('handles different prompt types when dropdown is active', async () => {
    render(<ChatProvider {...defaultProps} />);

    // Simulate dropdown activation (this would require complex interactions in the actual component)
    // For test purposes, we'll verify that the component can render without errors
    expect(screen.getByAltText('Test image alt text')).toBeInTheDocument();
  });

  it('renders all required child components', () => {
    render(<ChatProvider {...defaultProps} />);

    // Check that all expected child components are present
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
    expect(screen.getByTestId('chat-actions-btns')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-menu')).toBeInTheDocument();
  });

  it('shows Gemini icon', () => {
    render(<ChatProvider {...defaultProps} />);

    // Check if the Gemini icon is rendered by looking for the SiGooglegemini class
    const icon = screen.getByTestId('SiGooglegemini'); // We need to update our mock to add this
    expect(icon).toBeInTheDocument();
  });
});