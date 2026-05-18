import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReactTooltip from './react-tooltip';

// Mock the react-tooltip component
jest.mock('react-tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...props} data-testid="motion-div">{children}</div>
    )
  }
}));

// Mock useId to return a consistent value
const mockUseId = jest.fn();
const originalUseId = React.useId;
React.useId = () => mockUseId();

describe('ReactTooltip', () => {
  beforeEach(() => {
    mockUseId.mockReturnValue('test-id');
    // Mock document.body for portal
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders children correctly', () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    // Check that the child element is rendered
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });

  test('renders tooltip with default place', async () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    // Wait for the portal to be created
    await waitFor(() => {
      expect(document.body.querySelector('[data-testid="tooltip"]')).toBeInTheDocument();
    });

    // Check that the tooltip content is rendered
    const tooltipElement = document.body.querySelector('[data-testid="tooltip"]');
    expect(tooltipElement).toBeInTheDocument();
  });

  test('renders tooltip with custom place', async () => {
    render(
      <ReactTooltip tipData="Test tooltip" place="bottom">
        <span>Child element</span>
      </ReactTooltip>
    );

    // Wait for the portal to be created
    await waitFor(() => {
      const tooltipElement = document.body.querySelector('[data-testid="tooltip"]');
      expect(tooltipElement).toBeInTheDocument();
    });
  });

  test('renders tooltip with custom tipData', async () => {
    const tipData = "Custom tooltip text";
    
    render(
      <ReactTooltip tipData={tipData}>
        <span>Child element</span>
      </ReactTooltip>
    );

    // Wait for the portal to be created
    await waitFor(() => {
      const motionDiv = document.body.querySelector('[data-testid="motion-div"]');
      expect(motionDiv).toBeInTheDocument();
      expect(motionDiv).toHaveTextContent(tipData);
    });
  });

  test('applies correct CSS classes when occupy is true (default)', () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    const childWrapper = screen.getByText('Child element').parentElement;
    expect(childWrapper).toHaveClass('w-fit');
  });

  test('applies correct CSS classes when occupy is false', () => {
    render(
      <ReactTooltip tipData="Test tooltip" occupy={false}>
        <span>Child element</span>
      </ReactTooltip>
    );

    const childWrapper = screen.getByText('Child element').parentElement;
    expect(childWrapper).toHaveClass('w-auto');
  });

  test('sets correct data attributes', () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    const childWrapper = screen.getByText('Child element').parentElement;
    expect(childWrapper).toHaveAttribute('data-tooltip-id');
    // Check that the attribute exists and has a value that looks like a React-generated ID
    const idValue = childWrapper?.getAttribute('data-tooltip-id');
    expect(idValue).toMatch(/^:r\d+:$/); // React's useId generates IDs like ":r0:", ":r1:", etc.
  });

  test('tooltip has correct styling', async () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    // Wait for the portal to be created
    await waitFor(() => {
      const motionDiv = document.body.querySelector('[data-testid="motion-div"]');
      expect(motionDiv).toBeInTheDocument();
      
      // Check for expected classes
      expect(motionDiv).toHaveClass('bg-slate-700');
      expect(motionDiv).toHaveClass('z-50');
      expect(motionDiv).toHaveClass('text-white');
      expect(motionDiv).toHaveClass('text-xs');
      expect(motionDiv).toHaveClass('p-1');
      expect(motionDiv).toHaveClass('px-2');
      expect(motionDiv).toHaveClass('rounded-[5px]');
    });
  });

  test('motion component has correct initial and animate props', async () => {
    render(
      <ReactTooltip tipData="Test tooltip">
        <span>Child element</span>
      </ReactTooltip>
    );

    // Wait for the portal to be created
    await waitFor(() => {
      const motionDiv = document.body.querySelector('[data-testid="motion-div"]');
      expect(motionDiv).toHaveAttribute('initial');
      expect(motionDiv).toHaveAttribute('animate');
    });
  });
});