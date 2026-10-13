import { del, get, post, put } from "../src";
import { request } from "../src/fetch";

const url = "https://api.example.com/v1/test";
const originalFetch = globalThis.fetch;

const getRequestHeaders = (fetchMock: jest.Mock) => {
  const init = fetchMock.mock.calls.at(-1)?.[1] as RequestInit;
  return new Headers(init.headers);
};

describe("fetch request headers", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { rows: [] } }),
    });
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("does not add Content-Type to GET requests", async () => {
    await get(url);

    expect(getRequestHeaders(fetchMock).has("Content-Type")).toBe(false);
  });

  it.each([undefined, "get", "HEAD", "head"])(
    "does not add Content-Type when method is %s",
    async (method) => {
      await request(url, method ? { method } : {});

      expect(getRequestHeaders(fetchMock).has("Content-Type")).toBe(false);
    },
  );

  it("preserves an explicit GET Content-Type", async () => {
    await get(url, { headers: { "Content-Type": "application/custom" } });

    expect(getRequestHeaders(fetchMock).get("Content-Type")).toBe(
      "application/custom",
    );
  });

  it.each([
    ["POST", () => post(url, { value: 1 }), "application/json;charset=utf-8"],
    ["PUT", () => put(url, { value: 1 }), "application/json;charset=utf-8"],
    ["DELETE", () => del(url), "application/x-www-form-urlencoded"],
    [
      "lowercase DELETE",
      () => request(url, { method: "delete" }),
      "application/x-www-form-urlencoded",
    ],
  ])("keeps the existing %s Content-Type default", async (_name, run, type) => {
    await run();

    expect(getRequestHeaders(fetchMock).get("Content-Type")).toBe(type);
  });
});

describe("timestamp offset calibration", () => {
  const OFFSET_KEY = "__ORDERLY_timestamp_offset";

  const offset = () =>
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY];

  const mockEnvelope = (timestamp?: unknown) => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { rows: [] }, timestamp }),
    }) as typeof fetch;
  };

  const mockTimedEnvelope = ({
    timestamp,
    receivedAt,
    transitMs,
  }: {
    timestamp: number;
    receivedAt: number;
    transitMs: number;
  }) => {
    let now = 500_000;
    let elapsed = 0;
    jest.spyOn(Date, "now").mockImplementation(() => now);
    jest.spyOn(performance, "now").mockImplementation(() => elapsed);
    globalThis.fetch = jest.fn().mockImplementation(async () => {
      now = receivedAt;
      elapsed = transitMs;
      return {
        ok: true,
        json: async () => ({ success: true, data: { rows: [] }, timestamp }),
      };
    }) as typeof fetch;
  };

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY];
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("sets the global offset from the first timestamped response", async () => {
    jest.spyOn(Date, "now").mockReturnValue(500_000);
    mockEnvelope(1_000_000);

    await get(url);

    expect(offset()).toBe(500_000);
  });

  it("re-calibrates when the offset drifts beyond the threshold", async () => {
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 0;
    // Device clock moved 5 minutes: same wall reading now implies a +5min offset.
    jest.spyOn(Date, "now").mockReturnValue(500_000);
    mockEnvelope(800_000);

    await get(url);

    expect(offset()).toBe(300_000);
  });

  it.each([NaN, Infinity])(
    "replaces an invalid existing offset %s",
    async (value) => {
      (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = value;
      jest.spyOn(Date, "now").mockReturnValue(500_000);
      mockEnvelope(500_100);

      await get(url);

      expect(offset()).toBe(100);
    },
  );

  it("ignores sub-threshold jitter to keep the offset stable", async () => {
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 0;
    jest.spyOn(Date, "now").mockReturnValue(500_000);
    mockEnvelope(500_300);

    await get(url);

    expect(offset()).toBe(0);
  });

  it("preserves a correct offset when a response arrives within the transit bound", async () => {
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 0;
    mockTimedEnvelope({
      timestamp: 500_100,
      receivedAt: 504_000,
      transitMs: 4_000,
    });

    await get(url);

    expect(offset()).toBe(0);
  });

  it.each([-300_000, 300_000])(
    "corrects a %sms device-clock jump during an in-flight request",
    async (clockJump) => {
      (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 0;
      mockTimedEnvelope({
        timestamp: 500_100,
        receivedAt: 500_200 + clockJump,
        transitMs: 200,
      });

      await get(url);

      expect(offset()).toBe(-clockJump - 100);
    },
  );

  it("does not touch the offset when the envelope has no usable timestamp", async () => {
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 42;
    mockEnvelope(undefined);

    await get(url);

    expect(offset()).toBe(42);

    mockEnvelope("not-a-number");

    await get(url);

    expect(offset()).toBe(42);
  });

  it("ignores bodies that are not Orderly success envelopes", async () => {
    // A third-party full URL could return e.g. a seconds-epoch timestamp;
    // without the success guard it would poison the shared clock.
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ timestamp: 999_999_999 }),
    }) as typeof fetch;

    await get(url).catch(() => undefined);

    expect(offset()).toBeUndefined();
  });

  it("ignores slow responses whose transit bends the measurement", async () => {
    (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY] = 0;
    // Sent at 500_000, generated at 500_100, but delivered 30s late: a naive
    // calibration would drag the offset by ~30s.
    mockTimedEnvelope({
      timestamp: 500_100,
      receivedAt: 530_000,
      transitMs: 30_000,
    });

    await get(url);

    expect(offset()).toBe(0);
  });
});
