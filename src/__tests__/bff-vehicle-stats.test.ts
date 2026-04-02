/**
 * Tests para BFF route: GET /api/vehicles/[alias]/stats
 * Verifica que el status code del backend se preserva en la respuesta BFF.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

interface MockRequest {
  headers?: Headers;
}

type TestRequest = Partial<MockRequest> & { headers?: Headers };

const mockBffFetch = vi.fn();
vi.mock("@/lib/backendFetch", () => ({
  bffFetch: mockBffFetch,
}));

// Import route after mocks are in place
let GET: (req: Request, ctx: { params: Promise<{ alias: string }> }) => Promise<Response>;

beforeAll(async () => {
  ({ GET } = await import("../app/api/vehicles/[alias]/stats/route.js"));
});

const makeParams = (alias: string) => ({
  params: Promise.resolve({ alias }),
});

describe("GET /api/vehicles/[alias]/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_BASE_URL = "http://backend-test";
  });

  it("returns 200 with stats data on success", async () => {
    const mockStats = {
      success: true,
      data: {
        vehicle: { alias: "MYCAR", marca: "Toyota", modelo: 2022 },
        statistics: { totalRoutes: 10, totalDistancia: 1500 },
      },
    };

    mockBffFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockStats,
    });

    const res = await GET({} as TestRequest, makeParams("MYCAR"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.vehicle.alias).toBe("MYCAR");
  });

  it("preserves 404 status when vehicle not found", async () => {
    mockBffFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Vehículo no encontrado" }),
    });

    const res = await GET({} as TestRequest, makeParams("NOTEXISTS"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Vehículo no encontrado");
  });

  it("preserves 403 status when access denied", async () => {
    mockBffFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "No autorizado" }),
    });

    const res = await GET({} as TestRequest, makeParams("OTHERCAR"));
    expect(res.status).toBe(403);
  });

  it("returns 500 when bffFetch throws", async () => {
    mockBffFetch.mockRejectedValueOnce(new Error("Network error"));

    const res = await GET({} as TestRequest, makeParams("MYCAR"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Error interno");
  });

  it("returns 401 when bffFetch returns 401 (no token)", async () => {
    mockBffFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "No autorizado" }),
    });

    const res = await GET({} as TestRequest, makeParams("MYCAR"));
    expect(res.status).toBe(401);
  });
});
