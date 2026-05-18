import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SleekToggle from './sleek-toggle';

describe('SleekToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders the toggle component', () => {
    render(
      <SleekToggle 
        toggle="light" 
        setTheme={mockSetTheme} 
      />
    );

    const toggleElement = screen.getByRole('checkbox');
    expect(toggleElement).toBeInTheDocument();
  });

  it('renders with default medium size when no size prop is provided', () => {
    render(
      <SleekToggle
        toggle="light"
        setTheme={mockSetTheme}
      />
    );

    const inputElement = screen.getByRole('checkbox');
    const labelElement = inputElement.parentElement;
    // The default size should be 2.5rem width and 1.3rem height
    expect(labelElement).toHaveStyle({
      width: '2.5rem',
      height: '1.3rem'
    });
  });

  it('renders with small size when size prop is "sm"', () => {
    render(
      <SleekToggle
        toggle="light"
        size="sm"
        setTheme={mockSetTheme}
      />
    );

    const inputElement = screen.getByRole('checkbox');
    const labelElement = inputElement.parentElement;
    expect(labelElement).toHaveStyle({
      width: '2rem',
      height: '1rem'
    });
  });

  it('renders with medium size when size prop is "md"', () => {
    render(
      <SleekToggle
        toggle="light"
        size="md"
        setTheme={mockSetTheme}
      />
    );

    const inputElement = screen.getByRole('checkbox');
    const labelElement = inputElement.parentElement;
    expect(labelElement).toHaveStyle({
      width: '2.5rem',
      height: '1.3rem'
    });
  });

  it('renders with large size when size prop is "lg"', () => {
    render(
      <SleekToggle
        toggle="light"
        size="lg"
        setTheme={mockSetTheme}
      />
    );

    const inputElement = screen.getByRole('checkbox');
    const labelElement = inputElement.parentElement;
    expect(labelElement).toHaveStyle({
      width: '3.5rem',
      height: '1.5rem'
    });
  });

  it('is checked when toggle prop is "dark"', () => {
    render(
      <SleekToggle 
        toggle="dark" 
        setTheme={mockSetTheme} 
      />
    );

    const toggleElement = screen.getByRole('checkbox');
    expect(toggleElement).toBeChecked();
  });

  it('is not checked when toggle prop is "light"', () => {
    render(
      <SleekToggle 
        toggle="light" 
        setTheme={mockSetTheme} 
      />
    );

    const toggleElement = screen.getByRole('checkbox');
    expect(toggleElement).not.toBeChecked();
  });

  it('calls setTheme with "dark" when toggled from light to dark', () => {
    render(
      <SleekToggle 
        toggle="light" 
        setTheme={mockSetTheme} 
      />
    );

    const toggleElement = screen.getByRole('checkbox');
    fireEvent.click(toggleElement);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when toggled from dark to light', () => {
    render(
      <SleekToggle 
        toggle="dark" 
        setTheme={mockSetTheme} 
      />
    );

    const toggleElement = screen.getByRole('checkbox');
    fireEvent.click(toggleElement);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('applies correct background class when toggle is "dark"', () => {
    render(
      <SleekToggle 
        toggle="dark" 
        setTheme={mockSetTheme} 
      />
    );

    const hrElement = screen.getByRole('separator');
    expect(hrElement).toHaveClass('bg-blue-500');
  });

  it('applies correct background class when toggle is "light"', () => {
    render(
      <SleekToggle 
        toggle="light" 
        setTheme={mockSetTheme} 
      />
    );

    const hrElement = screen.getByRole('separator');
    expect(hrElement).toHaveClass('bg-accentGray');
  });

  it('applies correct transform style when toggle is "dark"', () => {
    render(
      <SleekToggle
        toggle="dark"
        size="md"
        setTheme={mockSetTheme}
      />
    );

    // Find the div with the rounded-full class (the toggle knob)
    const knobElement = document.querySelector('div.absolute.bg-slate-900.aspect-square');
    // For md size with toggle="dark", the transform should be translateX(1.2rem)
    // (2.5 - 1.3 = 1.2)
    expect(knobElement).toHaveStyle({
      transform: 'translateX(1.2rem)'
    });
  });

  it('applies correct transform style when toggle is "light"', () => {
    render(
      <SleekToggle
        toggle="light"
        size="md"
        setTheme={mockSetTheme}
      />
    );

    // Find the div with the rounded-full class (the toggle knob)
    const knobElement = document.querySelector('div.absolute.bg-slate-900.aspect-square');
    expect(knobElement).toHaveStyle({
      transform: 'translateX(0rem)'
    });
  });
});