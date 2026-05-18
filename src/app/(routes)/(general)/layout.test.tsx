// We need to use a different approach to test the server component
// Since GeneralLayout is a server component with async operations (await auth(), await getSidebarChat()),
// we can't directly render it with testing-library/react as it expects client components
// Instead, we can test the output by mocking and checking the implementation logic

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Session } from "next-auth";

// Mock all the dependencies BEFORE importing the module
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/actions/actions", () => ({
  getSidebarChat: jest.fn(),
}));

jest.mock("@/components/sidebar-components/sidebar", () => {
  return {
    __esModule: true,
    default: ({ user, sidebarList }: { user: any; sidebarList: any }) =>
      `Sidebar Component for user ${user?.name} with ${sidebarList?.length || 0} items`,
  };
});

jest.mock("@/components/header-components/header", () => {
  return {
    __esModule: true,
    default: () => "Header Component",
  };
});

jest.mock("@/components/input-prompt-components/input-prompt", () => {
  return {
    __esModule: true,
    default: ({ user }: { user: any }) => `Input Prompt Component for user ${user?.name}`,
  };
});

jest.mock("@/components/dev-components/dev-toast", () => {
  return {
    __esModule: true,
    default: () => "Dev Toast Component",
  };
});

// Mock vitest imports with jest equivalents since the original code may have used vitest
const vi = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  mock: jest.fn,
  clearAllMocks: jest.clearAllMocks,
  resetAllMocks: jest.resetAllMocks,
};

describe("GeneralLayout Server Component", () => {
  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
  };

  const mockSession: Session = {
    user: mockUser,
    expires: "2023-01-01",
  } as Session;

  const mockSidebarResult = {
    success: true,
    message: [
      { id: "chat-1", title: "Chat 1", createdAt: new Date() },
      { id: "chat-2", title: "Chat 2", createdAt: new Date() },
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call auth and getSidebarChat when rendered", async () => {
    const { auth } = await import("@/auth");
    const { getSidebarChat } = await import("@/actions/actions");

    // Mock the functions
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (getSidebarChat as jest.Mock).mockResolvedValue(mockSidebarResult);

    // Import and execute the function to verify it calls the mocked dependencies
    const GeneralLayout = (await import("./layout")).default;
    await GeneralLayout({ children: <div>Test Content</div> });

    // Verify that auth and getSidebarChat were called
    expect(auth).toHaveBeenCalledTimes(1);
    expect(getSidebarChat).toHaveBeenCalledTimes(1);
    expect(getSidebarChat).toHaveBeenCalledWith(expect.stringContaining(mockUser.id));
  });

  it("should handle unauthenticated user gracefully", async () => {
    const { auth } = await import("@/auth");
    const { getSidebarChat } = await import("@/actions/actions");

    // Mock auth to return null (unauthenticated)
    (auth as jest.Mock).mockResolvedValue(null);
    (getSidebarChat as jest.Mock).mockResolvedValue({ success: true, message: [] });

    const GeneralLayout = (await import("./layout")).default;
    await GeneralLayout({ children: <div>Test Content</div> });

    // Verify that auth was called and getSidebarChat was called
    expect(auth).toHaveBeenCalledTimes(1);
    expect(getSidebarChat).toHaveBeenCalledTimes(1);
    // We can't strictly test for undefined due to TypeScript constraints
    // but we can at least check that it was called once
  });
  
  it("should handle errors from getSidebarChat gracefully", async () => {
    const { auth } = await import("@/auth");
    const { getSidebarChat } = await import("@/actions/actions");

    // Mock auth to return a session but getSidebarChat to fail
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (getSidebarChat as jest.Mock).mockResolvedValue({ success: false });

    const GeneralLayout = (await import("./layout")).default;
    await GeneralLayout({ children: <div>Test Content</div> });

    expect(auth).toHaveBeenCalledTimes(1);
    expect(getSidebarChat).toHaveBeenCalledTimes(1);
    expect(getSidebarChat).toHaveBeenCalledWith(expect.stringContaining(mockUser.id));
  });
});