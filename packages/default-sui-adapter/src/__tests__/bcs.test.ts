import { describe, expect, it } from "vitest";
import {
  createBcsReader,
  extractNativeFeeFromDevInspect,
  readEndpointSendCallReceiptNativeFee,
  readMessagingFeeNativeFee,
} from "../bcs";

const u64LE = (value: bigint) => {
  const bytes: number[] = [];
  let rest = value;
  for (let i = 0; i < 8; i += 1) {
    bytes.push(Number(rest & BigInt(0xff)));
    rest >>= BigInt(8);
  }
  return bytes;
};

const u16LE = (value: number) => [value & 0xff, (value >> 8) & 0xff];

const emptyVector = () => [0];

const bytes32 = () => [32, ...new Array(32).fill(0)];

const coin = (value = BigInt(0)) => [
  ...new Array(32).fill(0), // UID id
  ...u64LE(value), // balance value
];

const callWithU64Result = (param: number[], value: bigint) => [
  ...new Array(32 * 3).fill(0), // call id, caller, callee
  0, // one_way
  ...param,
  0, // mutable_param
  1, // result option contains one u64
  ...u64LE(value),
];

const executorFeeParam = () => [
  ...new Array(32).fill(0), // sender
  0,
  0,
  0,
  0, // dst_eid
  ...u64LE(BigInt(0)), // call_data_size
  ...emptyVector(), // options
  ...new Array(32).fill(0), // price_feed
  ...u16LE(0), // default_multiplier_bps
  ...u64LE(BigInt(0)), // lz_receive_base_gas
  ...u64LE(BigInt(0)), // lz_compose_base_gas
  ...new Array(16).fill(0), // floor_margin_usd
  ...new Array(16).fill(0), // native_cap
  ...u16LE(0), // multiplier_bps
];

const dvnFeeParam = () => [
  ...new Array(32).fill(0), // sender
  0,
  0,
  0,
  0, // dst_eid
  ...u64LE(BigInt(0)), // confirmations
  ...emptyVector(), // options
  ...u64LE(BigInt(0)), // quorum
  ...new Array(32).fill(0), // price_feed
  ...u16LE(0), // default_multiplier_bps
  ...new Array(32).fill(0), // gas u256
  ...u16LE(0), // multiplier_bps
  ...new Array(16).fill(0), // floor_margin_usd
];

const messageLibSendEmptyResult = () => [
  ...new Array(32 * 3).fill(0), // call id, caller, callee
  0, // one_way
  ...u64LE(BigInt(0)), // nonce
  0,
  0,
  0,
  0, // src_eid
  ...new Array(32).fill(0), // sender
  0,
  0,
  0,
  0, // dst_eid
  0, // receiver
  0, // guid
  0, // message
  0, // options
  0, // pay_in_zro
  0, // mutable_param
  0, // empty result option
];

const endpointSendParam = () => [
  0,
  0,
  0,
  0, // dst_eid
  ...bytes32(), // receiver
  ...emptyVector(), // message
  ...emptyVector(), // options
  ...coin(BigInt(1000)), // native_token
  0, // zro_token none
  0, // refund_address none
];

const messagingReceipt = (nativeFee: bigint) => [
  ...bytes32(), // guid
  ...u64LE(BigInt(1)), // nonce
  ...u64LE(nativeFee), // messaging_fee.native_fee
  ...u64LE(BigInt(0)), // messaging_fee.zro_fee
];

const endpointSendCallWithReceipt = (nativeFee: bigint) => [
  ...new Array(32 * 3).fill(0), // call id, caller, callee
  0, // one_way
  ...endpointSendParam(),
  0, // mutable_param
  1, // result option contains one MessagingReceipt
  ...messagingReceipt(nativeFee),
];

describe("SUI devInspect fee parsing", () => {
  it("extracts native fee from LayerZero fee paid events", () => {
    expect(
      extractNativeFeeFromDevInspect({
        events: [
          {
            type: "0x1::send_uln::ExecutorFeePaidEvent",
            parsedJson: {
              fee: {
                fee: "299608687",
              },
            },
          },
          {
            type: "0x1::send_uln::DVNFeePaidEvent",
            parsedJson: {
              fees: [
                {
                  fee: "10729549",
                },
              ],
            },
          },
        ],
      }),
    ).toBe(BigInt(310338236));
  });

  it("prefers endpoint messaging receipt native fee over worker fee events", () => {
    expect(
      extractNativeFeeFromDevInspect({
        events: [
          {
            type: "0x1::send_uln::ExecutorFeePaidEvent",
            parsedJson: {
              fee: {
                fee: "100",
              },
            },
          },
          {
            type: "0x1::send_uln::DVNFeePaidEvent",
            parsedJson: {
              fees: [
                {
                  fee: "20",
                },
              ],
            },
          },
        ],
        results: [
          {
            returnValues: [
              [
                endpointSendCallWithReceipt(BigInt(125)),
                "0x1::call::Call<0x1::endpoint_send::SendParam, 0x1::messaging_receipt::MessagingReceipt>",
              ],
            ],
          },
        ],
      }),
    ).toBe(BigInt(125));
  });

  it("extracts native fee from messaging fee return values", () => {
    expect(
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [
              "malformed",
              [
                [...u64LE(BigInt(123456789)), ...u64LE(BigInt(987))],
                "0x2::messaging_fee::MessagingFee",
              ],
            ],
          },
        ],
      }),
    ).toBe(BigInt(123456789));
  });

  it("rejects short messaging fee values", () => {
    expect(() =>
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [[[1, 2, 3], "0x2::messaging_fee::MessagingFee"]],
          },
        ],
      }),
    ).toThrow("Invalid SUI MessagingFee return value");
  });

  it("sums LayerZero fee lib u64 return values when send result is empty", () => {
    expect(
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [
              [
                messageLibSendEmptyResult(),
                "0x1::call::Call<0x1::message_lib_send::SendParam, 0x1::message_lib_send::SendResult>",
              ],
              [
                callWithU64Result(executorFeeParam(), BigInt(123)),
                "0x1::call::Call<0x1::executor_feelib_get_fee::FeelibGetFeeParam, u64>",
              ],
              [
                callWithU64Result(dvnFeeParam(), BigInt(456)),
                "0x1::call::Call<0x1::dvn_feelib_get_fee::FeelibGetFeeParam, u64>",
              ],
            ],
          },
        ],
      }),
    ).toBe(BigInt(579));
  });

  it("continues to fee lib u64 values when send call parsing fails", () => {
    expect(
      extractNativeFeeFromDevInspect({
        results: [
          {
            returnValues: [
              [
                [1, 2, 3],
                "0x1::call::Call<0x1::message_lib_send::SendParam, 0x1::message_lib_send::SendResult>",
              ],
              [
                callWithU64Result(executorFeeParam(), BigInt(321)),
                "0x1::call::Call<0x1::executor_feelib_get_fee::FeelibGetFeeParam, u64>",
              ],
            ],
          },
        ],
      }),
    ).toBe(BigInt(321));
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

describe("SUI MessagingReceipt BCS parsing", () => {
  it("reads native fee from endpoint send call receipt", () => {
    expect(
      readEndpointSendCallReceiptNativeFee(
        Uint8Array.from(endpointSendCallWithReceipt(BigInt(789))),
      ),
    ).toBe(BigInt(789));
  });
});

describe("SUI MessagingFee BCS parsing", () => {
  it("reads native fee as the first u64 field", () => {
    expect(
      readMessagingFeeNativeFee(
        Uint8Array.from([...u64LE(BigInt(123)), ...u64LE(BigInt(456))]),
      ),
    ).toBe(BigInt(123));
  });

  it("rejects values without native and zro fee fields", () => {
    expect(() =>
      readMessagingFeeNativeFee(Uint8Array.from(u64LE(BigInt(123)))),
    ).toThrow("Invalid SUI MessagingFee return value");
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
