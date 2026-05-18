import { GET, POST } from './route';
import { handlers } from '@/auth';
import { NextRequest } from 'next/server';

// Mock global objects for Node.js environment
global.Request = jest.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || 'GET',
  headers: new Headers(init?.headers),
  json: async () => (init?.body ? JSON.parse(init.body as string) : {}),
  text: async () => init?.body as string ?? '',
  body: init?.body,
  ...init,
}));

global.Response = class MockResponse {
  public body: any;
  public status: number;
  public ok: boolean;
  public headers: Headers;
  public statusText: string;

  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.ok = (init?.status || 200) >= 200 && (init?.status || 200) < 300;
    this.headers = typeof init?.headers === 'object' && init.headers !== null ? new Headers(init.headers) : new Headers();
    this.statusText = init?.statusText || 'OK';
  }

  async json() {
    return JSON.parse(this.body as string);
  }

  async text() {
    return this.body as string;
  }

  static error() {
    return new MockResponse(null, { status: 500 });
  }

  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), init);
  }

  static redirect(url: string | URL, status?: number) {
    return new MockResponse(null, { status: status || 302 });
  }

  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      headers: this.headers,
      statusText: this.statusText,
    });
  }
} as any;

// Create a mock NextRequest
const createMockNextRequest = (url: string, options?: RequestInit): NextRequest => {
  const request = new Request(url, options) as NextRequest;
  // Extend with NextRequest specific properties if needed
  return request;
};

// Mock the auth module to control its behavior during testing
jest.mock('@/auth', () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

const mockedHandlers = require('@/auth').handlers as jest.Mocked<typeof handlers>;

describe('NextAuth Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should export GET handler from auth handlers', () => {
      expect(GET).toBeDefined();
      expect(typeof GET).toBe('function');
    });

    it('should call the underlying GET handler from auth module', async () => {
      const mockRequest = createMockNextRequest('http://localhost/api/auth/signin', {
        method: 'GET',
      });

      await GET(mockRequest);

      expect(mockedHandlers.GET).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle GET requests for different auth routes', async () => {
      const routes = ['signin', 'callback', 'verify-request', 'error'];

      for (const route of routes) {
        const mockRequest = createMockNextRequest(`http://localhost/api/auth/${route}`, {
          method: 'GET',
        });

        await GET(mockRequest);

        expect(mockedHandlers.GET).toHaveBeenCalledWith(mockRequest);
        mockedHandlers.GET.mockClear(); // Clear the mock for the next iteration
      }
    });
  });

  describe('POST handler', () => {
    it('should export POST handler from auth handlers', () => {
      expect(POST).toBeDefined();
      expect(typeof POST).toBe('function');
    });

    it('should call the underlying POST handler from auth module', async () => {
      const mockRequest = createMockNextRequest('http://localhost/api/auth/callback', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await POST(mockRequest);

      expect(mockedHandlers.POST).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle POST requests for different auth routes', async () => {
      const routes = ['signin', 'signout', 'callback'];

      for (const route of routes) {
        const mockRequest = createMockNextRequest(`http://localhost/api/auth/${route}`, {
          method: 'POST',
          body: JSON.stringify({}),
        });

        await POST(mockRequest);

        expect(mockedHandlers.POST).toHaveBeenCalledWith(mockRequest);
        mockedHandlers.POST.mockClear(); // Clear the mock for the next iteration
      }
    });
  });

  describe('Handler consistency', () => {
    it('should export the same handlers that are defined in the auth module', () => {
      expect(GET).toBe(mockedHandlers.GET);
      expect(POST).toBe(mockedHandlers.POST);
    });
  });

  describe('Request handling', () => {
    it('should preserve request properties when passing to handlers', async () => {
      const mockRequest = createMockNextRequest('http://localhost/api/auth/signin', {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value',
        }),
      });

      await GET(mockRequest);

      const calledWithRequest = mockedHandlers.GET.mock.calls[0][0];
      expect(calledWithRequest.url).toBe(mockRequest.url);
      expect(calledWithRequest.method).toBe(mockRequest.method);
      expect(calledWithRequest.headers.get('Content-Type')).toBe('application/json');
      expect(calledWithRequest.headers.get('X-Custom-Header')).toBe('test-value');
    });

    it('should handle request properly without context', async () => {
      const mockRequest = createMockNextRequest('http://localhost/api/auth/session', {
        method: 'GET',
      });

      await GET(mockRequest);

      expect(mockedHandlers.GET).toHaveBeenCalledWith(mockRequest);
    });
  });
});