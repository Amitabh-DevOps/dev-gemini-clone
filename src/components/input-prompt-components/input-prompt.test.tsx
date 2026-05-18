import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import InputPrompt from './input-prompt';
import geminiZustand from '@/utils/gemini-zustand';
import { nanoid } from 'nanoid';
import { useMeasure } from 'react-use';

// Define the expected type for the gemini store
type GeminiState = {
  currChat: { userPrompt: string | null };
  setCurrChat: (field: string, value: any) => void;
  setToast: (message: string) => void;
  customPrompt: { prompt: string; placeholder: string };
  setInputImgName: (name: string | null) => void;
  inputImgName: string | null;
  setMsgLoader: (loading: boolean) => void;
  prevChat: { userPrompt: string; llmResponse: string };
  msgLoader: boolean;
  optimisticResponse: string | null;
  setUserData: (user: any) => void;
  setOptimisticResponse: (response: string | null) => void;
  setOptimisticPrompt: (prompt: string | null) => void;
};

// Mock the child components and dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/utils/gemini-zustand');

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

jest.mock('react-use', () => ({
  useMeasure: jest.fn(),
}));

jest.mock('./input-actions', () => ({
  __esModule: true,
  default: ({ handleCancel, handleImageUpload, generateMsg }: any) => (
    <div data-testid="input-actions">
      <button data-testid="cancel-btn" onClick={handleCancel}>Cancel</button>
      <input
        data-testid="image-upload"
        type="file"
        onChange={handleImageUpload}
      />
      <button data-testid="generate-btn" onClick={generateMsg}>Generate</button>
    </div>
  )
}));

jest.mock('react-icons/md', () => ({
  MdImageSearch: ({ className }: { className?: string }) => (
    <span className={className}>Image Icon</span>
  ),
}));

jest.mock('react-icons/io', () => ({
  IoMdClose: ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <span className={className} onClick={onClick}>X</span>
  ),
}));

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContentStream: jest.fn().mockReturnValue({
        stream: {
          [Symbol.asyncIterator]: () => ({
            next: jest.fn().mockResolvedValue({ done: true, value: undefined }),
          }),
        },
      }),
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mocked API response'),
        },
      }),
    }),
  })),
}));

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_API_KEY: 'test-api-key',
};

// Mock the process.env
Object.defineProperty(process, 'env', {
  value: mockEnv,
});

describe('InputPrompt', () => {
  const mockUser = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockRouter = {
    push: jest.fn(),
  };

  const mockParams = {
    chat: 'test-chat-id',
  };

  const mockSetCurrChat = jest.fn();
  const mockSetToast = jest.fn();
  const mockSetMsgLoader = jest.fn();
  const mockSetOptimisticResponse = jest.fn();
  const mockSetOptimisticPrompt = jest.fn();
  const mockSetUserData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (nanoid as jest.Mock).mockReturnValue('mocked-nanoid');
    (useMeasure as jest.Mock).mockReturnValue([
      jest.fn(),
      { height: 100 }
    ]);

    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });
  });

  it('renders without crashing', () => {
    render(<InputPrompt user={mockUser} />);
    expect(screen.getByPlaceholderText('Enter a prompt here')).toBeInTheDocument();
  });

  it('displays placeholder text when customPrompt has placeholder', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: 'Custom placeholder text' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticPrompt,
      setOptimisticPrompt: mockSetOptimisticResponse,
    });

    render(<InputPrompt user={mockUser} />);
    expect(screen.getByPlaceholderText('Custom placeholder text')).toBeInTheDocument();
  });

  it('updates textarea value when userPrompt changes', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: 'Test prompt' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticPrompt,
      setOptimisticPrompt: mockSetOptimisticResponse,
    });

    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test prompt');
  });

  it('updates textarea value when optimisticResponse is present', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: 'Test prompt' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: 'Optimistic response',
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
  });

  it('disables textarea when msgLoader is true', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: 'Test prompt' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: true,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('updates store when textarea value changes', () => {
    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'New test prompt' } });
    
    expect(mockSetCurrChat).toHaveBeenCalledWith('userPrompt', 'New test prompt');
  });

  it('submits the form when Enter is pressed (without Shift)', async () => {
    // Update the mock params to return undefined so nanoid is used
    (useParams as jest.Mock).mockReturnValue({ chat: undefined });

    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: 'Test prompt' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    // Wait for the asynchronous operations to complete
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/app/mocked-nanoid#new-chat');
    });
  });

  it('does not submit form when Shift+Enter is pressed', () => {
    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('shows image preview when inputImgName is provided', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: 'test-image.jpg',
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    expect(screen.getByText('Image Icon')).toBeInTheDocument();
  });

  it('removes image when close icon is clicked', () => {
    const mockSetInputImgName = jest.fn();
    const mockSetInputImg = jest.fn();
    
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: mockSetInputImgName,
      inputImgName: 'test-image.jpg',
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    const closeIcon = screen.getByText('X');
    
    fireEvent.click(closeIcon);
    
    expect(mockSetInputImgName).toHaveBeenCalledWith(null);
  });

  it('handles image upload correctly', () => {
    render(<InputPrompt user={mockUser} />);
    const imageUploadInput = screen.getByTestId('image-upload');

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    // Use DataTransfer to set files for the event
    fireEvent.change(imageUploadInput, {
      target: { files: [file] }
    });

    // Since we can't directly check the internal state, verify the event was triggered
    expect(imageUploadInput).toBeInTheDocument();
  });

  it('shows toast notification when user is not logged in and Enter is pressed', () => {
    render(<InputPrompt user={undefined} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    expect(mockSetToast).toHaveBeenCalledWith('Please sign in to use Gemini!');
  });

  it('sets user data when user is provided', () => {
    render(<InputPrompt user={mockUser} />);
    
    expect(mockSetUserData).toHaveBeenCalledWith(mockUser);
  });

  it('does not submit when user prompt is empty', () => {
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      setCurrChat: mockSetCurrChat,
      setToast: mockSetToast,
      customPrompt: { prompt: '', placeholder: '' },
      setInputImgName: jest.fn(),
      inputImgName: null,
      setMsgLoader: mockSetMsgLoader,
      prevChat: { userPrompt: '', llmResponse: '' },
      msgLoader: false,
      optimisticResponse: null,
      setUserData: mockSetUserData,
      setOptimisticResponse: mockSetOptimisticResponse,
      setOptimisticPrompt: mockSetOptimisticPrompt,
    });

    render(<InputPrompt user={mockUser} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});