import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { normalizeSuiPublicKeyToBase58 } from "@orderly.network/core";
import { ChainNamespace } from "@orderly.network/types";

export type WalletLookupNetwork = "EVM" | "SOL" | "SUI";

export type WalletLookupIdentity = {
  address: string;
  network: WalletLookupNetwork;
};

const SUI_ADDRESS_LENGTH = 64;

const normalizeBase58PublicKey = (value: string) => {
  try {
    const pubKey = new PublicKey(value);
    const bytes = pubKey.toBytes();
    if (bytes.length === 32 && PublicKey.isOnCurve(bytes)) {
      return pubKey.toBase58();
    }
  } catch {}

  return undefined;
};

export const getWalletLookupNetworkByNamespace = (
  namespace?: ChainNamespace | string | null,
): WalletLookupNetwork | undefined => {
  const normalizedNamespace =
    typeof namespace === "string" ? namespace.toUpperCase() : namespace;
  if (normalizedNamespace === ChainNamespace.sui) {
    return "SUI";
  }
  if (normalizedNamespace === ChainNamespace.solana) {
    return "SOL";
  }
  if (normalizedNamespace === "SOLANA") {
    return "SOL";
  }
  if (normalizedNamespace === ChainNamespace.evm) {
    return "EVM";
  }
};

export const getWalletLookupNetworkLabel = (
  network?: WalletLookupNetwork,
): string => {
  if (network === "SOL") {
    return "Solana";
  }
  if (network === "SUI") {
    return "Sui";
  }
  if (network === "EVM") {
    return "EVM";
  }
  return "";
};

export const normalizeSuiLookupPublicKey = (value: string) =>
  normalizeSuiPublicKeyToBase58(value.trim());

export const normalizeSuiWithdrawAddress = (value: string) => {
  const hex = value.trim().replace(/^0x/i, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(hex) || hex.length > SUI_ADDRESS_LENGTH) {
    return undefined;
  }

  return `0x${hex.padStart(SUI_ADDRESS_LENGTH, "0")}`;
};

export const normalizeExternalWalletAddress = (
  address: string,
  network?: WalletLookupNetwork,
) => {
  if (network === "SUI") {
    return normalizeSuiWithdrawAddress(address);
  }

  const trimmed = address.trim();
  return trimmed || undefined;
};

export const getAccountLookupIdentities = (
  address: string,
  preferredNetwork?: WalletLookupNetwork,
): WalletLookupIdentity[] => {
  const trimmed = address.trim();

  if (preferredNetwork === "SUI") {
    const publicKey = normalizeSuiLookupPublicKey(trimmed);
    return publicKey ? [{ address: publicKey, network: "SUI" }] : [];
  }

  if (preferredNetwork === "SOL") {
    const publicKey = normalizeBase58PublicKey(trimmed);
    return publicKey ? [{ address: publicKey, network: "SOL" }] : [];
  }

  if (preferredNetwork === "EVM") {
    return ethers.isAddress(trimmed)
      ? [{ address: trimmed, network: "EVM" }]
      : [];
  }

  if (ethers.isAddress(trimmed)) {
    return [{ address: trimmed, network: "EVM" }];
  }

  const identities: WalletLookupIdentity[] = [];
  const suiPublicKey = normalizeSuiLookupPublicKey(trimmed);
  if (suiPublicKey) {
    identities.push({ address: suiPublicKey, network: "SUI" });
  }

  const solPublicKey = normalizeBase58PublicKey(trimmed);
  if (solPublicKey) {
    identities.push({ address: solPublicKey, network: "SOL" });
  }

  return identities;
};

export const validateAccountLookupIdentity = (
  address: string,
  preferredNetwork?: WalletLookupNetwork,
): { valid: boolean; network?: WalletLookupNetwork } => {
  const identities = getAccountLookupIdentities(address, preferredNetwork);
  if (identities.length === 0) {
    return { valid: false };
  }
  return {
    valid: true,
    network: identities.length === 1 ? identities[0].network : undefined,
  };
};

export const validateExternalWalletAddress = (
  address: string,
  preferredNetwork?: WalletLookupNetwork,
): { valid: boolean; network?: WalletLookupNetwork } => {
  if (preferredNetwork === "SUI") {
    return normalizeSuiWithdrawAddress(address)
      ? { valid: true, network: "SUI" }
      : { valid: false };
  }

  return validateAccountLookupIdentity(address, preferredNetwork);
};
