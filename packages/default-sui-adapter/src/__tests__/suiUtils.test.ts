import { describe, expect, it } from "vitest";
import {
  bytesFromHex,
  compareBigintDesc,
  hex64,
  normalizeBytes32Hex,
  readSuiBalance,
} from "../suiUtils";

describe("SUI utilities", () => {
  it("normalizes bytes32 values with or without 0x prefix", () => {
    expect(normalizeBytes32Hex("A".repeat(64))).toBe(`0x${"a".repeat(64)}`);
    expect(normalizeBytes32Hex(`0x${"B".repeat(64)}`)).toBe(
      `0x${"b".repeat(64)}`,
    );
  });

  it("rejects invalid bytes32 and hex values", () => {
    expect(() => normalizeBytes32Hex("abc")).toThrow(
      "Invalid SUI bytes32 value",
    );
    expect(() => bytesFromHex("abc")).toThrow("Invalid hex string");
    expect(() => bytesFromHex("zz")).toThrow("Invalid hex string");
  });

  it("pads hex strings to 32 bytes", () => {
    expect(hex64("0xabc")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000abc",
    );
  });

  it("sorts bigint values without numeric precision loss", () => {
    const values = [
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(2),
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(100),
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(3),
    ];

    expect(values.sort(compareBigintDesc)).toEqual([
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(100),
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(3),
      BigInt(Number.MAX_SAFE_INTEGER) + BigInt(2),
    ]);
  });

  it("reads wrapped total balance before partial balances", () => {
    expect(
      readSuiBalance({
        balance: {
          balance: "13440001",
          coinType:
            "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC",
          coinBalance: "13440000",
          addressBalance: "1",
        },
      }),
    ).toBe(13440001n);
  });
});
