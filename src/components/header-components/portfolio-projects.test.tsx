import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioProjects from './portfolio-projects';

describe('PortfolioProjects', () => {
  it('renders the component with the correct heading', () => {
    render(<PortfolioProjects />);

    const heading = screen.getByText('Other projects');
    expect(heading).toBeInTheDocument();
  });

  it('renders all project links', () => {
    render(<PortfolioProjects />);

    const projectLinks = screen.getAllByRole('link');
    // The number of projects defined in the component - 9 projects total
    expect(projectLinks).toHaveLength(9);
  });

  it('renders project images with correct alt text and attributes', () => {
    render(<PortfolioProjects />);

    const images = screen.getAllByRole('img');
    // There should be 9 project images (one for each project)
    expect(images).toHaveLength(9);

    // Check the first image has the correct alt text and dimensions
    const firstImage = images[0];
    expect(firstImage).toHaveAttribute('alt', 'img');
    expect(firstImage).toHaveAttribute('width', '50');
    expect(firstImage).toHaveAttribute('height', '50');
  });

  it('renders project names in hidden tooltips', () => {
    render(<PortfolioProjects />);

    const doPasteTooltip = screen.getByText('Do paste');
    expect(doPasteTooltip).toBeInTheDocument();

    const devvarenaTooltip = screen.getByText('Devvarena');
    expect(devvarenaTooltip).toBeInTheDocument();

    const geminiCloneTooltip = screen.getByText('Dev Gemini Clone');
    expect(geminiCloneTooltip).toBeInTheDocument();
  });

  it('renders all project items with correct structure', () => {
    render(<PortfolioProjects />);

    // Check that all projects are rendered with the expected class structure
    const links = screen.getAllByRole('link');

    // Each link should have an image inside
    links.forEach(link => {
      const image = link.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });

  it('renders project with correct links', () => {
    render(<PortfolioProjects />);

    // Updated test to match actual link names
    const doPasteLink = screen.getByRole('link', { name: /Do paste img/i });
    expect(doPasteLink).toHaveAttribute('href', 'https://do-paste.vercel.app/');
    expect(doPasteLink).toHaveAttribute('target', '_blank');

    const devvarenaLink = screen.getByRole('link', { name: /Devvarena img/i });
    expect(devvarenaLink).toHaveAttribute('href', 'https://devvarena.com/');
    expect(devvarenaLink).toHaveAttribute('target', '_blank');

    const codepenLink = screen.getByRole('link', { name: /Codepen project img/i });
    expect(codepenLink).toHaveAttribute('href', 'https://codepen.io/Devyansh-coder');
    expect(codepenLink).toHaveAttribute('target', '_blank');
  });

  it('renders container with correct classes', () => {
    render(<PortfolioProjects />);

    // Get the main container div by its test content
    const container = screen.getByText('Other projects').closest('div');
    expect(container).toHaveClass('w-52');
    expect(container).toHaveClass('h-fit');
    expect(container).toHaveClass('p-2');
  });

  it('has the correct grid structure for project display', () => {
    render(<PortfolioProjects />);

    // Find the grid container by looking for the element with grid classes
    const gridContainer = screen.getByText('Other projects').parentElement?.querySelector('div.grid') as HTMLElement;

    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-4');
    expect(gridContainer).toHaveClass('gap-3');
    expect(gridContainer).toHaveClass('mt-3');
  });
});