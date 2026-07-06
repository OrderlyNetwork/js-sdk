import { fromBase64 } from "@mysten/sui/utils";
import { readU64LE } from "./suiUtils";

const MAX_U32 = 0xffffffff;
const MAX_U32_ULEB128_BYTES = 5;

export const createBcsReader = (bytes: Uint8Array) => {
  let offset = 0;

  const ensure = (length: number) => {
    if (offset + length > bytes.length) {
      throw new Error("Invalid SUI BCS return value");
    }
  };

  const readU8 = () => {
    ensure(1);
    const value = bytes[offset];
    offset += 1;
    return value;
  };

  const readU32 = () => {
    ensure(4);
    const value =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24);
    offset += 4;
    return value >>> 0;
  };

  const readU64 = () => {
    ensure(8);
    const value = readU64LE(bytes, offset);
    offset += 8;
    return value;
  };

  const readUleb = () => {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;

    while (bytesRead < MAX_U32_ULEB128_BYTES) {
      const byte = readU8();
      bytesRead += 1;

      const chunk = byte & 0x7f;
      const nextValue = value + chunk * 2 ** shift;
      if (nextValue > MAX_U32) {
        throw new Error("Invalid SUI BCS vector length");
      }
      value = nextValue;

      if ((byte & 0x80) === 0) {
        return value;
      }

      shift += 7;
    }

    throw new Error("Invalid SUI BCS vector length");
  };

  const skip = (length: number) => {
    ensure(length);
    offset += length;
  };

  const skipVector = () => {
    const length = readUleb();
    skip(length);
  };

  return {
    readU8,
    readU32,
    readU64,
    readUleb,
    skip,
    skipAddress: () => skip(32),
    skipVector,
  };
};

export const toReturnBytes = (value: string | number[]) =>
  typeof value === "string" ? fromBase64(value) : Uint8Array.from(value);

export const readMessageLibSendCallNativeFee = (bytes: Uint8Array) => {
  const reader = createBcsReader(bytes);

  // call::Call fields: id, caller, callee, one_way.
  reader.skipAddress();
  reader.skipAddress();
  reader.skipAddress();
  reader.readU8();

  // message_lib_send::SendParam { base: message_lib_quote::QuoteParam }.
  // QuoteParam.packet: outbound_packet::OutboundPacket.
  reader.readU64(); // nonce
  reader.readU32(); // src_eid
  reader.skipAddress(); // sender
  reader.readU32(); // dst_eid
  reader.skipVector(); // receiver Bytes32
  reader.skipVector(); // guid Bytes32
  reader.skipVector(); // message
  reader.skipVector(); // options
  reader.readU8(); // pay_in_zro

  reader.readU8(); // mutable_param

  // call.result is Move Option<T>, encoded as vector<T> with length 0 or 1.
  const resultLength = reader.readUleb();
  if (resultLength === 0) {
    return undefined;
  }
  if (resultLength !== 1) {
    throw new Error("Invalid SUI Call result option");
  }

  // message_lib_send::SendResult { encoded_packet, fee }.
  reader.skipVector();
  return reader.readU64();
};

export const extractNativeFeeFromDevInspect = (inspectResult: any) => {
  for (const result of inspectResult?.results ?? []) {
    for (const returnValue of result?.returnValues ?? []) {
      if (!Array.isArray(returnValue) || returnValue.length < 2) {
        continue;
      }

      const type = String(returnValue[1] ?? "");
      const bytes = toReturnBytes(returnValue[0]);
      if (type.includes("messaging_fee::MessagingFee")) {
        if (bytes.length < 8) {
          continue;
        }
        return readU64LE(bytes);
      }

      if (
        type.includes("message_lib_send::SendParam") &&
        type.includes("message_lib_send::SendResult")
      ) {
        const nativeFee = readMessageLibSendCallNativeFee(bytes);
        if (typeof nativeFee !== "undefined") {
          return nativeFee;
        }
      }
    }
  }

  throw new Error("Failed to quote Sui LayerZero fee");
};
