import React from 'react';
import { render, screen } from '@testing-library/react';
import DemoCmp from './demo-cmp';

// Mock the dependencies that are not available in test environment
jest.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="node-view-wrapper" className={className}>{children}</div>
  ),
}));

// Mock the react-shadow/styled-components
jest.mock('react-shadow/styled-components', () => {
  const React = require('react');
  const ReactShadow = {
    div: (props: any) => (
      <div className={props.className}>{props.children}</div>
    )
  };

  return ReactShadow;
});

// Mock the FormatOutput component
jest.mock('@/utils/shadow', () => ({
  FormatOutput: ({ children }: { children: React.ReactNode }) => <span data-testid="format-output">{children}</span>
}));

describe('DemoCmp', () => {
  const defaultProps = {
    node: {
      attrs: {
        count: 0,
      },
    },
  };

  it('renders the component with default props', () => {
    render(<DemoCmp {...defaultProps} />);

    // Check if the label is present
    expect(screen.getByText('React Component')).toBeInTheDocument();

    // Check if the wrapper div has the correct class
    const wrapper = screen.getByTestId('node-view-wrapper');
    expect(wrapper).toHaveClass('react-component');
  });

  it('displays the count from props', () => {
    const propsWithCount = {
      ...defaultProps,
      node: {
        attrs: {
          count: 5,
        },
      },
    };

    render(<DemoCmp {...propsWithCount} />);

    // Check if the count value is displayed
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders correctly with different count values', () => {
    const testCases = [0, 1, 10, 99];

    testCases.forEach((count) => {
      const props = {
        ...defaultProps,
        node: {
          attrs: {
            count,
          },
        },
      };

      render(<DemoCmp {...props} />);

      expect(screen.getByText(count.toString())).toBeInTheDocument();

      // Clean up after each render by re-rendering with empty component
      render(<></>);
    });
  });

  it('renders FormatOutput component with count value', () => {
    const propsWithCount = {
      ...defaultProps,
      node: {
        attrs: {
          count: 42,
        },
      },
    };

    render(<DemoCmp {...propsWithCount} />);

    const formatOutput = screen.getByTestId('format-output');
    expect(formatOutput).toBeInTheDocument();
    expect(formatOutput).toHaveTextContent('42');
  });
});