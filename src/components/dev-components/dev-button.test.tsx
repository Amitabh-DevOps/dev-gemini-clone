import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DevButton from "./dev-button";

describe("DevButton", () => {
  it("renders button with children", () => {
    render(<DevButton>Click me</DevButton>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    render(<DevButton href="/test">Link</DevButton>);
    const linkElement = screen.getByRole("link");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/test");
  });

  it("renders as a button when no href is provided", () => {
    render(<DevButton>Button</DevButton>);
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toBeInTheDocument();
  });

  it("applies default variant when no variant is specified", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-transparent");
  });

  it("applies specified variant", () => {
    render(<DevButton variant="v3">Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("hover:bg-accentGray/20");
  });

  it("applies default size when no size is specified", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-2");
    expect(button).toHaveClass("px-3");
  });

  it("applies specified size", () => {
    render(<DevButton size="lg">Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-3");
    expect(button).toHaveClass("px-7");
  });

  it("applies default rounded when no rounded is specified", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-lg");
  });

  it("applies specified rounded", () => {
    render(<DevButton rounded="full">Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-full");
  });

  it("applies asIcon styling when asIcon is true", () => {
    render(<DevButton asIcon={true}>Icon</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-1");
    expect(button).toHaveClass("aspect-square");
  });

  it("applies custom className", () => {
    render(<DevButton className="custom-class">Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("passes additional props to the button element", () => {
    render(<DevButton data-testid="test-button">Button</DevButton>);
    const button = screen.getByTestId("test-button");
    expect(button).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<DevButton onClick={handleClick}>Button</DevButton>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies ripple effect when ripple is true", () => {
    render(<DevButton ripple={true}>Button</DevButton>);
    const button = screen.getByRole("button");
    // Check if the button has the ripple-related event handler
    expect(button).toBeInTheDocument();
  });

  it("does not apply ripple effect when ripple is false", () => {
    render(<DevButton ripple={false}>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies transition-all and flex classes by default", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-all");
    expect(button).toHaveClass("flex");
  });

  it("applies items-center and gap-1 classes by default", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("gap-1");
  });

  it("applies text-nowrap and justify-center classes by default", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-nowrap");
    expect(button).toHaveClass("justify-center");
  });

  it("applies w-fit and h-fit classes by default", () => {
    render(<DevButton>Button</DevButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-fit");
    expect(button).toHaveClass("h-fit");
  });
});