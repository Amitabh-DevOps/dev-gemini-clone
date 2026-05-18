import { render, screen } from '@testing-library/react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Page from './page';
import React from 'react';

// Mock the auth function
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`Redirect called with ${url}`);
  }),
}));

// Mock the DevButton component
jest.mock('@/components/dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, href, className }: { children: React.ReactNode; href?: string; className?: string }) => (
    <button className={className} data-href={href}>
      {children}
    </button>
  ),
}));

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaGithub: () => <svg data-testid="fa-github-icon" />,
}));

jest.mock('react-icons/fa6', () => ({
  FaArrowRightLong: () => <svg data-testid="fa-arrow-right-long-icon" />,
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when no session exists', async () => {
    // Mock auth to return null (no session)
    (auth as jest.Mock).mockResolvedValue(null);

    await render(await Page());

    // Check if the GitHub button is present
    expect(screen.getByText('Try Now')).toBeInTheDocument();

    // Check if the GitHub icon is rendered
    expect(screen.getByTestId('fa-github-icon')).toBeInTheDocument();

    // Check if the arrow icon is rendered
    expect(screen.getByTestId('fa-arrow-right-long-icon')).toBeInTheDocument();
  });

  it('should redirect to /app when session exists', async () => {
    // Mock auth to return a session object
    const mockSession = { user: { name: 'Test User' } };
    (auth as jest.Mock).mockResolvedValue(mockSession);

    // Capture any redirect calls by catching the thrown error
    try {
      await render(await Page());
      // If we get here, redirect was not called
    } catch (error) {
      // Check if the error is the one we threw from the redirect mock
      if (error instanceof Error && error.message.includes('Redirect called with /app')) {
        // This confirms the redirect was called properly
      } else {
        // If it's a different error, re-throw it
        throw error;
      }
    }

    // Verify that redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/app');
  });

  it('should render the correct elements when not authenticated', async () => {
    // Mock auth to return null (no session)
    (auth as jest.Mock).mockResolvedValue(null);

    await render(await Page());

    // Find the main section element by its class - we'll use querySelector directly since testing-library doesn't find a role for it
    const sectionElement = document.querySelector('section');
    expect(sectionElement).toBeInTheDocument();

    // Check for the GitHub link button
    const githubButton = screen.getByTestId('fa-github-icon').closest('button');
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toHaveAttribute('data-href', 'https://github.com/Amitabh-DevOps/dev-gemini-clone');

    // Check for the "Try Now" button
    const tryNowButton = screen.getByText('Try Now');
    expect(tryNowButton).toBeInTheDocument();
    expect(tryNowButton.closest('button')).toHaveAttribute('data-href', '/app');
  });
});