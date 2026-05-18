import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DevPopover from './dev-popover';

// Mock ResizeObserver for jsdom environment
class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserver;

// Mock createPortal globally to avoid issues with DOM manipulation in tests
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((children) => children),
}));

describe('DevPopover', () => {
  const mockChildren = <div>Popover Content</div>;
  const mockPopButton = <button>Open Popover</button>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the pop button correctly', () => {
    render(
      <DevPopover popButton={mockPopButton}>
        {mockChildren}
      </DevPopover>
    );

    expect(screen.getByText('Open Popover')).toBeInTheDocument();
  });

  it('does not show popover content initially', () => {
    render(
      <DevPopover popButton={mockPopButton}>
        {mockChildren}
      </DevPopover>
    );

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('shows popover when button is clicked', async () => {
    render(
      <DevPopover popButton={mockPopButton}>
        {mockChildren}
      </DevPopover>
    );

    fireEvent.click(screen.getByText('Open Popover'));

    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });
  });

  it('toggles popover visibility when button is clicked multiple times', async () => {
    render(
      <DevPopover popButton={mockPopButton}>
        {mockChildren}
      </DevPopover>
    );

    // Click to open
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });

    // Click to close
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.queryAllByText('Popover Content')).toHaveLength(0);
    });

    // Click to open again
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });
  });

  it('closes popover when clicking outside content', async () => {
    render(
      <div>
        <DevPopover popButton={mockPopButton}>
          {mockChildren}
        </DevPopover>
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    // Open the popover
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });

    // Click outside the popover
    fireEvent.click(screen.getByTestId('outside-element'));
    await waitFor(() => {
      expect(screen.queryAllByText('Popover Content')).toHaveLength(0);
    });
  });

  it('does not close popover when clicking inside content if contentClick is false', async () => {
    render(
      <DevPopover popButton={mockPopButton} contentClick={false}>
        {mockChildren}
      </DevPopover>
    );

    // Open the popover
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });

    // Click inside the content - should not close
    fireEvent.click(screen.getAllByText('Popover Content')[0]);
    expect(screen.getAllByText('Popover Content')).toHaveLength(2);
  });

  it('closes popover when clicking inside content if contentClick is true', async () => {
    render(
      <DevPopover popButton={mockPopButton} contentClick={true}>
        {mockChildren}
      </DevPopover>
    );

    // Open the popover
    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });

    // Click inside the content - should close
    fireEvent.click(screen.getAllByText('Popover Content')[0]);
    await waitFor(() => {
      expect(screen.queryAllByText('Popover Content')).toHaveLength(0);
    });
  });

  it('renders with default place as bottom', async () => {
    render(
      <DevPopover popButton={mockPopButton}>
        {mockChildren}
      </DevPopover>
    );

    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });
  });

  it('applies custom place prop correctly', async () => {
    render(
      <DevPopover popButton={mockPopButton} place="top">
        {mockChildren}
      </DevPopover>
    );

    fireEvent.click(screen.getByText('Open Popover'));
    await waitFor(() => {
      expect(screen.getAllByText('Popover Content')).toHaveLength(2); // Desktop and mobile versions
    });
  });
});