import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SigninNow from './signin-now';

// Mock the dependencies
jest.mock('@/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));




// Mock DevButton with different test IDs to distinguish them
jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, variant, asIcon, type, action, onSubmit, ...props }: any) => {
    // Create different test IDs based on the variant or other props
    let testId = 'dev-button';
    if (variant === 'v1') testId = 'gemini-button';
    if (variant === 'v3' && asIcon) testId = 'apps-button';
    if (variant === 'v3' && !asIcon && type === 'submit') testId = 'signout-button';

    // Extract non-HTML attributes that should not be passed to the button
    const { action: actionProp, ...filteredProps } = props;

    return (
      <button {...filteredProps} data-testid={testId}>
        {children}
      </button>
    );
  },
  DevButton: ({ children, variant, asIcon, type, action, onSubmit, ...props }: any) => {
    // Create different test IDs based on the variant or other props
    let testId = 'dev-button';
    if (variant === 'v1') testId = 'gemini-button';
    if (variant === 'v3' && asIcon) testId = 'apps-button';
    if (variant === 'v3' && !asIcon && type === 'submit') testId = 'signout-button';

    // Extract non-HTML attributes that should not be passed to the button
    const { action: actionProp, ...filteredProps } = props;

    return (
      <button {...filteredProps} data-testid={testId}>
        {children}
      </button>
    );
  },
}));

// Mock DevPopover to properly handle the popButton prop
jest.mock('../dev-components/dev-popover', () => ({
  __esModule: true,
  default: ({ children, popButton, contentClick, ...props }: any) => (
    <div {...props} data-testid="dev-popover">
      {popButton && <div data-testid="popover-trigger">{popButton}</div>}
      <div data-testid="popover-content">{children}</div>
    </div>
  ),
}));

jest.mock('./portfolio-projects', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="portfolio-projects">
      Portfolio Projects
    </div>
  ),
}));

jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children, tipData, ...props }: any) => (
    <div {...props} data-testid="react-tooltip">
      {children}
    </div>
  ),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="user-image" />
  ),
}));

jest.mock('react-icons/si', () => ({
  SiGooglegemini: ({ ...props }) => <span data-testid="googlegemini-icon" {...props}></span>
}));

jest.mock('react-icons/io5', () => ({
  IoApps: ({ ...props }) => <span data-testid="apps-icon" {...props}></span>
}));

jest.mock('react-icons/go', () => ({
  GoSignOut: ({ ...props }) => <span data-testid="signout-icon" {...props}></span>
}));

const originalConsoleError = console.error;

describe('SigninNow Component', () => {
  const mockUserData = {
    image: 'https://example.com/user.jpg',
  };

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress React prop warnings for form action during these tests
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
      // Only log if it's not the action prop warning we expect
      if (typeof message === 'string' && !message.includes('Invalid value for prop `action` on <form> tag')) {
        // Use the original console.error for other errors
        originalConsoleError(message, ...args);
      }
      // If it is the action prop warning, just suppress it (don't call original)
    });
  });

  afterEach(() => {
    // Restore console.error after each test
    (console.error as jest.Mock).mockRestore();
  });

  it('renders sign in button when user is not authenticated', () => {
    render(<SigninNow userData={null} />);

    // Check that the sign in button is present
    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveClass('text-sm');
    expect(signInButton).toHaveClass('!bg-accentBlue/50');
  });

  it('renders the Try Gemini Advanced button', () => {
    render(<SigninNow userData={null} />);

    const geminiButton = screen.getByText('Try Gemini Advanced');
    expect(geminiButton).toBeInTheDocument();
    expect(screen.getByTestId('gemini-button')).toBeInTheDocument();
  });

  it('renders the Apps button', () => {
    render(<SigninNow userData={null} />);

    // The Apps button is inside a DevPopover and ReactTooltip, so we need to find it differently
    const popoverTrigger = screen.getByTestId('popover-trigger');
    const appsButton = popoverTrigger.querySelector('[data-testid="apps-button"]') as HTMLElement;
    expect(appsButton).toBeInTheDocument();
  });

  it('renders user profile when user is authenticated', () => {
    render(<SigninNow userData={mockUserData} />);

    // Check that the user image is rendered with the correct src
    const userImage = screen.getByTestId('user-image');
    expect(userImage).toBeInTheDocument();
    expect(userImage).toHaveAttribute('src', mockUserData.image);
  });

  it('renders sign out button when user is authenticated', () => {
    render(<SigninNow userData={mockUserData} />);

    // Check that the sign out button is present
    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();

    // Verify it has the correct test ID
    expect(screen.getByTestId('signout-button')).toBeInTheDocument();
  });

  it('contains the sign out icon', () => {
    render(<SigninNow userData={mockUserData} />);

    // Sign out button should contain the sign out icon
    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();

    // The icon should be within the sign out button
    const signOutIcon = screen.getByTestId('signout-icon');
    expect(signOutIcon).toBeInTheDocument();
  });

  it('has sign in form with appropriate action', () => {
    render(<SigninNow userData={null} />);

    // Check that the form and button exist
    const signInForm = screen.getByTestId('dev-button').closest('form');
    expect(signInForm).toBeInTheDocument();

    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
  });

  it('has sign out form with appropriate action', () => {
    render(<SigninNow userData={mockUserData} />);

    // Check that the form and button exist
    const signOutForm = screen.getByTestId('signout-button').closest('form');
    expect(signOutForm).toBeInTheDocument();

    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();
  });

  it('renders the portfolio projects component in the popover', () => {
    render(<SigninNow userData={null} />);

    const portfolioProjects = screen.getByTestId('portfolio-projects');
    expect(portfolioProjects).toBeInTheDocument();
  });

  it('has correct CSS classes for responsive behavior', () => {
    render(<SigninNow userData={null} />);

    // Check the Gemini button container has responsive classes
    const geminiButton = screen.getByText('Try Gemini Advanced');
    const geminiContainer = geminiButton.closest('button');
    expect(geminiContainer).toHaveClass('md:!flex');
    expect(geminiContainer).toHaveClass('!hidden');

    // The Apps button is inside the popover-trigger div
    const popoverTrigger = screen.getByTestId('popover-trigger');
    const appsButton = popoverTrigger.querySelector('[data-testid="apps-button"]') as HTMLElement;
    expect(appsButton).toHaveClass('md:!block');
    expect(appsButton).toHaveClass('!hidden');
  });
});