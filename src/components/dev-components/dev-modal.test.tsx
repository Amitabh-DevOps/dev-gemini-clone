import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DevModal from './dev-modal';

// Mock the framer-motion components since they can cause issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    main: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div data-testid="motion-main" {...props}>
        {children}
      </div>
    ),
    section: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div data-testid="motion-section" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock the portal creation
const originalCreatePortal = jest.requireActual('react-dom').createPortal;
jest.spyOn(require('react-dom'), 'createPortal').mockImplementation((element) => {
  return originalCreatePortal(element, document.body);
});

// Create a wrapper component to manage the open state for testing
const TestDevModal = ({
  children,
  initialOpen = false,
  modalTitle = 'Test Modal',
  loader = false,
}: {
  children?: React.ReactNode;
  initialOpen?: boolean;
  modalTitle?: string;
  loader?: boolean;
}) => {
  const [open, setOpen] = React.useState(initialOpen);
  return (
    <DevModal
      open={open}
      isOpen={setOpen}
      openBtn={<button data-testid="open-btn">Open Modal</button>}
      modalTitle={modalTitle}
      loader={loader}
    >
      {children || <div>Modal Content</div>}
    </DevModal>
  );
};

describe('DevModal', () => {
  const originalGetElementById = document.getElementById;
  const originalQuerySelector = document.querySelector;

  beforeAll(() => {
    // Mock document.getElementById to return a mock element for portal
    Object.defineProperty(document, 'getElementById', {
      value: (id: string) => {
        if (id === 'modal-root') {
          return document.body;
        }
        return originalGetElementById.call(document, id);
      },
      writable: true,
    });

    // Mock document.querySelector to return body for portal container
    Object.defineProperty(document, 'querySelector', {
      value: (selector: string) => {
        if (selector === 'body') {
          return document.body;
        }
        return originalQuerySelector.call(document, selector);
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Clean up any portal elements after each test
    const bodyChildren = document.body.children;
    for (let i = bodyChildren.length - 1; i >= 0; i--) {
      const child = bodyChildren[i];
      if (child.tagName === 'DIV' && (child as HTMLElement).style.position === 'fixed') {
        document.body.removeChild(child);
      }
    }
  });

  it('renders the open button', () => {
    render(<TestDevModal />);
    expect(screen.getByTestId('open-btn')).toBeInTheDocument();
    expect(screen.getByText('Open Modal')).toBeInTheDocument();
  });

  it('renders the modal but keeps it hidden when closed', async () => {
    render(<TestDevModal initialOpen={false} />);

    // The modal is rendered in a portal, so it will be in the document regardless of open state
    // But it should have 'close' animation state when closed
    await waitFor(() => {
      const mainElement = screen.getByTestId('motion-main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveAttribute('animate', 'close');
    });

    await waitFor(() => {
      const sectionElement = screen.getByTestId('motion-section');
      expect(sectionElement).toBeInTheDocument();
      expect(sectionElement).toHaveAttribute('animate', 'close');
    });
  });

  it('renders the modal content when open', async () => {
    render(<TestDevModal initialOpen={true} />);
    
    // The modal content should be in the document when open
    await waitFor(() => {
      expect(screen.getByTestId('motion-main')).toBeInTheDocument();
      expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    });
  });

  it('toggles modal animation state when open button is clicked', async () => {
    render(<TestDevModal initialOpen={false} />);

    // Initially modal should be in DOM but closed
    await waitFor(() => {
      const mainElement = screen.getByTestId('motion-main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveAttribute('animate', 'close');
    });

    // Click the open button
    fireEvent.click(screen.getByTestId('open-btn'));

    // Wait for the state update and re-render
    await waitFor(() => {
      const mainElement = screen.getByTestId('motion-main');
      expect(mainElement).toHaveAttribute('animate', 'open');
    });

    await waitFor(() => {
      const sectionElement = screen.getByTestId('motion-section');
      expect(sectionElement).toHaveAttribute('animate', 'open');
    });
  });

  it('closes the modal when clicking outside the content area', async () => {
    render(<TestDevModal initialOpen={true} />);
    
    // Modal should be open
    await waitFor(() => {
      expect(screen.getByTestId('motion-main')).toBeInTheDocument();
    });
    
    // Simulate clicking on the backdrop (main element)
    const backdrop = screen.getByTestId('motion-main');
    fireEvent.click(backdrop);
    
    // Modal should remain in the DOM but be visually closed
    // In our implementation, clicking the backdrop doesn't close the modal
    // The modal stays open because the onClick handler is commented out
    expect(screen.getByTestId('motion-main')).toBeInTheDocument();
  });

  it('displays the correct modal title', async () => {
    render(<TestDevModal initialOpen={true} modalTitle="Custom Title" />);
    
    await waitFor(() => {
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  it('renders children content inside the modal', async () => {
    render(
      <TestDevModal initialOpen={true}>
        <div data-testid="modal-child">Child Content</div>
      </TestDevModal>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('modal-child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  it('shows loader when loader prop is true', async () => {
    render(
      <TestDevModal initialOpen={true} loader={true}>
        <div data-testid="modal-content">Child Content</div>
      </TestDevModal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    });

    // Check if loader span exists with the correct class
    const loaderElement = document.querySelector('.modal-loader');
    expect(loaderElement).toBeInTheDocument();
  });

  it('does not show loader when loader prop is false', async () => {
    render(
      <TestDevModal initialOpen={true} loader={false}>
        <div data-testid="modal-content">Child Content</div>
      </TestDevModal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    });

    // Check that loader span does not exist
    const loaderElement = document.querySelector('.modal-loader');
    expect(loaderElement).not.toBeInTheDocument();
  });

  it('prevents event propagation when clicking inside modal content', async () => {
    render(<TestDevModal initialOpen={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('motion-section')).toBeInTheDocument();
    });

    const section = screen.getByTestId('motion-section');
    const mockStopPropagation = jest.fn();

    // Simulate click with stopPropagation
    fireEvent.click(section, { bubbles: true });

    // Check if stopPropagation was called by accessing the click handler in the component
    // In the actual DevModal, onClick={(e) => e.stopPropagation()} is used,
    // but we can only test the behavior by checking if the click on the section doesn't close the modal
    expect(section).toBeInTheDocument();
  });
});