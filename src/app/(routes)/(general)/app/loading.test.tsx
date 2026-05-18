import { render, screen, within } from '@testing-library/react';
import Loading from './loading';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import geminiZustand from '@/utils/gemini-zustand';

// Mock the geminiZustand hook
jest.mock('@/utils/gemini-zustand', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the react-icons components
jest.mock('react-icons/bs', () => {
  return {
    __esModule: true,
    BsImage: jest.fn(() => <span data-testid="mocked-bs-image" />),
  };
});

jest.mock('react-icons/md', () => {
  return {
    __esModule: true,
    MdImageSearch: jest.fn(() => <span data-testid="mocked-md-image-search" />),
    MdOutlineImage: jest.fn(() => <span data-testid="mocked-md-outline-image" />),
  };
});

jest.mock('react-icons/si', () => {
  return {
    __esModule: true,
    SiGooglegemini: jest.fn(() => <span data-testid="mocked-si-google-gemini" />),
  };
});

// Mock next/image
jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ src, alt, width, height, className }: any) => (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-testid="mocked-image"
      />
    ),
  };
});

// Mock the GradientLoader component
jest.mock('@/components/chat-provider-components/gradient-loader', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="gradient-loader">Gradient Loader</div>,
  };
});

describe('Loading Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render the loader div when msgLoader is false', () => {
    // Mock the geminiZustand to return values with msgLoader as false
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: { userPrompt: '' },
      userData: { image: '', name: '' },
      msgLoader: false,
      inputImgName: null,
    });

    const { container } = render(<Loading />);

    // Check if the basic loader div is present when msgLoader is false
    const loaderDiv = container.querySelector('.loader');
    expect(loaderDiv).toBeInTheDocument();
  });

  it('should render the loading UI when msgLoader is true', () => {
    const mockUserData = {
      image: 'test-image.jpg',
      name: 'Test User',
    };

    const mockCurrChat = {
      userPrompt: 'Test prompt',
    };

    // Mock the geminiZustand to return values with msgLoader as true
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: mockCurrChat,
      userData: mockUserData,
      msgLoader: true,
      inputImgName: null,
    });

    render(<Loading />);

    // Check if the user image is rendered with correct props
    const userImage = screen.getByTestId('mocked-image');
    expect(userImage).toBeInTheDocument();
    expect(userImage).toHaveAttribute('src', mockUserData.image);
    expect(userImage).toHaveAttribute('alt', mockUserData.name);

    // Check if the textarea contains the user prompt
    const promptTextarea = screen.getByRole('textbox');
    expect(promptTextarea).toHaveValue(mockCurrChat.userPrompt);
    expect(promptTextarea).toHaveAttribute('readOnly');

    // Check if the gemini icon is present
    const geminiIcon = screen.getByTestId('mocked-si-google-gemini');
    expect(geminiIcon).toBeInTheDocument();

    // Check if the gradient loader is present
    const gradientLoader = screen.getByTestId('gradient-loader');
    expect(gradientLoader).toBeInTheDocument();
  });

  it('should render input image name when inputImgName is provided', () => {
    const mockUserData = {
      image: 'test-image.jpg',
      name: 'Test User',
    };

    const mockCurrChat = {
      userPrompt: 'Test prompt',
    };

    const testInputImgName = 'test-image.png';

    // Mock the geminiZustand to return values with msgLoader as true and inputImgName
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: mockCurrChat,
      userData: mockUserData,
      msgLoader: true,
      inputImgName: testInputImgName,
    });

    render(<Loading />);

    // Check if the input image name is rendered
    const inputImageNameElement = screen.getByText(testInputImgName);
    expect(inputImageNameElement).toBeInTheDocument();

    // Check if the image icon is present
    const imageIcon = screen.getByTestId('mocked-md-outline-image');
    expect(imageIcon).toBeInTheDocument();
  });

  it('should not render input image section when inputImgName is null', () => {
    const mockUserData = {
      image: 'test-image.jpg',
      name: 'Test User',
    };

    const mockCurrChat = {
      userPrompt: 'Test prompt',
    };

    // Mock the geminiZustand to return values with msgLoader as true but no inputImgName
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      currChat: mockCurrChat,
      userData: mockUserData,
      msgLoader: true,
      inputImgName: null,
    });

    render(<Loading />);

    // The input image name should not be in the document
    expect(screen.queryByText('test-image.png')).not.toBeInTheDocument();
  });
});