import { BaseOrderlyKeyPair, OrderlyKeyPair } from "./keyPair";

export interface OrderlyKeyStore {
  getOrderlyKey: () => OrderlyKeyPair;
  getAccountId: () => string | undefined;
  setAccountId: (accountId: string) => void;
  getAddress: () => string | undefined;
  setAddress: (address: string) => void;
  generateKey: () => OrderlyKeyPair;
  cleanKey: (key: string) => void;
  cleanAllKey: () => void;
  setKey: (orderlyKey: string, secretKey: string) => void;
}

export abstract class BaseKeyStore implements OrderlyKeyStore {
  constructor(
    private readonly networkId: string // private readonly accountId: string
  ) {}
  abstract getOrderlyKey(): OrderlyKeyPair;
  abstract getAccountId(): string | undefined;
  abstract setAccountId(accountId: string): void;
  abstract getAddress(): string | undefined;
  abstract setAddress(address: string): void;
  abstract generateKey(): OrderlyKeyPair;
  abstract setKey(orderlyKey: string, secretKey: string): void;
  abstract cleanAllKey(): void;
  abstract cleanKey(key: string): void;

  protected get keyPrefix() {
    return `orderly_${this.networkId}_`;
  }
}

export class LocalStorageStore extends BaseKeyStore {
  getOrderlyKey(): OrderlyKeyPair {
    //TODO: get secretKey from localStorage, and return a OrderlyKeyPair
    //

    return new BaseOrderlyKeyPair("");
  }

  getAccountId() {
    return "";
  }

  setAccountId(accountId: string) {
    localStorage.setItem(`${this.keyPrefix}accountId`, accountId);
  }

  getAddress() {
    return "";
  }

  setAddress(address: string) {}

  generateKey() {
    return new BaseOrderlyKeyPair("");
  }

  setKey(orderlyKey: string, secretKey: string) {
    localStorage.setItem(`${this.keyPrefix}orderlyKey`, orderlyKey);
    localStorage.setItem(`${this.keyPrefix}secretKey`, secretKey);
  }

  cleanAllKey(): void {}
  cleanKey(key: string): void {}
}
// Woo是用readux管理状态，需要另外实现针对 woo 的存取方法

export class MockKeyStore implements OrderlyKeyStore {
  constructor(private readonly secretKey: string) {}
  generateKey() {
    return new BaseOrderlyKeyPair(this.secretKey);
  }

  getOrderlyKey() {
    return new BaseOrderlyKeyPair(this.secretKey);
  }

  getAccountId() {
    return "";
  }

  setAccountId(accountId: string) {}

  getAddress() {
    return "";
  }

  setAddress(address: string) {}

  setKey(orderlyKey: string, secretKey: string): void {}

  cleanAllKey(): void {}
  cleanKey(key: string): void {}
}
