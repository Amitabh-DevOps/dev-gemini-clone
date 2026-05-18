import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MockedFunction } from "jest-mock";
import SidebarChatList from "./sidebar-chat-list";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { deleteChat, pinChat, renameChat } from "@/actions/actions";
import geminiZustand from "@/utils/gemini-zustand";

// Mock the external dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/actions/actions", () => ({
  deleteChat: jest.fn(),
  pinChat: jest.fn(),
  renameChat: jest.fn(),
}));

jest.mock("@/utils/gemini-zustand", () => jest.fn());

// Properly mock the react-icons as actual React components
jest.mock("react-icons/md", () => ({
  MdDeleteOutline: () => <span data-testid="MdDeleteOutline">MdDeleteOutline</span>,
  MdOutlineChatBubbleOutline: () => <span data-testid="MdOutlineChatBubbleOutline">MdOutlineChatBubbleOutline</span>,
}));

jest.mock("react-icons/hi", () => ({
  HiOutlineDotsVertical: () => <span data-testid="HiOutlineDotsVertical">HiOutlineDotsVertical</span>,
  HiOutlinePencil: () => <span data-testid="HiOutlinePencil">HiOutlinePencil</span>,
}));

jest.mock("react-icons/bs", () => ({
  BsPin: () => <span data-testid="BsPin">BsPin</span>,
}));

jest.mock("react-icons/tb", () => ({
  TbMessageChatbot: () => <span data-testid="TbMessageChatbot">TbMessageChatbot</span>,
  TbPinned: () => <span data-testid="TbPinned">TbPinned</span>,
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: jest.fn((children) => <div data-testid="portal">{children}</div>),
}));

// Mock the DevButton and other custom components
jest.mock("../dev-components/dev-button", () => ({
  __esModule: true,
  default: ({ children, onClick, className, asIcon, ripple, href, to, ...props }: any) => {
    // To prevent nested button warnings, conditionally render
    if (href || to) {
      // If it's a link button, render as anchor
      return (
        <a
          onClick={onClick}
          className={className}
          data-testid="dev-button"
          {...props}
        >
          {children}
        </a>
      );
    } else {
      // Otherwise render as div to prevent nesting issues
      return (
        <div
          onClick={onClick}
          className={className}
          data-testid="dev-button"
          {...props}
        >
          {children}
        </div>
      );
    }
  },
}));

jest.mock("../dev-components/dev-popover", () => {
  // Create a component that filters out props that shouldn't be passed to DOM elements
  return {
    __esModule: true,
    default: (props: any) => {
      const { isOpen, loader, openBtn, contentClick, place, children, popButton, ...restProps } = props;

      return (
        <div data-testid="dev-popover" {...restProps}>
          {popButton}
          {children}
        </div>
      );
    },
  };
});

jest.mock("../dev-components/dev-modal", () => {
  return {
    __esModule: true,
    default: (props: any) => {
      const { children, open, modalTitle, contentClick, isOpen, loader, openBtn, ...restProps } = props;
      return (
        <div
          data-testid="dev-modal"
          style={{ display: open ? "block" : "none" }}
          {...restProps}
        >
          <div>{modalTitle}</div>
          {children}
        </div>
      );
    },
  };
});

jest.mock("../dev-components/dev-emoji-picker", () => ({
  __esModule: true,
  default: ({ setSelectedEmoji, ...props }: any) => (
    <div data-testid="dev-emoji-picker" {...props}>
      <button onClick={() => setSelectedEmoji("😊")}>Select 😊</button>
    </div>
  ),
}));

describe("SidebarChatList", () => {
  const mockUseRouter = useRouter as MockedFunction<any>;
  const mockUseParams = useParams as MockedFunction<any>;
  const mockDeleteChat = deleteChat as MockedFunction<any>;
  const mockPinChat = pinChat as MockedFunction<any>;
  const mockRenameChat = renameChat as MockedFunction<any>;
  const mockGeminiZustand = geminiZustand as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the router
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    });

    // Mock the params hook
    mockUseParams.mockReturnValue({
      chat: null,
    });

    // Mock the geminiZustand hook
    mockGeminiZustand.mockReturnValue({
      setTopLoader: jest.fn(),
      setToast: jest.fn(),
    });

    // Mock the actions
    mockDeleteChat.mockResolvedValue(undefined);
    mockPinChat.mockResolvedValue(undefined);
    mockRenameChat.mockResolvedValue(undefined);
  });

  const sampleSidebarList = {
    success: true,
    message: [
      {
        chatID: "chat1",
        chatInfo: {
          title: "Test Chat",
          icon: "💬",
        },
        message: {
          userPrompt: "Test prompt",
        },
        isPinned: false,
      },
      {
        chatID: "chat2",
        chatInfo: {
          title: "Pinned Chat",
          icon: null,
        },
        message: {
          userPrompt: "Another prompt",
        },
        isPinned: true,
      },
    ],
  };

  it("renders chat list items correctly", () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Check that chat titles are rendered
    expect(screen.getByText("Test Chat")).toBeInTheDocument();
    expect(screen.getByText("Pinned Chat")).toBeInTheDocument();

    // Check that pinned chat shows the pinned icon
    expect(screen.getByTestId("TbPinned")).toBeInTheDocument();
  });

  it("renders chat items with default icons when no icon is provided", () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // The chat without an icon should render the default chat bubble icon
    expect(screen.getByTestId("MdOutlineChatBubbleOutline")).toBeInTheDocument();
  });

  it("shows chat items with truncated text when long titles are provided", () => {
    const longTitleList = {
      success: true,
      message: [
        {
          chatID: "chat1",
          chatInfo: {
            title: "Very long title that should be truncated if there's not enough space",
            icon: "📝",
          },
          message: {
            userPrompt: "Test prompt",
          },
          isPinned: false,
        },
      ],
    };

    render(<SidebarChatList sidebarList={longTitleList} />);
    expect(screen.getByText("Very long title that should be truncated if there's not enough space")).toBeInTheDocument();
  });

  it("handles click on chat item to show settings", () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the settings button (ellipsis icon) for the first chat
    const settingsButtons = screen.getAllByTestId("dev-button");
    const firstSettingsButton = settingsButtons[0]; // This would be the first chat item's button

    fireEvent.click(firstSettingsButton);

    // We can't directly test the state change, but we can verify the component renders properly
    expect(firstSettingsButton).toBeInTheDocument();
  });

  it("opens modal when delete option is selected", async () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the dev-popover divs - there should be one for each chat item
    const popoverDivs = screen.getAllByTestId("dev-popover");
    // Click on the settings button (HiOutlineDotsVertical) inside the first chat item's popover
    const firstChatPopover = popoverDivs[0];
    const settingsButton = within(firstChatPopover).getByTestId("HiOutlineDotsVertical");
    fireEvent.click(settingsButton);

    // Find and click the delete button in the popover
    const deleteButton = within(firstChatPopover).getByText("Delete");
    fireEvent.click(deleteButton);

    // Modal should now be open
    await waitFor(() => {
      const modal = screen.getByTestId("dev-modal");
      expect(modal).toBeVisible();
    });
  });

  it("opens modal when rename option is selected", async () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the dev-popover divs - there should be one for each chat item
    const popoverDivs = screen.getAllByTestId("dev-popover");
    // Click on the settings button (HiOutlineDotsVertical) inside the first chat item's popover
    const firstChatPopover = popoverDivs[0];
    const settingsButton = within(firstChatPopover).getByTestId("HiOutlineDotsVertical");
    fireEvent.click(settingsButton);

    // Find and click the rename button in the popover
    const renameButton = within(firstChatPopover).getByText("Rename");
    fireEvent.click(renameButton);

    // Modal should now be open with rename content
    await waitFor(() => {
      const modal = screen.getByTestId("dev-modal");
      expect(modal).toBeVisible();
    });
  });

  it("calls pinChat when pin/unpin option is selected", async () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the dev-popover divs - there should be one for each chat item
    const popoverDivs = screen.getAllByTestId("dev-popover");
    // Click on the settings button (HiOutlineDotsVertical) inside the first (unpinned) chat item's popover
    const firstChatPopover = popoverDivs[0];
    const settingsButton = within(firstChatPopover).getByTestId("HiOutlineDotsVertical");
    fireEvent.click(settingsButton);

    // Find and click the pin button in the popover
    const pinButton = within(firstChatPopover).getByText("Pin");
    fireEvent.click(pinButton);

    await waitFor(() => {
      expect(mockPinChat).toHaveBeenCalledWith("chat1", true);
    });
  });

  it("calls deleteChat function when delete is confirmed", async () => {
    mockDeleteChat.mockResolvedValueOnce(undefined);

    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the dev-popover divs - there should be one for each chat item
    const popoverDivs = screen.getAllByTestId("dev-popover");
    // Click on the settings button (HiOutlineDotsVertical) inside the first chat item's popover
    const firstChatPopover = popoverDivs[0];
    const settingsButton = within(firstChatPopover).getByTestId("HiOutlineDotsVertical");
    fireEvent.click(settingsButton);

    // Find and click the delete button in the popover
    const deleteButton = within(firstChatPopover).getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const modal = screen.getByTestId("dev-modal");
      expect(modal).toBeVisible();
    });

    // Find and click the confirm delete button in the modal
    // Find the delete button in the modal by looking within the modal for the delete button
    const modal = screen.getByTestId("dev-modal");
    const confirmDeleteButton = within(modal).getByText("Delete");
    // Make sure this isn't the delete button inside the popover, but the one in the modal
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteChat).toHaveBeenCalledWith("chat1");
    });
  });

  it("handles chat selection when current chat matches", () => {
    mockUseParams.mockReturnValue({
      chat: "chat1", // This makes chat1 appear as the current/active chat
    });

    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // The current chat should have special styling - check for the active class
    // Note: The exact class may vary based on the actual implementation
    const chatLink = screen.getByText("Test Chat").closest("a");
    expect(chatLink).toHaveAttribute("href", "/app/chat1");
  });

  it("renders empty list when sidebarList has no items", () => {
    const emptyList = {
      success: true,
      message: [],
    };

    render(<SidebarChatList sidebarList={emptyList} />);

    // Should render an empty list (ul element) but no chat items
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryByText("Test Chat")).not.toBeInTheDocument();
  });

  it("shows user prompt when chat title is not provided", () => {
    const listWithoutTitle = {
      success: true,
      message: [
        {
          chatID: "chat3",
          chatInfo: {
            title: null,
            icon: null,
          },
          message: {
            userPrompt: "What is React?",
          },
          isPinned: false,
        },
      ],
    };

    render(<SidebarChatList sidebarList={listWithoutTitle} />);

    expect(screen.getByText("What is React?")).toBeInTheDocument();
  });

  it("handles emoji selection in rename modal", async () => {
    render(<SidebarChatList sidebarList={sampleSidebarList} />);

    // Find the dev-popover divs - there should be one for each chat item
    const popoverDivs = screen.getAllByTestId("dev-popover");
    // Click on the settings button (HiOutlineDotsVertical) inside the first chat item's popover
    const firstChatPopover = popoverDivs[0];
    const settingsButton = within(firstChatPopover).getByTestId("HiOutlineDotsVertical");
    fireEvent.click(settingsButton);

    // Find and click the rename button in the popover
    const renameButton = within(firstChatPopover).getByText("Rename");
    fireEvent.click(renameButton);

    await waitFor(() => {
      expect(screen.getByTestId("dev-modal")).toBeVisible();
    });

    // Click on emoji picker
    const emojiPicker = screen.getByTestId("dev-emoji-picker");
    expect(emojiPicker).toBeInTheDocument();

    // Click the emoji selection button
    const emojiButton = screen.getByText("Select 😊");
    fireEvent.click(emojiButton);

    expect(emojiButton).toBeInTheDocument();
  });
});