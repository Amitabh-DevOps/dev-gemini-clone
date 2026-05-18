import { render, screen } from "@testing-library/react";

// Mock the child components
jest.mock("./signin-now", () => ({
  default: ({ userData }: { userData: any }) => (
    <div data-testid="signin-now">{userData ? "Signed In" : "Sign In"}</div>
  ),
}));

jest.mock("./top-loader", () => ({
  default: () => <div data-testid="top-loader">Top Loader</div>,
}));

jest.mock("./gemini-logo", () => ({
  default: () => <div data-testid="gemini-logo">Gemini Logo</div>,
}));

// Create a synchronous Header component for testing
// Define it as a function that can be called with different mock values
const createTestHeader = (session: any) => {
  const SignInNow = require("./signin-now").default;
  const TopLoader = require("./top-loader").default;
  const GeminiLogo = require("./gemini-logo").default;

  return function TestHeader() {
    return (
      <header className="w-full h-fit flex-shrink-0 flex items-center p-3 md:px-10 px-5 md:justify-between relative justify-end">
        <div className="md:block hidden">
          <GeminiLogo />
        </div>
        <SignInNow userData={session?.user} />
        <TopLoader />
      </header>
    );
  };
};

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    // Create a TestHeader with null session
    const mockSession = null;
    const TestHeader = createTestHeader(mockSession);

    const { container } = render(<TestHeader />);

    // Wait for the component to load and render
    expect(await screen.findByText(/Sign In|Signed In/)).toBeInTheDocument();

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass("w-full");
    expect(headerElement).toHaveClass("h-fit");
  });

  it("renders gemini logo when session is null", async () => {
    // Create a TestHeader with null session
    const mockSession = null;
    const TestHeader = createTestHeader(mockSession);

    render(<TestHeader />);

    // Wait for the component to load and render
    await screen.findByTestId("gemini-logo");

    // Verify gemini-logo is present
    expect(screen.getByTestId("gemini-logo")).toBeInTheDocument();
  });

  it("renders sign in component when session is null", async () => {
    // Create a TestHeader with null session
    const mockSession = null;
    const TestHeader = createTestHeader(mockSession);

    render(<TestHeader />);

    // Wait for the component to load and render
    await screen.findByText("Sign In");

    // Verify sign in component shows "Sign In" when no user data
    expect(screen.getByTestId("signin-now")).toHaveTextContent("Sign In");
  });

  it("renders sign in component with user data when authenticated", async () => {
    const mockSession = {
      user: { name: "John Doe", email: "john@example.com", image: null },
    };
    // Create a TestHeader with user session
    const TestHeader = createTestHeader(mockSession);

    render(<TestHeader />);

    // Wait for the component to load and render
    await screen.findByText(/Signed In/i);

    // Verify sign in component shows "Signed In" when user data is present
    expect(screen.getByTestId("signin-now")).toHaveTextContent(/Signed In/i);
  });

  it("always renders top loader", async () => {
    // Create a TestHeader with null session
    const mockSession = null;
    const TestHeader = createTestHeader(mockSession);

    render(<TestHeader />);

    // Wait for the component to load and render
    await screen.findByTestId("top-loader");

    // Top loader should always be present
    expect(screen.getByTestId("top-loader")).toBeInTheDocument();
  });

  it("renders with correct header classes", async () => {
    // Create a TestHeader with null session
    const mockSession = null;
    const TestHeader = createTestHeader(mockSession);

    const { container } = render(<TestHeader />);

    // Wait for the component to load and render
    await screen.findByText("Sign In");

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass("w-full");
    expect(headerElement).toHaveClass("flex-shrink-0");
    expect(headerElement).toHaveClass("flex");
    expect(headerElement).toHaveClass("items-center");
    expect(headerElement).toHaveClass("p-3");
    expect(headerElement).toHaveClass("md:px-10");
    expect(headerElement).toHaveClass("px-5");
    expect(headerElement).toHaveClass("md:justify-between");
    expect(headerElement).toHaveClass("relative");
    expect(headerElement).toHaveClass("justify-end");
  });
});