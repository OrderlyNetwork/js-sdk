export const WALLET_MODES = ["privy", "wallet", "legacy"] as const;

export type WalletMode = (typeof WALLET_MODES)[number];

export const DEFAULT_WALLET_MODE: WalletMode = "privy";

export function parseWalletMode(value: string | null | undefined): WalletMode {
  return WALLET_MODES.includes(value as WalletMode)
    ? (value as WalletMode)
    : DEFAULT_WALLET_MODE;
}
