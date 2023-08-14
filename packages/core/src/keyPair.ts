import { encode as bs58encode } from "bs58";
import * as ed from "@noble/ed25519";

export interface OrderlyKeyPair {
  getPublicKey(): Promise<string>;
  secretKey: string;
  sign: (data: Uint8Array) => Promise<Uint8Array>;
}

export class BaseOrderlyKeyPair implements OrderlyKeyPair {
  secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await ed.signAsync(message, this.secretKey);
  }

  async getPublicKey(): Promise<string> {
    const pubKey = await ed.getPublicKeyAsync(this.secretKey);

    const publicKey = `ed25519:${bs58encode(pubKey)}`;
    return publicKey;
  }
}
