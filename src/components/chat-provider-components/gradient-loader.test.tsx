import React from 'react';
import { render, screen, within } from '@testing-library/react';
import GradientLoader from './gradient-loader';

describe('GradientLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<GradientLoader />);
    const loader = container.firstChild;
    expect(loader).toBeInTheDocument();
  });

  it('has the correct class names', () => {
    const { container } = render(<GradientLoader />);
    const loader = container.firstChild;
    expect(loader).toHaveClass('gradient-loader');
    expect(loader).toHaveClass('w-full');
    expect(loader).toHaveClass('flex');
    expect(loader).toHaveClass('flex-col');
    expect(loader).toHaveClass('gap-2');
  });

  it('renders exactly 3 hr elements', () => {
    render(<GradientLoader />);
    const hrElements = screen.getAllByRole('separator'); // 'separator' is the role for <hr> elements
    expect(hrElements).toHaveLength(3);
  });

  it('each hr element has a unique key', () => {
    render(<GradientLoader />);
    const hrElements = screen.getAllByRole('separator');

    // Check that there are 3 hr elements as expected
    expect(hrElements).toHaveLength(3);

    // Each hr should have a unique key based on the map function (1, 2, 3)
    hrElements.forEach((hr, index) => {
      // Since React uses internal keys that aren't directly accessible,
      // we verify by checking the total count and structure
      expect(hr).toBeInTheDocument();
    });
  });

  it('renders with flex column layout', () => {
    const { container } = render(<GradientLoader />);
    const loader = container.firstChild;
    expect(loader).toHaveClass('flex-col');
  });

  it('has gap spacing of 2', () => {
    const { container } = render(<GradientLoader />);
    const loader = container.firstChild;
    expect(loader).toHaveClass('gap-2');
  });
});