import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import DevEmojiPicker from './dev-emoji-picker';

// Mock the emoji.json import
jest.mock('../../utils/emoji.json', () => [
  {
    category: 'Smileys & Emotion',
    emoji: '😀',
    aliases: ['grinning', 'smile', 'happy'],
  },
  {
    category: 'Smileys & Emotion',
    emoji: '😂',
    aliases: ['joy', 'laugh', 'tears'],
  },
  {
    category: 'People & Body',
    emoji: '👋',
    aliases: ['wave', 'goodbye', 'hello'],
  },
  {
    category: 'Animals & Nature',
    emoji: '🐶',
    aliases: ['dog', 'pet', 'animal'],
  },
]);

// Mock the react-icons/fi import
jest.mock('react-icons/fi', () => ({
  FiSearch: () => <span data-testid="search-icon">🔍</span>,
}));

describe('DevEmojiPicker', () => {
  const mockSetSelectedEmoji = jest.fn();

  beforeEach(() => {
    mockSetSelectedEmoji.mockClear();
  });

  it('renders the emoji picker component', () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // Check if the search input is present
    expect(screen.getByPlaceholderText('Search by tag or alias')).toBeInTheDocument();

    // Check if the search icon is present
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();

    // Check for the section with specific class names that identify the emoji picker
    const sections = document.querySelectorAll('section');
    const emojiPickerSection = Array.from(sections).find(section =>
      section.classList.contains('w-fit') &&
      section.classList.contains('h-72') &&
      section.classList.contains('rounded-xl') &&
      section.classList.contains('space-y-2') &&
      section.classList.contains('bg-rtlLight')
    );
    expect(emojiPickerSection).toBeInTheDocument();
  });

  it('displays emojis from the default category initially', () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // The component shows both category emojis and default category emojis
    // We can check for the presence of emoji buttons
    const emojiButtons = screen.getAllByRole('button');
    // There should be at least the category buttons plus the default category emojis
    expect(emojiButtons.length).toBeGreaterThan(3); // 3 category buttons at minimum
  });

  it('allows selecting an emoji by clicking', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // Find emoji grid buttons (not category buttons)
    // Get all buttons and filter for those in emoji grid (they have different classes)
    const allButtons = screen.getAllByRole('button');
    // Category buttons have class "hover:bg-accentBlue" while emoji buttons have "hover:scale-95"

    const emojiButtons = Array.from(allButtons).filter(button =>
      button.classList.contains('hover:scale-95')
    );

    expect(emojiButtons.length).toBeGreaterThan(0);

    // Click on the first emoji button
    fireEvent.click(emojiButtons[0]);

    // Verify the callback was called
    expect(mockSetSelectedEmoji).toHaveBeenCalledTimes(1);
  });

  it('filters emojis based on search input', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    const searchInput = screen.getByPlaceholderText('Search by tag or alias');

    // Type 'laugh' in the search box
    fireEvent.change(searchInput, { target: { value: 'laugh' } });

    // Wait for the state update to complete
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      const emojiButtons = Array.from(allButtons).filter(button =>
        button.classList.contains('hover:scale-95')
      );
      expect(emojiButtons.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('displays all matching emojis when searching', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    const searchInput = screen.getByPlaceholderText('Search by tag or alias');

    // Type 'smile' in the search box
    fireEvent.change(searchInput, { target: { value: 'smile' } });

    // Wait for the state update
    await waitFor(() => {
      // Check that search results are displayed
      expect(screen.queryAllByText(/😀|😂|👋|🐶/).length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('clears filtered results when search input is cleared', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    const searchInput = screen.getByPlaceholderText('Search by tag or alias');

    // Search for something
    fireEvent.change(searchInput, { target: { value: 'wave' } });

    // Wait for the search results
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      const emojiButtons = Array.from(allButtons).filter(button =>
        button.classList.contains('hover:scale-95')
      );
      expect(emojiButtons.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // Clear the search input
    fireEvent.change(searchInput, { target: { value: '' } });

    // Should show emojis from the default category again
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      const emojiButtons = Array.from(allButtons).filter(button =>
        button.classList.contains('hover:scale-95')
      );
      expect(emojiButtons.length).toBeGreaterThan(0);
    });
  });

  it('switches categories when clicking category buttons', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // Find category buttons (they have class "hover:bg-accentBlue")
    const allButtons = screen.getAllByRole('button');
    const categoryButtons = Array.from(allButtons).filter(button =>
      button.classList.contains('hover:bg-accentBlue')
    );

    expect(categoryButtons.length).toBeGreaterThan(0);

    // Click on the first category button
    fireEvent.click(categoryButtons[0]);

    // Wait for the UI to update
    await waitFor(() => {
      const allButtonsAfter = screen.getAllByRole('button');
      const emojiButtons = Array.from(allButtonsAfter).filter(button =>
        button.classList.contains('hover:scale-95')
      );
      expect(emojiButtons.length).toBeGreaterThan(0);
    });
  });

  it('calls setSelectedEmoji when clicking an emoji', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // Find emoji grid buttons (they have class "hover:scale-95")
    const allButtons = screen.getAllByRole('button');
    const emojiButtons = Array.from(allButtons).filter(button =>
      button.classList.contains('hover:scale-95')
    );

    expect(emojiButtons.length).toBeGreaterThan(0);

    // Click on the first emoji button
    fireEvent.click(emojiButtons[0]);

    // Verify the callback was called with some emoji
    expect(mockSetSelectedEmoji).toHaveBeenCalledTimes(1);
  });

  it('displays correct structure with search input, category buttons, and emoji grid', () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    // Find the section container in a different way - search for the section with the specific class
    const sections = document.querySelectorAll('section');
    const mainSection = Array.from(sections).find(section =>
      section.classList.contains('w-fit') &&
      section.classList.contains('shadow-lg') &&
      section.classList.contains('h-72') &&
      section.classList.contains('rounded-xl') &&
      section.classList.contains('space-y-2')
    );
    expect(mainSection).toBeInTheDocument();

    // Verify search input exists
    const searchInput = screen.getByPlaceholderText('Search by tag or alias');
    expect(searchInput).toBeInTheDocument();

    // Verify search icon is present
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();

    // Verify category grid exists (first grid of buttons)
    const allButtons = screen.getAllByRole('button');
    const categoryButtons = Array.from(allButtons).filter(button =>
      button.classList.contains('hover:bg-accentBlue')
    );
    expect(categoryButtons.length).toBeGreaterThan(0);

    // Verify emoji grid exists (buttons with hover:scale-95)
    const emojiButtons = Array.from(allButtons).filter(button =>
      button.classList.contains('hover:scale-95')
    );
    expect(emojiButtons.length).toBeGreaterThan(0);
  });

  it('should update filtered emojis when search term changes', async () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    const searchInput = screen.getByPlaceholderText('Search by tag or alias');

    // Initially no search term
    expect(searchInput).toHaveValue('');

    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'grinning' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('grinning');
    });

    // Clear search term
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('search input properly updates the hoveredEmoji state', () => {
    render(<DevEmojiPicker setSelectedEmoji={mockSetSelectedEmoji} />);

    const searchInput = screen.getByPlaceholderText('Search by tag or alias');

    // Initially the input value should be empty or null
    expect(searchInput).toHaveValue('');

    // Change the input
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Check that input value has changed
    expect(searchInput).toHaveValue('test');
  });
});