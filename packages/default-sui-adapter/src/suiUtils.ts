import { SUI_NETWORK_CONFIG } from "@orderly.network/types";
import { SuiNetworkName } from "./types";

export const compareBigintDesc = (left: bigint, right: bigint) => {
  if (left === right) {
    return 0;
  }
  return left > right ? -1 : 1;
};

export const stripHexPrefix = (value: string) =>
  value.startsWith("0x") ? value.slice(2) : value;

export const fromHex = (hex: string) => {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

export const bytesFromHex = (hex: string) =>
  Array.from(fromHex(stripHexPrefix(hex)));

export const normalizeBytes32Hex = (value?: string) => {
  if (!value) {
    throw new Error("SUI bytes32 value is required");
  }

  const hex = stripHexPrefix(value).toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hex)) {
    throw new Error(`Invalid SUI bytes32 value: ${value}`);
  }
  return `0x${hex}`;
};

export const hex64 = (value: string) => {
  const hex = stripHexPrefix(value).toLowerCase();
  if (!/^[0-9a-f]*$/.test(hex) || hex.length > 64) {
    throw new Error(`Invalid SUI hex value: ${value}`);
  }
  return `0x${hex.padStart(64, "0")}`;
};

export const bigintString = (value: string | number | bigint | undefined) => {
  if (typeof value === "undefined") {
    throw new Error("SUI message numeric value is required");
  }
  return BigInt(value).toString();
};

export const readU64LE = (bytes: Uint8Array, offset = 0) => {
  let value = BigInt(0);
  for (let i = 0; i < 8; i += 1) {
    value |= BigInt(bytes[offset + i] ?? 0) << BigInt(8 * i);
  }
  return value;
};

export const readSuiBalance = (balance: any) =>
  BigInt(
    balance?.totalBalance ??
      balance?.balance?.addressBalance ??
      balance?.balance?.coinBalance ??
      balance?.balance?.balance ??
      0,
  );

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const resolveSuiNetwork = (
  providerNetwork: SuiNetworkName,
  chainId: number,
): SuiNetworkName => {
  if (chainId === SUI_NETWORK_CONFIG.mainnet.chainId) {
    return "mainnet";
  }
  if (chainId === SUI_NETWORK_CONFIG.testnet.chainId) {
    return "testnet";
  }
  return providerNetwork;
};
