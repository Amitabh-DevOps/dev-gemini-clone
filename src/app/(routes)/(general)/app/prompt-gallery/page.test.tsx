import React from 'react';
import { render, screen } from '@testing-library/react';
import PromptGalleryPage from './page';

// Mock the external dependencies
jest.mock('@/components/prompt-gallery-components/prompt-cards', () => ({
  __esModule: true,
  default: ({ item }: { item: any }) => (
    <div data-testid="prompt-card" data-title={item.title}>
      {item.title}
    </div>
  )
}));

jest.mock('react-masonry-css', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="masonry-container">{children}</div>
  )
}));

// Mock the prompts array
jest.mock('../../../../../utils/prompts-array.json', () => [
  {
    title: 'Test Prompt',
    tags: ['test', 'example'],
    prompt: 'This is a test prompt',
    placeholder: 'Enter your test input'
  },
  {
    title: 'Another Prompt',
    tags: ['another', 'demo'],
    prompt: 'This is another test prompt',
    placeholder: 'Enter your demo input'
  }
]);

describe('Prompt Gallery Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main page container', () => {
    render(<PromptGalleryPage />);
    
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('w-full', 'max-w-4xl', 'mx-auto', 'flex', 'flex-col', 'p-5');
  });

  it('renders the header correctly', () => {
    render(<PromptGalleryPage />);
    
    const header = screen.getByText('Prompt Gallery');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('text-animation', 'bg-gradient-to-r', 'from-[#4E82EE]', 'to-[#D96570]');
  });

  it('renders the masonry container', () => {
    render(<PromptGalleryPage />);
    
    const masonryContainer = screen.getByTestId('masonry-container');
    expect(masonryContainer).toBeInTheDocument();
  });

  it('renders the default prompt card', () => {
    render(<PromptGalleryPage />);

    // Check that at least one prompt card with title "Default" is rendered
    const defaultCards = screen.getAllByTestId('prompt-card');
    const defaultCard = defaultCards.find(card => card.getAttribute('data-title') === 'Default');
    expect(defaultCard).toBeInTheDocument();
  });

  it('renders all prompt cards from the JSON file plus the default one', () => {
    render(<PromptGalleryPage />);
    
    // The JSON mock has 2 prompts, plus the default prompt = 3 total
    const promptCards = screen.getAllByTestId('prompt-card');
    expect(promptCards).toHaveLength(3); // Default card + 2 from JSON
  });

  it('passes correct props to PromptCards components', () => {
    render(<PromptGalleryPage />);
    
    const promptCards = screen.getAllByTestId('prompt-card');
    
    // First card should be the default one
    expect(promptCards[0]).toHaveAttribute('data-title', 'Default');
    
    // Second card should have title from first JSON entry
    expect(promptCards[1]).toHaveAttribute('data-title', 'Test Prompt');
    
    // Third card should have title from second JSON entry
    expect(promptCards[2]).toHaveAttribute('data-title', 'Another Prompt');
  });
});