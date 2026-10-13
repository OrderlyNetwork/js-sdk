// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { BaseSigner } from "@orderly.network/core/src/signer";
import { getTimestamp } from "@orderly.network/core/src/utils";
import { calibrateTimestampOffset } from "@orderly.network/net/src/fetch/timestampOffset";
import { getTimestamp as getSharedTimestamp } from "@orderly.network/utils";

vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  ...(await import("@orderly.network/utils/src/window")),
}));

const globalObj = globalThis as unknown as Record<string, unknown>;
const T0 = 1_800_000_000_000;
let wallTime: number;

beforeEach(() => {
  globalObj.__ORDERLY_timestamp_offset = 0;
  wallTime = T0;
  vi.spyOn(Date, "now").mockImplementation(() => wallTime);
});
afterEach(() => {
  delete globalObj.__ORDERLY_timestamp_offset;
  vi.restoreAllMocks();
});

it.each([-300_000, 300_000])(
  "restores browser signing after offset correction for a %sms device jump",
  async (jump) => {
    wallTime += jump;
    expect(getTimestamp()).toBe(T0 + jump);
    expect(getSharedTimestamp()).toBe(T0 + jump);
    calibrateTimestampOffset({ success: true, timestamp: T0 }, 0);
    expect(getTimestamp()).toBe(T0);
    expect(getSharedTimestamp()).toBe(T0);
    const sign = vi.fn(
      async (_message: Uint8Array) => new Uint8Array([1, 2, 3]),
    );
    const keyStore = {
      getOrderlyKey: () => ({ sign, getPublicKey: async () => "public-key" }),
    };
    const signer = new BaseSigner(keyStore as any);
    const signed = await signer.sign({
      url: "https://api.orderly.org/v1/order",
      method: "POST",
    });
    expect(signed["orderly-timestamp"]).toBe(String(T0));
    expect(Buffer.from(sign.mock.calls[0][0]).toString()).toContain(String(T0));
  },
);
