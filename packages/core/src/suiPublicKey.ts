import { decode as bs58decode, encode as bs58encode } from "bs58";
import { SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY } from "@orderly.network/types";

export const SUI_ED25519_SIGNATURE_FLAG = 0x00;

const stripHexPrefix = (value: string) =>
  value.startsWith("0x") ? value.slice(2) : value;

const bytesToHex = (bytes: ArrayLike<number>) =>
  Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");

const bytesFromHex = (hex: string) => {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return undefined;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const toUint8Array = (value: unknown): Uint8Array | undefined => {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }

  if (typeof value === "object" && value !== null) {
    const publicKey = value as {
      toRawBytes?: () => Uint8Array;
      toSuiBytes?: () => Uint8Array;
      toBytes?: () => Uint8Array;
    };
    const bytes =
      publicKey.toRawBytes?.() ??
      publicKey.toSuiBytes?.() ??
      publicKey.toBytes?.();

    if (bytes) {
      return bytes;
    }

    if (typeof (value as { length?: unknown }).length === "number") {
      const arrayLike = value as ArrayLike<number>;
      return Uint8Array.from(
        { length: arrayLike.length },
        (_, index) => arrayLike[index],
      );
    }
  }
};

const getObjectSuiBytes = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  return (value as { toSuiBytes?: () => Uint8Array }).toSuiBytes?.();
};

export const getSuiPublicKeyScheme = (value?: unknown): number | undefined => {
  if (!value) {
    return undefined;
  }

  const suiBytes = getObjectSuiBytes(value);
  if (suiBytes?.length) {
    return suiBytes[0];
  }

  const valueBytes = toUint8Array(value);
  if (valueBytes) {
    if (valueBytes.length === 32) {
      return SUI_ED25519_SIGNATURE_FLAG;
    }
    if (valueBytes.length >= 33) {
      return valueBytes[0];
    }
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  const hex = stripHexPrefix(trimmed);
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return SUI_ED25519_SIGNATURE_FLAG;
  }

  if (/^[0-9a-fA-F]{66,}$/.test(hex)) {
    return bytesFromHex(hex)?.[0];
  }

  try {
    const decoded = bs58decode(trimmed);
    if (decoded.length === 32) {
      return SUI_ED25519_SIGNATURE_FLAG;
    }
    if (decoded.length >= 33) {
      return decoded[0];
    }
  } catch {
    return undefined;
  }
};

export type SuiEd25519PublicKey = {
  publicKey: string;
  rawPublicKey: string;
  rawPublicKeyBytes: Uint8Array;
  publicKeyScheme: typeof SUI_ED25519_SIGNATURE_FLAG;
};

export const isSupportedSuiPublicKeyScheme = (scheme?: number) =>
  typeof scheme === "undefined" || scheme === SUI_ED25519_SIGNATURE_FLAG;

export const assertSupportedSuiPublicKeyScheme = (scheme?: number) => {
  if (!isSupportedSuiPublicKeyScheme(scheme)) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY);
  }
};

export const isSupportedSuiAccountPublicKey = (value?: unknown) =>
  isSupportedSuiPublicKeyScheme(getSuiPublicKeyScheme(value));

export const assertSupportedSuiAccountPublicKey = (value?: unknown) => {
  assertSupportedSuiPublicKeyScheme(getSuiPublicKeyScheme(value));
};

export const normalizeSuiEd25519PublicKey = (
  value?: unknown,
): SuiEd25519PublicKey | undefined => {
  if (!value) {
    return undefined;
  }

  const valueBytes = toUint8Array(value);
  if (valueBytes) {
    const rawBytes =
      valueBytes.length === 33 && valueBytes[0] === SUI_ED25519_SIGNATURE_FLAG
        ? valueBytes.slice(1)
        : valueBytes;

    if (rawBytes.length === 32) {
      return {
        publicKey: bs58encode(rawBytes),
        rawPublicKey: `0x${bytesToHex(rawBytes)}`,
        rawPublicKeyBytes: Uint8Array.from(rawBytes),
        publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
      };
    }

    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  const hex = stripHexPrefix(trimmed);
  if (/^[0-9a-fA-F]{64}$/.test(hex)) {
    return normalizeSuiEd25519PublicKey(bytesFromHex(hex));
  }

  if (/^[0-9a-fA-F]{66}$/.test(hex)) {
    const bytes = bytesFromHex(hex);
    if (bytes?.[0] === SUI_ED25519_SIGNATURE_FLAG) {
      return normalizeSuiEd25519PublicKey(bytes);
    }
    return undefined;
  }

  try {
    return normalizeSuiEd25519PublicKey(bs58decode(trimmed));
  } catch {
    return undefined;
  }
};

export const normalizeSuiPublicKeyToBase58 = (value?: unknown) =>
  normalizeSuiEd25519PublicKey(value)?.publicKey;

export const normalizeSuiPublicKeyToBytes32Hex = (value?: unknown) =>
  normalizeSuiEd25519PublicKey(value)?.rawPublicKey;

export const normalizeSuiPublicKeyToBytes = (value?: unknown) =>
  normalizeSuiEd25519PublicKey(value)?.rawPublicKeyBytes;
