import type { TelegramUserData, WalletData, BindingData } from "../types";

export type { TelegramUserData, WalletData, BindingData };

export type UseTelegramBindingReturn = {
  telegramUser: TelegramUserData | null;
  isWalletConnected: boolean;
  isBinding: boolean;
  bindingStatus: "idle" | "success" | "error";
  handleTelegramLogin: () => void;
  walletAddress: string;
  selectedChainId?: number;
  getTemporaryOrderlyKey: () => Promise<{
    orderlyKey: string;
    privateKey: string;
  }>;
  registerOrderlyKey: (
    orderlyKey: string,
    opts?: {
      userAddress?: string;
      scope?: string;
      brokerId?: string;
      chainId?: number;
      chainType?: "EVM" | "SOLANA";
      timestamp?: number;
      expiration?: number;
    },
  ) => Promise<any>;
  getOrderlyKeyEIP712Data: (
    chainId: number,
    isSmartWallet: boolean,
    orderlyKeyMessage: any,
  ) => any;
  verifyOrderlyKey: () => Promise<any>;
  hasOrderlyPrivateKey: boolean;
  hasVerifiedOrderly: boolean;
};

export type AddKeyMessage = {
  brokerId: string;
  chainId: number | string;
  orderlyKey: string;
  scope: string;
  timestamp: number | string;
  expiration: number | string;
};

export type AuthTokenData = {
  token: string;
  timestamp: number;
};
