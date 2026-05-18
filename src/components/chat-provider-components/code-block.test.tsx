import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NodeViewWrapper } from '@tiptap/react';
import CodeBlock from './code-block';

// Mock the @tiptap/react dependency
jest.mock('@tiptap/react', () => ({
  NodeViewContent: (props: { as?: React.ElementType }) => {
    const Component = props.as || 'code';
    return <Component data-testid="node-view-content">console.log("Hello, World!");</Component>;
  },
  NodeViewWrapper: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="node-view-wrapper">{children}</div>
  ),
}));

// Mock the react-icons
jest.mock('react-icons/io5', () => ({
  IoCheckmarkDoneSharp: () => <span data-testid="check-icon">✓</span>,
}));

jest.mock('react-icons/md', () => ({
  MdContentCopy: () => <span data-testid="copy-icon">📋</span>,
}));

// Mock the navigator.clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('CodeBlock Component', () => {
  const defaultProps = {
    node: {
      attrs: {
        language: 'javascript',
      },
    },
    updateAttributes: jest.fn(),
    extension: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined); // Success by default
    // Reset useRef mock to its original implementation before each test
    jest.spyOn(React, 'useRef').mockImplementation(() => ({
      current: null
    }));
  });

  afterEach(() => {
    // Restore the original useRef after each test
    jest.restoreAllMocks();
  });

  it('renders the component with language in header', () => {
    render(<CodeBlock {...defaultProps} />);

    // Check that the code block wrapper is rendered
    expect(screen.getByTestId('node-view-wrapper')).toBeInTheDocument();
    
    // Check that the language is displayed in the header
    expect(screen.getByText('Javascript')).toBeInTheDocument();
    
    // Check that the copy button is rendered
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('displays capitalized language properly', () => {
    const languages = [
      { input: 'javascript', expected: 'Javascript' },
      { input: 'python', expected: 'Python' },
      { input: 'typescript', expected: 'Typescript' },
      { input: 'html', expected: 'Html' },
      { input: '', expected: 'Code' },
      { input: 'r', expected: 'R' },
    ];

    languages.forEach(({ input, expected }) => {
      const customProps = {
        ...defaultProps,
        node: {
          ...defaultProps.node,
          attrs: { language: input },
        },
      };

      render(<CodeBlock {...customProps} />);
      expect(screen.getByText(expected)).toBeInTheDocument();

      // Cleanup for next iteration
      render(<div />); // Clear the previous render
    });
  });

  it('copies code content when copy button is clicked', async () => {
    // Create a mock for the ref that will be used in the component
    const mockCodeElement = document.createElement('code');
    mockCodeElement.textContent = 'console.log("Hello, World!");';

    const mockPreElement = document.createElement('pre');
    mockPreElement.appendChild(mockCodeElement);

    // Mock useRef to return our pre element with the code child
    jest.spyOn(React, 'useRef').mockImplementation(() => ({
      current: mockPreElement
    }));

    render(<CodeBlock {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton!);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('console.log("Hello, World!");');
    });
  });

  it('shows success icon when copy is successful', async () => {
    // Mock useRef to return a pre element with code content
    const mockCodeElement = document.createElement('code');
    mockCodeElement.textContent = 'console.log("Hello, World!");';

    const mockPreElement = document.createElement('pre');
    mockPreElement.appendChild(mockCodeElement);

    jest.spyOn(React, 'useRef').mockImplementation(() => ({
      current: mockPreElement
    }));

    mockWriteText.mockResolvedValue(Promise.resolve());

    render(<CodeBlock {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton!);

    // After clicking, should show check icon (because the copy state is immediately set)
    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('reverts to copy icon after timeout', async () => {
    // Mock useRef to return a pre element with code content
    const mockCodeElement = document.createElement('code');
    mockCodeElement.textContent = 'console.log("Hello, World!");';

    const mockPreElement = document.createElement('pre');
    mockPreElement.appendChild(mockCodeElement);

    jest.spyOn(React, 'useRef').mockImplementation(() => ({
      current: mockPreElement
    }));

    jest.useFakeTimers();
    mockWriteText.mockResolvedValue(Promise.resolve());

    render(<CodeBlock {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton!);

    // After clicking, should show check icon
    await expect(screen.findByTestId('check-icon')).resolves.toBeInTheDocument();

    // Advance timers by 1000ms to trigger timeout - wrapped in act to handle state updates
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // After timeout, should show copy icon again
    await waitFor(() => {
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    }, { timeout: 2000 });

    jest.useRealTimers();
  });

  it('shows error in console when copy fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockWriteText.mockRejectedValue(new Error('Copy failed'));

    render(<CodeBlock {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton!);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy code: ', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles empty language by showing "Code" as default', () => {
    const propsWithEmptyLanguage = {
      ...defaultProps,
      node: {
        ...defaultProps.node,
        attrs: { language: '' },
      },
    };

    render(<CodeBlock {...propsWithEmptyLanguage} />);

    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('handles null language by showing "Code" as default', () => {
    const propsWithNullLanguage = {
      ...defaultProps,
      node: {
        ...defaultProps.node,
        attrs: { language: null as any },
      },
    };

    render(<CodeBlock {...propsWithNullLanguage} />);

    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('handles undefined language by showing "Code" as default', () => {
    const propsWithUndefinedLanguage = {
      ...defaultProps,
      node: {
        ...defaultProps.node,
        attrs: { language: undefined as any },
      },
    };

    render(<CodeBlock {...propsWithUndefinedLanguage} />);

    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('updates attributes function is passed correctly', () => {
    const updateAttributesMock = jest.fn();
    const propsWithMockUpdate = {
      ...defaultProps,
      updateAttributes: updateAttributesMock,
    };

    render(<CodeBlock {...propsWithMockUpdate} />);

    // Verify that component renders without errors with mock update function
    expect(screen.getByTestId('node-view-wrapper')).toBeInTheDocument();
  });

  it('does not copy when code element is not found', async () => {
    // Mock useRef to return a pre element without any code child element
    const mockPreElement = document.createElement('pre');
    // Intentionally not adding any code element

    // Mock the querySelector to return null when looking for 'code'
    const originalQuerySelector = Element.prototype.querySelector;
    Element.prototype.querySelector = jest.fn((selector) => {
      if (selector === 'code') {
        return null;
      }
      return originalQuerySelector.call(this, selector);
    });

    jest.spyOn(React, 'useRef').mockImplementation(() => ({
      current: mockPreElement
    }));

    render(<CodeBlock {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-icon').closest('button');
    fireEvent.click(copyButton!);

    // Should not call writeText at all since code element is null
    await waitFor(() => {
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    // Restore the original querySelector
    Element.prototype.querySelector = originalQuerySelector;
  });
});