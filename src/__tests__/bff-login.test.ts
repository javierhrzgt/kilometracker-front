/**
 * Tests para BFF route: POST /api/auth/login
 * Verifica que el error del backend se propaga correctamente al cliente.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

interface MockRequest {
  json: () => Promise<{ email?: string; password?: string }>;
}

type TestRequest = Partial<MockRequest> & { json: () => Promise<{ email?: string; password?: string }> };

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock next/server cookies (not used in login, but imported via next)
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => null }),
}));

// Import after mocks are set up
const { POST } = await import("../app/api/auth/login/route.js");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://backend-test";
  });

  it("returns 400 when email or password is missing", async () => {
    const request: TestRequest = {
      json: async () => ({ email: "", password: "" }),
    };

    const res = await POST(request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("requeridos");
  });

  it("propagates backend error message to client", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "Credenciales inválidas" }),
    });

    const request: TestRequest = {
      json: async () => ({ email: "a@b.com", password: "wrong" }),
    };

    const res = await POST(request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Credenciales inválidas");
  });

  it("returns 502 when backend responds with non-JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 200,
      headers: { get: () => "text/html" },
      text: async () => "<html>Service Unavailable</html>",
    });

    const request: TestRequest = {
      json: async () => ({ email: "a@b.com", password: "test-only-not-a-secret" }),
    };

    const res = await POST(request);
    expect(res.status).toBe(502);
  });

  it("returns 502 when backend response has no token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, data: { user: { email: "a@b.com" } } }),
    });

    const request: TestRequest = {
      json: async () => ({ email: "a@b.com", password: "test-only-not-a-secret" }),
    };

    const res = await POST(request);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("token");
  });

  it("sets HttpOnly cookie on successful login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({
        success: true,
        data: {
          token: "jwt.token.here",
          user: { email: "a@b.com", username: "tester" },
        },
      }),
    });

    const request: TestRequest = {
      json: async () => ({ email: "a@b.com", password: "test-only-not-a-secret" }),
    };

    const res = await POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("token=");
    expect(setCookie).toContain("HttpOnly");
  });
});
