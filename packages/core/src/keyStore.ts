import { OrderlyKeyPair } from "./keyPair";

export interface KeyStore {
  getOrderlyKey: () => OrderlyKeyPair;
  generateKey: () => OrderlyKeyPair;
  setKey: (orderlyKey: string, secretKey: string) => void;
}

class LocalStorageStore implements KeyStore {
  constructor(private readonly networkId: string) {}

  getOrderlyKey(): OrderlyKeyPair {
    return { publicKey: "", secretKey: "" };
  }

  generateKey() {
    return { publicKey: "", secretKey: "" };
  }

  setKey(orderlyKey: string, secretKey: string) {
    localStorage.setItem(`${this._keyPrefix}orderlyKey`, orderlyKey);
    localStorage.setItem(`${this._keyPrefix}secretKey`, secretKey);
  }

  private get _keyPrefix() {
    return `orderly_${this.networkId}_`;
  }
}
