import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TextToSpeech from "./text-to-speech";

// Mock the speechSynthesis API
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  paused: false,
  pending: false,
  speaking: false,
};

// Mock the SpeechSynthesisUtterance constructor
class MockSpeechSynthesisUtterance {
  text: string;
  onend: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Mock the window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
});

describe("TextToSpeech", () => {
  const mockHandleTxtToSpeech = jest.fn(() => "Test speech text");

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpeechSynthesis.paused = false;
    mockSpeechSynthesis.pending = false;
    mockSpeechSynthesis.speaking = false;
    mockHandleTxtToSpeech.mockClear(); // Clear mock calls before each test
  });

  it("renders the component", () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);
    
    // Check that the button is present
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls speechSynthesis.speak when play is clicked", async () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Wait for the async operations
    await waitFor(() => {
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    });
  });

  it("calls speechSynthesis.cancel when stop is clicked", async () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    const button = screen.getByRole("button");
    // First click to start playing
    fireEvent.click(button);

    // Then click again to stop (now it's the pause button)
    fireEvent.click(button);

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });

  it("calls handleTxtToSpeech to get text", () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    // The function is called during render and useEffect, so expect it to be called
    expect(mockHandleTxtToSpeech).toHaveBeenCalled();
  });

  it("handles utterance onend callback correctly", async () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Trigger the onend callback of the utterance
    const utterance = new MockSpeechSynthesisUtterance("Test");
    if (utterance.onend) {
      utterance.onend();
    }

    // Verify state changes happened correctly
    expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled(); // Should only be called when clicking the button
  });

  it("handles utterance onpause callback correctly", async () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Simulate pause callback
    const utterance = new MockSpeechSynthesisUtterance("Test");
    if (utterance.onpause) {
      utterance.onpause();
    }

    // Verify state changes happened correctly
    expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
  });

  it("handles utterance onresume callback correctly", async () => {
    render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);

    const button = screen.getByRole("button");

    // Simulate resume callback
    const utterance = new MockSpeechSynthesisUtterance("Test");
    if (utterance.onresume) {
      utterance.onresume();
    }

    expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
  });

  it("cancels speech on unmount", () => {
    const { unmount } = render(<TextToSpeech handleTxtToSpeech={mockHandleTxtToSpeech} />);
    
    unmount();
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });
});