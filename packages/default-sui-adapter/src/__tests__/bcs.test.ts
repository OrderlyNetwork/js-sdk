import { describe, expect, it } from "vitest";
import { createBcsReader, extractNativeFeeFromDevInspect } from "../bcs";

const u64LE = (value: bigint) => {
  const bytes: number[] = [];
  let rest = value;
  for (let i = 0; i < 8; i += 1) {
    bytes.push(Number(rest & BigInt(0xff)));
    rest >>= BigInt(8);
  }
  return bytes;
};

describe("SUI devInspect fee parsing", () => {
  it("extracts native fee from messaging fee return values", () => {
    expect(
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [
              "malformed",
              [u64LE(BigInt(123456789)), "0x2::messaging_fee::MessagingFee"],
            ],
          },
        ],
      }),
    ).toBe(BigInt(123456789));
  });

  it("skips short messaging fee values", () => {
    expect(() =>
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [[[1, 2, 3], "0x2::messaging_fee::MessagingFee"]],
          },
        ],
      }),
    ).toThrow("Failed to quote Sui LayerZero fee");
  });

  it("throws when no known fee return value exists", () => {
    expect(() =>
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [[[1, 2, 3, 4, 5, 6, 7, 8], "0x2::other::Type"]],
          },
        ],
      }),
    ).toThrow("Failed to quote Sui LayerZero fee");
  });
});

describe("SUI BCS ULEB128 vector length parsing", () => {
  it("reads valid u32 values at and above 2^28", () => {
    expect(
      createBcsReader(
        Uint8Array.from([0x80, 0x80, 0x80, 0x80, 0x01]),
      ).readUleb(),
    ).toBe(2 ** 28);
    expect(
      createBcsReader(
        Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0x07]),
      ).readUleb(),
    ).toBe(2 ** 31 - 1);
    expect(
      createBcsReader(
        Uint8Array.from([0xff, 0xff, 0xff, 0xff, 0x0f]),
      ).readUleb(),
    ).toBe(0xffffffff);
  });

  it("rejects values outside the u32 vector length range", () => {
    expect(() =>
      createBcsReader(
        Uint8Array.from([0x80, 0x80, 0x80, 0x80, 0x10]),
      ).readUleb(),
    ).toThrow("Invalid SUI BCS vector length");
    expect(() =>
      createBcsReader(
        Uint8Array.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x00]),
      ).readUleb(),
    ).toThrow("Invalid SUI BCS vector length");
  });
});
