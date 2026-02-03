export interface StarchildConfig {
  enable: boolean;
  env: "testnet" | "mainnet";
  telegram_bot_id: string;
  url: string;
}

export interface StarchildProviderConfig {
  enable: boolean;
  getBotId: (env: string) => string;
}

export interface TelegramUserData {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface WalletData {
  address: string;
  chainId: number;
  namespace: string;
}

export interface BindingData {
  telegram: TelegramUserData;
  wallet: WalletData;
  bindingId: string;
}
