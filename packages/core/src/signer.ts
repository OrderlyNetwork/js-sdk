import { KeyStore } from "./keyStore";

export interface Signer {
  sign: (data: Uint8Array) => Promise<Uint8Array>;
}

class BaseSigner implements Signer {
  constructor(private readonly keyStore: KeyStore) {}

  async sign<T>(data: T): Promise<T> {
    const orderlyKey = this.keyStore.getOrderlyKey();
    return Promise.resolve(data);
  }
}
