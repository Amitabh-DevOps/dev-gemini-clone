import { render } from '@testing-library/react';
import TopLoader from './top-loader';

// Mock the geminiZustand
jest.mock('@/utils/gemini-zustand');
import geminiZustand from '@/utils/gemini-zustand';

describe('TopLoader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render loader when topLoader is false', () => {
    // Set up the mock to return topLoader: false
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      topLoader: false,
    });

    render(<TopLoader />);

    // Check that no element with class 'loader' exists in the document
    const loaderElement = document.querySelector('.loader');
    expect(loaderElement).not.toBeInTheDocument();
  });

  it('should render loader when topLoader is true', () => {
    // Set up the mock to return topLoader: true
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      topLoader: true,
    });

    const { container } = render(<TopLoader />);
    const loaderElement = container.querySelector('.loader');
    expect(loaderElement).toBeInTheDocument();
  });

  it('should always render the container div with correct CSS classes', () => {
    // The container div should always be present regardless of topLoader value
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      topLoader: false,
    });

    const { container } = render(<TopLoader />);

    // Find the container div (the one with 'absolute bottom-0 inset-x-0' classes)
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('absolute', 'bottom-0', 'inset-x-0');
  });

  it('should render both container and loader when topLoader is true', () => {
    // Set up the mock to return topLoader: true
    (geminiZustand as jest.MockedFunction<typeof geminiZustand>).mockReturnValue({
      topLoader: true,
    });

    const { container } = render(<TopLoader />);

    // Check that container div exists with correct classes
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('absolute', 'bottom-0', 'inset-x-0');

    // Check that loader element exists inside the container
    const loaderElement = container.querySelector('.loader');
    expect(loaderElement).toBeInTheDocument();
  });
});