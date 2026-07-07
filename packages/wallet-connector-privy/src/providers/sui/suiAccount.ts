import { normalizeSuiAddress } from "@mysten/sui/utils";
import { publicKeyFromSuiBytes } from "@mysten/sui/verify";
import {
  getSuiPublicKeyScheme as getCoreSuiPublicKeyScheme,
  isSupportedSuiPublicKeyScheme,
  normalizeSuiEd25519PublicKey,
} from "@orderly.network/core";
import { SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY } from "@orderly.network/types";

export interface SuiWalletAccount {
  address: string;
  label?: string;
  publicKey?: string;
  rawPublicKey?: string;
  publicKeyScheme?: number;
}

export type SuiWalletProviderAccount = SuiWalletAccount &
  Record<string, unknown>;

type SuiAccountPublicKeySource = {
  address?: string;
  publicKey?: unknown;
  rawPublicKey?: unknown;
};

type SuiWalletAccountSource = {
  accounts?: SuiAccountPublicKeySource[];
};

export type SuiPublicKeyData = {
  publicKey: string;
  rawPublicKey: string;
  publicKeyScheme: number;
};

const normalizeSuiAddressOption = (address?: string) => {
  try {
    return address ? normalizeSuiAddress(address) : undefined;
  } catch {
    return undefined;
  }
};

export const normalizeSuiPublicKeyData = (
  value: unknown,
  address?: string,
): SuiPublicKeyData | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeSuiEd25519PublicKey(value);
  if (normalized) {
    return {
      publicKey: normalized.publicKey,
      rawPublicKey: normalized.rawPublicKey,
      publicKeyScheme: normalized.publicKeyScheme,
    };
  }

  if (typeof value === "string") {
    try {
      const publicKey = publicKeyFromSuiBytes(value, {
        address: normalizeSuiAddressOption(address),
      });
      const suiBytes = publicKey.toSuiBytes?.();
      if (!isSupportedSuiPublicKeyScheme(suiBytes?.[0])) {
        return undefined;
      }
      const normalizedPublicKey = normalizeSuiEd25519PublicKey(publicKey);
      return normalizedPublicKey
        ? {
            publicKey: normalizedPublicKey.publicKey,
            rawPublicKey: normalizedPublicKey.rawPublicKey,
            publicKeyScheme: normalizedPublicKey.publicKeyScheme,
          }
        : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const getSuiPublicKeyScheme = (value: unknown): number | undefined => {
  const scheme = getCoreSuiPublicKeyScheme(value);
  if (typeof scheme !== "undefined") {
    return scheme;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return publicKeyFromSuiBytes(value).toSuiBytes?.()?.[0];
  } catch {
    return undefined;
  }
};

const getSuiAccountPublicKeyValue = (
  account: unknown,
  wallet?: SuiWalletAccountSource | null,
) => {
  const currentAccount = account as SuiAccountPublicKeySource;
  const walletAccount = wallet?.accounts?.find(
    (item) => item.address === currentAccount?.address,
  );

  return {
    address: currentAccount?.address,
    publicKeyValue:
      currentAccount?.publicKey ??
      walletAccount?.publicKey ??
      currentAccount?.rawPublicKey ??
      walletAccount?.rawPublicKey,
  };
};

export const getSuiAccountPublicKeyData = (
  account: unknown,
  wallet?: SuiWalletAccountSource | null,
) => {
  const { address, publicKeyValue } = getSuiAccountPublicKeyValue(
    account,
    wallet,
  );

  return normalizeSuiPublicKeyData(publicKeyValue, address);
};

export const getSuiAccountPublicKey = (
  account: unknown,
  wallet?: SuiWalletAccountSource | null,
) => getSuiAccountPublicKeyData(account, wallet)?.publicKey;

export const getSuiAccountRawPublicKey = (
  account: unknown,
  wallet?: SuiWalletAccountSource | null,
) => getSuiAccountPublicKeyData(account, wallet)?.rawPublicKey;

export const getSuiAccountPublicKeyScheme = (
  account: unknown,
  wallet?: SuiWalletAccountSource | null,
) => {
  const { publicKeyValue } = getSuiAccountPublicKeyValue(account, wallet);
  return getSuiPublicKeyScheme(publicKeyValue);
};

export const isSupportedSuiAccountPublicKey = (value: unknown) => {
  const scheme = getSuiPublicKeyScheme(value);
  if (typeof scheme === "undefined") {
    return true;
  }

  return isSupportedSuiPublicKeyScheme(scheme);
};

export const assertSupportedSuiAccount = (account?: {
  publicKey?: unknown;
  rawPublicKey?: unknown;
}) => {
  if (
    !isSupportedSuiAccountPublicKey(account?.publicKey ?? account?.rawPublicKey)
  ) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY);
  }
};
