import { encode as bs58encode, decode as bs58Decode } from "bs58";
import * as ed from "@noble/ed25519";

export interface OrderlyKeyPair {
  getPublicKey(): Promise<string>;
  secretKey: string;
  sign: (data: Uint8Array) => Promise<Uint8Array>;
}

export class BaseOrderlyKeyPair implements OrderlyKeyPair {
  secretKey: string;
  private privateKey: string;

  static generateKey(): OrderlyKeyPair {
    let privKey, secretKey;
    do {
      privKey = ed.utils.randomPrivateKey();
      secretKey = bs58encode(privKey);
    } while (secretKey.length !== 44);

    // const secretKey = bs58encode(privKey);

    return new BaseOrderlyKeyPair(secretKey);
  }

  constructor(secretKey: string) {
    this.secretKey = secretKey;
    const bytes = bs58Decode(secretKey);
    this.privateKey = Buffer.from(bytes).toString("hex");
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return await ed.signAsync(message, this.privateKey);
  }

  async getPublicKey(): Promise<string> {
    const pubKey = await ed.getPublicKeyAsync(this.privateKey);

    const publicKey = `ed25519:${bs58encode(pubKey)}`;
    return publicKey;
  }

  toString() {
    return this.privateKey;
  }
}
