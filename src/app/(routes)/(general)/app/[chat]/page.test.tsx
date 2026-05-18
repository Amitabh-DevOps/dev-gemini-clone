import { render, screen } from "@testing-library/react";
import Page from "./page";
import { auth } from "@/auth";
import { getChatHistory } from "@/actions/actions";
import { redirect } from "next/navigation";

// Mock the modules
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/actions/actions", () => ({
  getChatHistory: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/components/chat-provider-components/optimistic-chat", () => ({
  __esModule: true,
  default: ({ name, image, message }: { name: string; image: string; message: any }) => (
    <div data-testid="optimistic-chat" data-name={name} data-image={image} data-message={JSON.stringify(message)}>
      OptimisticChat Component
    </div>
  ),
}));

jest.mock("@/components/chat-provider-components/msg-loader", () => ({
  __esModule: true,
  default: ({ name, image }: { name: string; image: string }) => (
    <div data-testid="msg-loader" data-name={name} data-image={image}>
      MsgLoader Component
    </div>
  ),
}));

// Define a type for the mock functions to ensure proper typing
const mockAuth = auth as jest.MockedFunction<any>;
const mockGetChatHistory = getChatHistory as jest.MockedFunction<any>;
const mockRedirect = redirect as jest.MockedFunction<any>;

describe("Chat Page", () => {
  const mockParams = { chat: "test-chat-id" };
  const mockUser = {
    id: "user-123",
    name: "Test User",
    image: "https://example.com/image.jpg",
  };
  const mockSession = {
    user: mockUser,
  };
  const mockMessages = [
    {
      id: "msg-1",
      role: "user",
      content: "Hello",
    },
    {
      id: "msg-2",
      role: "assistant",
      content: "Hi there!",
    },
  ];
  const mockFetchedData = {
    success: true,
    message: mockMessages,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders OptimisticChat and MsgLoader components when user is authenticated and chat fetch is successful", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockGetChatHistory.mockResolvedValue(mockFetchedData);

    // Suppress console.error for the suspense boundary that may occur with async server components
    const originalError = console.error;
    console.error = jest.fn();

    await render(await Page({ params: mockParams }));

    // Restore console.error
    console.error = originalError;

    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(mockGetChatHistory).toHaveBeenCalledWith({
      chatID: "test-chat-id",
      userID: "user-123",
    });
    expect(screen.getByTestId("optimistic-chat")).toBeInTheDocument();
    expect(screen.getByTestId("msg-loader")).toBeInTheDocument();
  });

  it("throws an error when user is not authenticated (because page has bug - tries to destructure undefined)", async () => {
    mockAuth.mockResolvedValue(null);

    const originalError = console.error;
    console.error = jest.fn();

    await expect(Page({ params: mockParams })).rejects.toThrow();

    // Restore console.error
    console.error = originalError;

    expect(mockAuth).toHaveBeenCalledTimes(1);
    // getChatHistory will be called but will fail due to undefined session.user
    expect(mockGetChatHistory).toHaveBeenCalledWith({
      chatID: "test-chat-id",
      userID: undefined,
    });
  });

  it("redirects to /app when chat fetch is unsuccessful", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockGetChatHistory.mockResolvedValue({
      success: false,
      message: null,
    });

    const originalError = console.error;
    console.error = jest.fn();

    await Page({ params: mockParams });

    // Restore console.error
    console.error = originalError;

    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(mockGetChatHistory).toHaveBeenCalledWith({
      chatID: "test-chat-id",
      userID: "user-123",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/app");
  });

  it("throws an error when session exists but user data is missing", async () => {
    const mockSessionWithoutUser = { user: undefined };
    mockAuth.mockResolvedValue(mockSessionWithoutUser);

    mockGetChatHistory.mockResolvedValue(mockFetchedData);

    const originalError = console.error;
    console.error = jest.fn();

    await expect(Page({ params: mockParams })).rejects.toThrow();

    // Restore console.error
    console.error = originalError;

    expect(mockAuth).toHaveBeenCalledTimes(1);
    expect(mockGetChatHistory).toHaveBeenCalledWith({
      chatID: "test-chat-id",
      userID: undefined,
    });
  });

  it("passes correct props to child components when authenticated and chat fetch is successful", async () => {
    mockAuth.mockResolvedValue(mockSession);
    mockGetChatHistory.mockResolvedValue(mockFetchedData);

    const originalError = console.error;
    console.error = jest.fn();

    await render(await Page({ params: mockParams }));

    // Restore console.error
    console.error = originalError;

    const optimisticChat = screen.getByTestId("optimistic-chat");
    expect(optimisticChat).toBeInTheDocument();
    expect(optimisticChat.getAttribute("data-name")).toBe("Test User");
    expect(optimisticChat.getAttribute("data-image")).toBe("https://example.com/image.jpg");
    expect(optimisticChat.getAttribute("data-message")).toBe(JSON.stringify(mockMessages));

    const msgLoader = screen.getByTestId("msg-loader");
    expect(msgLoader).toBeInTheDocument();
    expect(msgLoader.getAttribute("data-name")).toBe("Test User");
    expect(msgLoader.getAttribute("data-image")).toBe("https://example.com/image.jpg");
  });
});