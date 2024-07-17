import { BaseOrderlyKeyPair, OrderlyKeyPair } from "./keyPair";

export interface OrderlyKeyStore {
  getOrderlyKey: (address?: string) => OrderlyKeyPair | null;
  getAccountId: (address: string) => string | undefined | null;
  setAccountId: (address: string, accountId: string) => void;
  getAddress: () => string | undefined | null;
  setAddress: (address: string) => void;
  removeAddress: () => void;
  generateKey: () => OrderlyKeyPair;
  cleanKey: (address: string, key: string) => void;
  cleanAllKey: (address: string) => void;
  setKey: (orderlyKey: string, secretKey: OrderlyKeyPair) => void;
}

export abstract class BaseKeyStore implements OrderlyKeyStore {
  constructor(
    private readonly networkId: string = "testnet" // private readonly accountId: string
  ) {}
  abstract getOrderlyKey(address?: string): OrderlyKeyPair | null;
  abstract getAccountId(address: string): string | undefined | null;
  abstract setAccountId(address: string, accountId: string): void;
  abstract getAddress(): string | undefined | null;
  abstract setAddress(address: string): void;
  abstract removeAddress(): void;
  abstract generateKey(): OrderlyKeyPair;
  abstract setKey(orderlyKey: string, secretKey: OrderlyKeyPair): void;
  abstract cleanAllKey(address: string): void;
  abstract cleanKey(address: string, key: string): void;

  protected get keyPrefix() {
    return `orderly_${this.networkId}_`;
  }
}

export class LocalStorageStore extends BaseKeyStore {
  getOrderlyKey(address?: string): OrderlyKeyPair | null {
    //TODO: get secretKey from localStorage, and return a OrderlyKeyPair
    //
    let orderlyKey;

    if (address) {
      orderlyKey = this.getItem(address, "orderlyKey");
    } else {
      //if address is undefined, get the default address
      const address = this.getAddress();
      if (!address) return null;
      orderlyKey = this.getItem(address, "orderlyKey");
    }

    if (!orderlyKey) {
      return null;
    }
    return new BaseOrderlyKeyPair(orderlyKey);
  }

  getAccountId(address: string): string | undefined | null {
    return this.getItem(address, "accountId");
  }

  setAccountId(address: string, accountId: string) {
    // localStorage.setItem(`${this.keyPrefix}accountId`, accountId);
    this.setItem(address, { accountId });
  }

  getAddress(): string | undefined | null {
    return localStorage.getItem(`${this.keyPrefix}address`);
  }

  setAddress(address: string) {
    localStorage.setItem(`${this.keyPrefix}address`, address);
    // this.setItem(address, { address });
  }
  removeAddress() {
    localStorage.removeItem(`${this.keyPrefix}address`);
  }

  generateKey() {
    return BaseOrderlyKeyPair.generateKey();
  }

  setKey(address: string, orderlyKey: OrderlyKeyPair) {
    // localStorage.setItem(`${this.keyPrefix}orderlyKey`, orderlyKey);
    // localStorage.setItem(`${this.keyPrefix}secretKey`, secretKey);
    this.setItem(address, { orderlyKey: orderlyKey.secretKey });
  }

  cleanAllKey(address: string): void {
    localStorage.removeItem(`${this.keyPrefix}${address}`);
    localStorage.removeItem(`${this.keyPrefix}address`);
  }
  cleanKey(address: string, key: string): void {
    const data = this.getItem(address);
    delete data[key];
    localStorage.setItem(`${this.keyPrefix}${address}`, JSON.stringify(data));
  }

  private setItem(address: string, value: Record<string, any>) {
    const key = `${this.keyPrefix}${address}`;
    let oldValue: any = localStorage.getItem(key);

    if (oldValue) {
      oldValue = JSON.parse(oldValue);
    } else {
      oldValue = {};
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        ...oldValue,
        ...value,
      })
    );
  }

  private getItem(address: string, name?: string) {
    const key = `${this.keyPrefix}${address}`;
    let value: any = localStorage.getItem(key);

    if (value) {
      value = JSON.parse(value);
    } else {
      value = {};
    }

    if (typeof name === "undefined") {
      return value;
    }

    return value[name];
  }
}

// for readux manage state
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

  removeAddress() {}

  setKey(orderlyKey: string, secretKey: OrderlyKeyPair): void {}

  cleanAllKey(): void {}
  cleanKey(key: string): void {}
}
