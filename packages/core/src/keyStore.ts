export interface KeyStore {
  getOrderlyKey: () => string;
  generateKey: () => string;
  setKey: (orderlyKey: string, secretKey: string) => void;
}

class BaseKeyStore implements KeyStore {
  constructor(private readonly networkId: string) {}

  getOrderlyKey(): string {
    return "orderly";
  }

  generateKey() {
    return "";
  }

  setKey(orderlyKey: string, secretKey: string) {
    localStorage.setItem(`${this._keyPrefix}orderlyKey`, orderlyKey);
    localStorage.setItem(`${this._keyPrefix}secretKey`, secretKey);
  }

  private get _keyPrefix() {
    return `orderly_${this.networkId}_`;
  }
}
