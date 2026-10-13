import { del, get, post, put } from "../src";
import { subscribeTimestampOffset } from "../src";
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
  const LISTENERS_KEY = "__ORDERLY_timestamp_offset_listeners";

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

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(500_000);
    jest.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)[OFFSET_KEY];
    delete (globalThis as unknown as Record<string, unknown>)[LISTENERS_KEY];
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

  it("notifies first calibration and actual changes without broadcasting latency jitter", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const unsubscribeFirst = subscribeTimestampOffset(first);
    const unsubscribeSecond = subscribeTimestampOffset(second);
    mockEnvelope(500_000);
    await get(url);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    mockTimedEnvelope({
      timestamp: 500_100,
      receivedAt: 504_000,
      transitMs: 4_000,
    });
    await get(url);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribeFirst();
    mockEnvelope(800_000);
    await get(url);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    unsubscribeSecond();
    mockEnvelope(1_000_000);
    await get(url);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it("isolates failed subscribers and shares listeners across module instances", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    subscribeTimestampOffset(() => {
      throw new Error("consumer failure");
    });
    const listener = jest.fn();
    subscribeTimestampOffset(listener);
    jest.isolateModules(() => {
      const other =
        require("../src/fetch/timestampOffset") as typeof import("../src/fetch/timestampOffset");
      other.calibrateTimestampOffset({ success: true, timestamp: 500_000 }, 0);
    });
    expect(offset()).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
    mockEnvelope(800_000);
    await expect(get(url)).resolves.toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("does not notify subscribers for rejected calibration samples", async () => {
    const listener = jest.fn();
    subscribeTimestampOffset(listener);
    mockEnvelope(NaN);
    await get(url);
    mockTimedEnvelope({
      timestamp: 500_100,
      receivedAt: 530_000,
      transitMs: 30_000,
    });
    await get(url);
    expect(listener).not.toHaveBeenCalled();
    expect(offset()).toBeUndefined();
  });
});
