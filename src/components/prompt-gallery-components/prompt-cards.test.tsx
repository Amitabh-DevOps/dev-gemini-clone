import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptCards from './prompt-cards';
import geminiZustand from '@/utils/gemini-zustand';

// Mock the geminiZustand
jest.mock('@/utils/gemini-zustand', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockSetCustomPrompt = jest.fn();

// Set up the mock before each test
beforeEach(() => {
  (geminiZustand as jest.MockedFunction<any>).mockReturnValue({
    setCustomPrompt: mockSetCustomPrompt,
  });
  mockSetCustomPrompt.mockClear();
});

describe('PromptCards Component', () => {
  const mockItem = {
    title: 'Test Title',
    prompt: 'Test Prompt',
    placeholder: 'Test Placeholder',
    tags: ['tag1', 'tag2', 'tag3'],
  };

  it('renders the title correctly', () => {
    render(<PromptCards item={mockItem} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders all tags correctly', () => {
    render(<PromptCards item={mockItem} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('applies correct CSS classes to the container', () => {
    render(<PromptCards item={mockItem} />);

    // Get the container by looking for specific class combination
    const container = screen.getByText('Test Title').closest('div');
    expect(container).toHaveClass('my-2');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('cursor-pointer');
    expect(container).toHaveClass('border-2');
    expect(container).toHaveClass('border-transparent');
    expect(container).toHaveClass('hover:border-accentBlue/50');
    expect(container).toHaveClass('bg-rtlLight');
    expect(container).toHaveClass('dark:bg-rtlDark');
    expect(container).toHaveClass('p-5');
    expect(container).toHaveClass('overflow-hidden');
    expect(container).toHaveClass('space-y-2');
  });

  it('calls setCustomPrompt when clicked', () => {
    render(<PromptCards item={mockItem} />);

    const titleElement = screen.getByText('Test Title');
    const container = titleElement.closest('div');
    fireEvent.click(container!);

    expect(mockSetCustomPrompt).toHaveBeenCalledTimes(1);
    expect(mockSetCustomPrompt).toHaveBeenCalledWith({
      prompt: 'Test Prompt',
      placeholder: 'Test Placeholder',
    });
  });

  it('renders tags with correct styling', () => {
    render(<PromptCards item={mockItem} />);

    // Find each tag span and verify its classes
    const tag1Element = screen.getByText('tag1');
    const tag2Element = screen.getByText('tag2');
    const tag3Element = screen.getByText('tag3');

    // Check that each tag span has the expected classes
    expect(tag1Element).toHaveClass('p-1');
    expect(tag1Element).toHaveClass('px-2');
    expect(tag1Element).toHaveClass('rounded-full');
    expect(tag1Element).toHaveClass('bg-accentBlue/30');
    expect(tag1Element).toHaveClass('text-xs');

    expect(tag2Element).toHaveClass('p-1');
    expect(tag2Element).toHaveClass('px-2');
    expect(tag2Element).toHaveClass('rounded-full');
    expect(tag2Element).toHaveClass('bg-accentBlue/30');
    expect(tag2Element).toHaveClass('text-xs');

    expect(tag3Element).toHaveClass('p-1');
    expect(tag3Element).toHaveClass('px-2');
    expect(tag3Element).toHaveClass('rounded-full');
    expect(tag3Element).toHaveClass('bg-accentBlue/30');
    expect(tag3Element).toHaveClass('text-xs');
  });

  it('maps through all tags in the item', () => {
    const threeTagsItem = {
      ...mockItem,
      tags: ['first', 'second', 'third'],
    };

    render(<PromptCards item={threeTagsItem} />);

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
    expect(screen.getByText('third')).toBeInTheDocument();
  });

  it('works with different item data', () => {
    const differentItem = {
      title: 'Different Title',
      prompt: 'Different Prompt',
      placeholder: 'Different Placeholder',
      tags: ['different-tag'],
    };

    render(<PromptCards item={differentItem} />);

    expect(screen.getByText('Different Title')).toBeInTheDocument();
    expect(screen.getByText('different-tag')).toBeInTheDocument();

    const titleElement = screen.getByText('Different Title');
    const container = titleElement.closest('div');
    fireEvent.click(container!);

    expect(mockSetCustomPrompt).toHaveBeenCalledWith({
      prompt: 'Different Prompt',
      placeholder: 'Different Placeholder',
    });
  });
});