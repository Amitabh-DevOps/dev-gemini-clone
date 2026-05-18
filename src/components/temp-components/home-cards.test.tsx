import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeCards from './home-cards';

// Mock the geminiZustand hook
const mockSetCurrChat = jest.fn();
jest.mock('@/utils/gemini-zustand', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setCurrChat: mockSetCurrChat,
  })),
}));

describe('HomeCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HomeCards />);
    // Select by the main container's CSS classes
    const gridContainer = document.querySelector('.w-full.h-auto.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  it('displays 4 random prompts', () => {
    render(<HomeCards />);
    const cardElements = document.querySelectorAll('div.cursor-pointer');
    expect(cardElements).toHaveLength(4);
  });

  it('each card contains a prompt text', () => {
    render(<HomeCards />);
    const cardElements = document.querySelectorAll('div.cursor-pointer');

    cardElements.forEach(cardElement => {
      const promptText = cardElement.querySelector('p');
      expect(promptText).toBeInTheDocument();
      expect(promptText?.textContent).toBeTruthy();
    });
  });

  it('clicking on a card calls setCurrChat with correct parameters', () => {
    render(<HomeCards />);
    const cardElements = document.querySelectorAll('div.cursor-pointer');

    // Click the first card
    fireEvent.click(cardElements[0]);

    // Verify that setCurrChat was called with the correct parameters
    expect(mockSetCurrChat).toHaveBeenCalledWith('userPrompt', expect.any(String));
  });

  it('passes correct arguments to setCurrChat when clicked', () => {
    render(<HomeCards />);
    const cardElements = document.querySelectorAll('div.cursor-pointer');

    // Get the text content of the first card before clicking
    const firstCardText = cardElements[0].querySelector('p')?.textContent || '';

    fireEvent.click(cardElements[0]);

    // Verify the call was made with the correct prompt text
    expect(mockSetCurrChat).toHaveBeenCalledWith('userPrompt', firstCardText);
  });

  it('applies correct CSS classes to the container', () => {
    render(<HomeCards />);
    const container = document.querySelector('.w-full.h-auto.grid');
    expect(container).toHaveClass('grid');
    expect(container).toHaveClass('md:grid-cols-4');
    expect(container).toHaveClass('grid-cols-1');
    expect(container).toHaveClass('gap-2');
    expect(container).toHaveClass('mt-5');
    expect(container).toHaveClass('md:mt-16');
  });

  it('applies correct CSS classes to individual cards', () => {
    render(<HomeCards />);
    const cardElements = document.querySelectorAll('div.cursor-pointer');

    cardElements.forEach(cardElement => {
      expect(cardElement.classList.contains('cursor-pointer')).toBe(true);
      expect(cardElement.classList.contains('rounded-xl')).toBe(true);
      expect(cardElement.classList.contains('p-4')).toBe(true);
      expect(cardElement.classList.contains('font-light')).toBe(true);
    });
  });
});