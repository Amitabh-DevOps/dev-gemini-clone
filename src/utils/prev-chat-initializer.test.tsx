import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrevChatInitializer from './prev-chat-initializer';
import geminiZustand from '@/utils/gemini-zustand';

// Mock the gemini-zustand module
jest.mock('@/utils/gemini-zustand', () => {
  const mockSetState = jest.fn();
  return {
    __esModule: true,
    default: {
      setState: mockSetState,
      prevChat: { userPrompt: '', llmResponse: '' },
    },
  };
});

describe('PrevChatInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children correctly', () => {
    const mockChildren = <div>Test Children</div>;

    const { getByText } = render(
      <PrevChatInitializer prevChat={null} children={mockChildren} />
    );

    expect(getByText('Test Children')).toBeInTheDocument();
  });

  it('calls setState with provided prevChat value', () => {
    const mockPrevChat = {
      userPrompt: 'Test prompt',
      llmResponse: 'Test response'
    };

    render(
      <PrevChatInitializer prevChat={mockPrevChat} children={<div>Test Children</div>} />
    );

    expect(geminiZustand.setState).toHaveBeenCalledWith({
      prevChat: mockPrevChat
    });
  });

  it('calls setState with default value when prevChat is null', () => {
    render(
      <PrevChatInitializer prevChat={null} children={<div>Test Children</div>} />
    );

    expect(geminiZustand.setState).toHaveBeenCalledWith({
      prevChat: { userPrompt: '', llmResponse: '' }
    });
  });

  it('calls setState with default value when prevChat is undefined', () => {
    render(
      <PrevChatInitializer prevChat={undefined} children={<div>Test Children</div>} />
    );

    expect(geminiZustand.setState).toHaveBeenCalledWith({
      prevChat: { userPrompt: '', llmResponse: '' }
    });
  });

  it('calls setState with provided prevChat when it has valid values', () => {
    const mockPrevChat = {
      userPrompt: 'Custom prompt',
      llmResponse: 'Custom response'
    };

    render(
      <PrevChatInitializer prevChat={mockPrevChat} children={<div>Test Children</div>} />
    );

    expect(geminiZustand.setState).toHaveBeenCalledWith({
      prevChat: mockPrevChat
    });
  });
});