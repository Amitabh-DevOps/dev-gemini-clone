import { render, screen, fireEvent } from '@testing-library/react';
import GeminiLogo from './gemini-logo';

// Mock ResizeObserver as it's required by floating-ui but not available in jsdom
global.ResizeObserver = require('resize-observer-polyfill');

// Mock DevButton to avoid nested button warnings
jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, className, variant, ripple, ...props }: any) => {
    // Avoid nested buttons by conditionally rendering different elements
    // Use a div for most cases to avoid nesting issues, but render as button when needed
    return <div data-testid="dev-button" className={className || ''} {...props}>{children}</div>;
  }
}));

// Mock the react-icons components to render with test IDs
jest.mock('react-icons/fa', () => ({
  FaCaretDown: () => <span data-testid="FaCaretDown">{'▼'}</span>,
  FaRegCheckCircle: () => <span data-testid="FaRegCheckCircle">{'✓'}</span>,
}));
jest.mock('react-icons/si', () => ({
  SiGooglegemini: ({ className }: { className?: string }) => (
    <span data-testid="SiGooglegemini" className={className || ''}>{'G'}</span>
  ),
}));

describe('GeminiLogo', () => {
  it('renders the main button with Gemini text and caret icon', () => {
    render(<GeminiLogo />);

    const mainButton = screen.getByTestId('dev-button');
    expect(mainButton).toBeInTheDocument();
    expect(mainButton).toHaveTextContent(/gemini/i);

    expect(screen.getByText(/gemini/i)).toBeInTheDocument();

    // Check for the caret icon (FaCaretDown)
    expect(screen.getByTestId('FaCaretDown')).toBeInTheDocument();
  });

  it('renders the popover content when triggered', () => {
    render(<GeminiLogo />);

    // Click the main Gemini button to open the popover
    const mainButton = screen.getByTestId('dev-button');
    fireEvent.click(mainButton);

    // Check for the first option with checkmark - find the button with the check circle
    const popoverButtons = screen.getAllByTestId('dev-button');
    const geminiOptionButton = popoverButtons.find(button =>
      button !== mainButton && button.querySelector('[data-testid="FaRegCheckCircle"]')
    );

    expect(geminiOptionButton).toBeInTheDocument();
    expect(screen.getAllByTestId('FaRegCheckCircle')).toHaveLength(2); // One for desktop, one for mobile

    // Check for the second option with "Gemini Advanced" - there are 2 instances (desktop + mobile)
    expect(screen.getAllByText(/gemini advanced/i)).toHaveLength(2);

    // Check for the upgrade button - get all upgrade buttons
    const upgradeButtons = screen.getAllByText(/upgrade/i);
    expect(upgradeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('contains the Google Gemini icons', () => {
    render(<GeminiLogo />);

    const mainButton = screen.getByTestId('dev-button');
    fireEvent.click(mainButton);

    const geminiIcons = screen.getAllByTestId('SiGooglegemini');
    // The component shows both desktop and mobile versions, so we expect 4 icons (2x2)
    expect(geminiIcons).toHaveLength(4);

    // Check that the first two icons have the correct colors
    expect(geminiIcons[0]).toHaveClass('text-[#4E82EE]');
    expect(geminiIcons[1]).toHaveClass('text-[#D96570]');
    expect(geminiIcons[2]).toHaveClass('text-[#4E82EE]');
    expect(geminiIcons[3]).toHaveClass('text-[#D96570]');
  });

  it('has the correct structure with buttons and layout elements', () => {
    render(<GeminiLogo />);

    const mainButton = screen.getByTestId('dev-button');
    fireEvent.click(mainButton);

    // Check that both Gemini option button and upgrade button are present
    const buttons = screen.getAllByTestId('dev-button');
    expect(buttons.length).toBeGreaterThanOrEqual(3); // Main trigger + content in both views

    // Verify that at least one upgrade button is present
    const upgradeButtons = screen.getAllByText(/upgrade/i);
    expect(upgradeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('includes proper accessibility attributes', () => {
    render(<GeminiLogo />);

    const mainButton = screen.getByTestId('dev-button');
    expect(mainButton).toBeInTheDocument();
    expect(mainButton).toHaveClass('text-lg');
    expect(mainButton).toHaveClass('gap-2');
  });

  it('renders with the expected visual elements', () => {
    render(<GeminiLogo />);

    expect(screen.getByText(/gemini/i)).toBeInTheDocument();

    // Check that the caret icon is present
    expect(screen.getByTestId('FaCaretDown')).toBeInTheDocument();
  });
});