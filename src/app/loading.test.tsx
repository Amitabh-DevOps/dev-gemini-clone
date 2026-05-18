import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './loading';

describe('Loading component', () => {
  it('renders without crashing', () => {
    render(<Loading />);
    // Verify that a section element is present
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('renders the loader div', () => {
    render(<Loading />);
    // The loader div has class "loader"
    const loaderDiv = document.querySelector('.loader');
    expect(loaderDiv).toBeInTheDocument();
  });

  it('renders the Google icon', () => {
    render(<Loading />);
    // FcGoogle renders an SVG element
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('has the correct CSS classes on the main section', () => {
    render(<Loading />);
    const section = document.querySelector('section');
    expect(section).toHaveClass('h-full');
    expect(section).toHaveClass('w-full');
    expect(section).toHaveClass('grid');
    expect(section).toHaveClass('place-content-center');
  });

  it('has the correct CSS classes on the flex container', () => {
    render(<Loading />);
    const flexContainer = document.querySelector('.flex');
    if (flexContainer) {
      expect(flexContainer).toHaveClass('items-center');
      expect(flexContainer).toHaveClass('justify-center');
      expect(flexContainer).toHaveClass('gap-3');
      expect(flexContainer).toHaveClass('text-8xl');
    }
  });
});