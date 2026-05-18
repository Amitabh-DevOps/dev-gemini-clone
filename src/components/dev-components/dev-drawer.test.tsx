import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DevDrawer from './dev-drawer';

// Mock the framer-motion animations
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, className, onClick, animate, variants, initial, transition }: any) => {
      // Determine visibility based on animation state
      const isClosed = animate === "closed";
      const sectionStyle = isClosed ? { opacity: 0, visibility: 'hidden' as const } : { opacity: 1, visibility: 'visible' as const };
      return (
        <section
          className={className}
          onClick={onClick}
          data-testid="overlay-section"
          style={sectionStyle}
        >
          {children}
        </section>
      );
    },
    div: ({ children, className, onClick, animate, variants, transition }: any) => {
      // For the drawer content div
      const isClosed = animate === "closed";
      // When closed, the div will be translated out of view
      return (
        <div
          className={className}
          onClick={onClick}
          style={isClosed ? { transform: 'translateX(100%)' } : { transform: 'translateX(0%)' }}
        >
          {children}
        </div>
      );
    },
  },
  useAnimation: () => ({}),
}));

// Mock createPortal to return the content directly
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

describe('DevDrawer', () => {
  const setOpenMock = jest.fn();
  const testChildren = <div>Test content</div>;
  const openButton = <button>Open drawer</button>;

  beforeEach(() => {
    setOpenMock.mockClear();
    // Reset any mocks between tests
    jest.clearAllMocks();
  });

  it('renders the open button', () => {
    render(
      <DevDrawer openBtn={openButton} open={false} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );
    
    expect(screen.getByText('Open drawer')).toBeInTheDocument();
  });

  it('shows overlay with hidden content when open is false', () => {
    render(
      <DevDrawer openBtn={openButton} open={false} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    // When open is false, portal elements exist but are visually hidden
    const overlaySection = screen.getByTestId('overlay-section');
    expect(overlaySection).toBeInTheDocument();
    // Check that the styles indicate it's hidden
    expect(overlaySection.style.opacity).toBe('0');
  });

  it('renders the drawer when open is true', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    const drawer = screen.getByText('Drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('sticky');
  });

  it('renders children content when open', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls setOpen with false when clicking the overlay', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    // Find the overlay section using the test id we added to the mock
    const overlay = screen.getByTestId('overlay-section');
    fireEvent.click(overlay);

    expect(setOpenMock).toHaveBeenCalledWith(false);
  });

  it('calls setOpen with false when clicking the close button', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    const closeButton = screen.getByLabelText('Close drawer');
    fireEvent.click(closeButton);

    expect(setOpenMock).toHaveBeenCalledWith(false);
  });

  it('does not close when clicking inside the drawer content', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        <div>Test content</div>
      </DevDrawer>
    );

    const content = screen.getByText('Test content');
    fireEvent.click(content);

    expect(setOpenMock).not.toHaveBeenCalled();
  });

  it('has default position of right', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    const drawer = screen.getByText('Drawer');
    expect(drawer.parentElement).toHaveClass('right-0', 'top-0', 'bottom-0', 'border-l');
  });

  it('applies correct classes for left position', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock} position="left">
        {testChildren}
      </DevDrawer>
    );

    const drawer = screen.getByText('Drawer');
    expect(drawer.parentElement).toHaveClass('left-0', 'top-0', 'bottom-0', 'border-r');
  });

  it('applies correct classes for top position', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock} position="top">
        {testChildren}
      </DevDrawer>
    );

    const drawer = screen.getByText('Drawer');
    expect(drawer.parentElement).toHaveClass('top-0', 'left-0', 'right-0', 'border-b');
  });

  it('applies correct classes for bottom position', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock} position="bottom">
        {testChildren}
      </DevDrawer>
    );

    const drawer = screen.getByText('Drawer');
    expect(drawer.parentElement).toHaveClass('bottom-0', 'left-0', 'right-0', 'border-t');
  });

  it('displays the close button with correct label', () => {
    render(
      <DevDrawer openBtn={openButton} open={true} setOpen={setOpenMock}>
        {testChildren}
      </DevDrawer>
    );

    const closeButton = screen.getByLabelText('Close drawer');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('🗙');
  });
});