import { BaseOrderlyKeyPair, OrderlyKeyPair } from "./keyPair";

export interface KeyStore {
  getOrderlyKey: () => OrderlyKeyPair;
  generateKey: () => OrderlyKeyPair;
  setKey: (orderlyKey: string, secretKey: string) => void;
}

export class LocalStorageStore implements KeyStore {
  constructor(
    private readonly networkId: string,
    private readonly accountId: string
  ) {}

  getOrderlyKey(): OrderlyKeyPair {
    //TODO: get secretKey from localStorage, and return a OrderlyKeyPair
    //

    return new BaseOrderlyKeyPair("");
  }

  generateKey() {
    return new BaseOrderlyKeyPair("");
  }

  setKey(orderlyKey: string, secretKey: string) {
    localStorage.setItem(`${this._keyPrefix}orderlyKey`, orderlyKey);
    localStorage.setItem(`${this._keyPrefix}secretKey`, secretKey);
  }

  private get _keyPrefix() {
    return `orderly_${this.networkId}_`;
  }
}
// Woo是用readux管理状态，需要另外实现针对 woo 的存取方法

export class MockKeyStore implements KeyStore {
  constructor(private readonly secretKey: string) {}
  generateKey() {
    return new BaseOrderlyKeyPair(this.secretKey);
  }

  getOrderlyKey() {
    return new BaseOrderlyKeyPair(this.secretKey);
  }

  setKey(orderlyKey: string, secretKey: string): void {}
}
