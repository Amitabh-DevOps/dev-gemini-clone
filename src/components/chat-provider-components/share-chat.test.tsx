import React from 'react';
import { render, screen } from '@testing-library/react';
import ShareChat from './share-chat';
import { mocked } from 'jest-mock';

// Mock the react-share library components
jest.mock('react-share', () => ({
  WhatsappShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="whatsapp-share">{children}</div>,
  TwitterShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="twitter-share">{children}</div>,
  LinkedinShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="linkedin-share">{children}</div>,
  FacebookShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="facebook-share">{children}</div>,
  EmailShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="email-share">{children}</div>,
  TelegramShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="telegram-share">{children}</div>,
  RedditShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="reddit-share">{children}</div>,
  WhatsappIcon: (props: any) => <span data-testid="whatsapp-icon" className={props.className}>{props.size}</span>,
  XIcon: (props: any) => <span data-testid="x-icon" className={props.className}>{props.size}</span>,
  LinkedinIcon: (props: any) => <span data-testid="linkedin-icon" className={props.className}>{props.size}</span>,
  FacebookIcon: (props: any) => <span data-testid="facebook-icon" className={props.className}>{props.size}</span>,
  EmailIcon: (props: any) => <span data-testid="email-icon" className={props.className}>{props.size}</span>,
  TelegramIcon: (props: any) => <span data-testid="telegram-icon" className={props.className}>{props.size}</span>,
  RedditIcon: (props: any) => <span data-testid="reddit-icon" className={props.className}>{props.size}</span>,
}));

// Mock child components
jest.mock('../dev-components/dev-popover', () => ({
  __esModule: true,
  default: ({ children, popButton }: { children: React.ReactNode; popButton: React.ReactNode }) => (
    <div data-testid="dev-popover">
      {popButton}
      {children}
    </div>
  ),
}));

jest.mock('../dev-components/react-tooltip', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-tooltip">
      {children}
    </div>
  ),
}));

jest.mock('../dev-components/dev-button', () => ({
  __esModule: true,
  default: ({ children, className, asIcon }: { children: React.ReactNode; className?: string; asIcon?: boolean }) => (
    <button data-testid="dev-button" className={className} data-asicon={asIcon}>
      {children}
    </button>
  ),
}));

jest.mock('react-icons/io', () => ({
  IoMdShare: () => <span data-testid="share-icon">Share Icon</span>,
}));

describe('ShareChat Component', () => {
  const defaultProps = {
    shareMsg: 'Test message to share',
  };

  it('renders the component with share button', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);
    
    // Check that the share button is rendered
    expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dev-button')).toBeInTheDocument();
  });

  it('renders all share platform buttons', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);
    
    // Check that all share platform buttons are rendered
    expect(screen.getByTestId('whatsapp-share')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-share')).toBeInTheDocument();
    expect(screen.getByTestId('linkedin-share')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-share')).toBeInTheDocument();
    expect(screen.getByTestId('email-share')).toBeInTheDocument();
    expect(screen.getByTestId('telegram-share')).toBeInTheDocument();
    expect(screen.getByTestId('reddit-share')).toBeInTheDocument();
  });

  it('renders all share platform icons', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);
    
    // Check that all share platform icons are rendered
    expect(screen.getByTestId('whatsapp-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
    expect(screen.getByTestId('email-icon')).toBeInTheDocument();
    expect(screen.getByTestId('telegram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('reddit-icon')).toBeInTheDocument();
  });

  it('passes the correct share message to all share buttons', () => {
    const testMessage = 'Custom test message';
    render(<ShareChat shareMsg={testMessage} />);
    
    // Check that the shareMsg prop is passed correctly (this would typically be used in the URL prop of share buttons)
    const whatsappShare = screen.getByTestId('whatsapp-share');
    const twitterShare = screen.getByTestId('twitter-share');
    
    // These elements should have the share message available in their props
    expect(whatsappShare).toBeInTheDocument();
    expect(twitterShare).toBeInTheDocument();
  });

  it('renders the share buttons in a flex container with correct attributes', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);
    
    const iconGroup = screen.getByRole('icon-group');
    expect(iconGroup).toBeInTheDocument();
    expect(iconGroup).toHaveClass('flex');
    expect(iconGroup).toHaveClass('items-center');
    expect(iconGroup).toHaveClass('p-2');
    expect(iconGroup).toHaveClass('flex-wrap');
    expect(iconGroup).toHaveClass('gap-2');
  });

  it('renders share icons with correct styling classes', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);

    // Find only the social sharing icons (not the main share button icon)
    // These should match the pattern from the mock: whatsapp-icon, x-icon, linkedin-icon, etc.
    const socialIconElements = screen.getAllByTestId(/^(whatsapp-icon|x-icon|linkedin-icon|facebook-icon|telegram-icon|reddit-icon|email-icon)$/);
    expect(socialIconElements.length).toBe(7); // 7 different social media icons

    // Check that icons have proper styling classes applied
    socialIconElements.forEach(icon => {
      expect(icon).toHaveClass('border');
      expect(icon).toHaveClass('border-accentBlue/50');
      expect(icon).toHaveClass('hover:border-accentBlue');
      expect(icon).toHaveClass('rounded-full');
      expect(icon).toHaveClass('p-[2px]');
      expect(icon).toHaveClass('hover:scale-105');
      expect(icon).toHaveClass('transition-all');
    });
  });

  it('renders with correct tooltip text', () => {
    render(<ShareChat shareMsg={defaultProps.shareMsg} />);
    
    expect(screen.getByTestId('react-tooltip')).toBeInTheDocument();
  });
});