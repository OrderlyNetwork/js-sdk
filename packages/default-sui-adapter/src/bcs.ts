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

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const shouldLogReturnBytes = (type: string) => {
  const normalized = type.toLowerCase();
  return (
    normalized.includes("::message_lib_send::sendresult") ||
    normalized.includes("::executor_feelib_get_fee::feelibgetfeeparam") ||
    normalized.includes("::dvn_feelib_get_fee::feelibgetfeeparam")
  );
};

export const readMessagingFeeNativeFee = (bytes: Uint8Array) => {
  if (bytes.length < 16) {
    throw new Error("Invalid SUI MessagingFee return value");
  }
  return readU64LE(bytes, 0);
};

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

const skipBytes32 = (reader: ReturnType<typeof createBcsReader>) => {
  reader.skipVector();
};

const skipCoin = (reader: ReturnType<typeof createBcsReader>) => {
  reader.skipAddress(); // UID id
  reader.readU64(); // balance value
};

const skipOption = (
  reader: ReturnType<typeof createBcsReader>,
  skipValue: (reader: ReturnType<typeof createBcsReader>) => void,
) => {
  const optionLength = reader.readUleb();
  if (optionLength === 0) {
    return;
  }
  if (optionLength !== 1) {
    throw new Error("Invalid SUI option value");
  }
  skipValue(reader);
};

export const readEndpointSendCallReceiptNativeFee = (bytes: Uint8Array) => {
  const reader = createBcsReader(bytes);

  // call::Call fields: id, caller, callee, one_way.
  reader.skipAddress();
  reader.skipAddress();
  reader.skipAddress();
  reader.readU8();

  // endpoint_send::SendParam.
  reader.readU32(); // dst_eid
  skipBytes32(reader); // receiver
  reader.skipVector(); // message
  reader.skipVector(); // options
  skipCoin(reader); // native_token
  skipOption(reader, skipCoin); // zro_token
  skipOption(reader, (optionReader) => optionReader.skipAddress()); // refund_address

  reader.readU8(); // mutable_param

  // call.result is Move Option<MessagingReceipt>.
  const resultLength = reader.readUleb();
  if (resultLength === 0) {
    return undefined;
  }
  if (resultLength !== 1) {
    throw new Error("Invalid SUI Call result option");
  }

  // messaging_receipt::MessagingReceipt { guid, nonce, messaging_fee }.
  skipBytes32(reader);
  reader.readU64(); // nonce
  return reader.readU64(); // messaging_fee.native_fee
};

const readCallU64Result = (
  bytes: Uint8Array,
  skipParam: (reader: ReturnType<typeof createBcsReader>) => void,
) => {
  const reader = createBcsReader(bytes);

  // call::Call fields before result: id, caller, callee, one_way, param,
  // mutable_param.
  reader.skipAddress();
  reader.skipAddress();
  reader.skipAddress();
  reader.readU8();
  skipParam(reader);
  reader.readU8();

  const resultLength = reader.readUleb();
  if (resultLength === 0) {
    return undefined;
  }
  if (resultLength !== 1) {
    throw new Error("Invalid SUI Call result option");
  }

  return reader.readU64();
};

const skipExecutorFeeParam = (reader: ReturnType<typeof createBcsReader>) => {
  reader.skipAddress(); // sender
  reader.readU32(); // dst_eid
  reader.readU64(); // call_data_size
  reader.skipVector(); // options
  reader.skipAddress(); // price_feed
  reader.skip(2); // default_multiplier_bps
  reader.readU64(); // lz_receive_base_gas
  reader.readU64(); // lz_compose_base_gas
  reader.skip(16); // floor_margin_usd
  reader.skip(16); // native_cap
  reader.skip(2); // multiplier_bps
};

const skipDvnFeeParam = (reader: ReturnType<typeof createBcsReader>) => {
  reader.skipAddress(); // sender
  reader.readU32(); // dst_eid
  reader.readU64(); // confirmations
  reader.skipVector(); // options
  reader.readU64(); // quorum
  reader.skipAddress(); // price_feed
  reader.skip(2); // default_multiplier_bps
  reader.skip(32); // gas u256
  reader.skip(2); // multiplier_bps
  reader.skip(16); // floor_margin_usd
};

const readLayerZeroFeeCallU64 = (type: string, bytes: Uint8Array) => {
  const normalized = type.toLowerCase();
  if (
    normalized.includes("::call::call<") &&
    normalized.includes("::executor_feelib_get_fee::feelibgetfeeparam") &&
    normalized.endsWith(", u64>")
  ) {
    return readCallU64Result(bytes, skipExecutorFeeParam);
  }

  if (
    normalized.includes("::call::call<") &&
    normalized.includes("::dvn_feelib_get_fee::feelibgetfeeparam") &&
    normalized.endsWith(", u64>")
  ) {
    return readCallU64Result(bytes, skipDvnFeeParam);
  }

  return undefined;
};

const parseBigintLike = (value: unknown) => {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "number") {
    return BigInt(value);
  }
  if (typeof value === "string" && value.trim()) {
    return BigInt(value);
  }
  return undefined;
};

const extractLayerZeroEventFee = (event: any) => {
  const type = String(event?.type ?? "").toLowerCase();
  const parsedJson = event?.parsedJson;

  if (type.endsWith("::send_uln::executorfeepaidevent")) {
    return parseBigintLike(parsedJson?.fee?.fee);
  }

  if (type.endsWith("::send_uln::dvnfeepaidevent")) {
    return (parsedJson?.fees ?? []).reduce(
      (total: bigint, feeRecipient: any) =>
        total + (parseBigintLike(feeRecipient?.fee) ?? BigInt(0)),
      BigInt(0),
    );
  }

  return undefined;
};

const extractNativeFeeFromEvents = (inspectResult: any) => {
  let eventFeeTotal = BigInt(0);
  let hasFeeEvent = false;

  for (const event of inspectResult?.events ?? []) {
    const eventFee = extractLayerZeroEventFee(event);
    if (typeof eventFee !== "undefined") {
      eventFeeTotal += eventFee;
      hasFeeEvent = true;
    }
  }

  return hasFeeEvent ? eventFeeTotal : undefined;
};

export const summarizeDevInspectReturnValues = (inspectResult: any) =>
  (inspectResult?.results ?? []).flatMap((result: any, resultIndex: number) =>
    (result?.returnValues ?? []).map((returnValue: any, valueIndex: number) => {
      let bytesLength = 0;
      let bytesError: string | undefined;
      try {
        bytesLength = Array.isArray(returnValue)
          ? toReturnBytes(returnValue[0]).length
          : 0;
      } catch (error) {
        bytesError = error instanceof Error ? error.message : String(error);
      }
      return {
        resultIndex,
        valueIndex,
        type: String(returnValue?.[1] ?? ""),
        bytesLength,
        bytesHex:
          Array.isArray(returnValue) &&
          !bytesError &&
          shouldLogReturnBytes(String(returnValue?.[1] ?? ""))
            ? bytesToHex(toReturnBytes(returnValue[0]))
            : null,
        bytesError,
      };
    }),
  );

export const extractNativeFeeFromDevInspect = (inspectResult: any) => {
  let feeCallTotal = BigInt(0);
  let hasFeeCall = false;
  const parseErrors: string[] = [];

  for (const result of inspectResult?.results ?? []) {
    for (const returnValue of result?.returnValues ?? []) {
      if (!Array.isArray(returnValue) || returnValue.length < 2) {
        continue;
      }

      const type = String(returnValue[1] ?? "");
      const bytes = toReturnBytes(returnValue[0]);
      if (type.includes("messaging_fee::MessagingFee")) {
        try {
          return readMessagingFeeNativeFee(bytes);
        } catch (error) {
          parseErrors.push(
            `${type}: ${error instanceof Error ? error.message : String(error)}`,
          );
          continue;
        }
      }

      if (
        type.includes("endpoint_send::SendParam") &&
        type.includes("messaging_receipt::MessagingReceipt")
      ) {
        try {
          const nativeFee = readEndpointSendCallReceiptNativeFee(bytes);
          if (typeof nativeFee !== "undefined") {
            return nativeFee;
          }
        } catch (error) {
          parseErrors.push(
            `${type}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      if (
        type.includes("message_lib_send::SendParam") &&
        type.includes("message_lib_send::SendResult")
      ) {
        try {
          const nativeFee = readMessageLibSendCallNativeFee(bytes);
          if (typeof nativeFee !== "undefined") {
            return nativeFee;
          }
        } catch (error) {
          parseErrors.push(
            `${type}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      try {
        const nativeFee = readLayerZeroFeeCallU64(type, bytes);
        if (typeof nativeFee !== "undefined") {
          feeCallTotal += nativeFee;
          hasFeeCall = true;
        }
      } catch (error) {
        parseErrors.push(
          `${type}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  if (hasFeeCall) {
    return feeCallTotal;
  }

  const eventFee = extractNativeFeeFromEvents(inspectResult);
  if (typeof eventFee !== "undefined") {
    return eventFee;
  }

  throw new Error(
    parseErrors.length > 0
      ? `Failed to quote Sui LayerZero fee: ${parseErrors.join("; ")}`
      : "Failed to quote Sui LayerZero fee",
  );
};
