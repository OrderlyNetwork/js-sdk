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
