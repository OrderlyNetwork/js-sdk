"use client";

import { OrderlyKeyStore } from "./keyStore";
import { base64url } from "./utils";

import { Buffer } from "buffer";
// window.Buffer = window.Buffer || Buffer;

export type MessageFactor = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
};

export type SignedMessagePayload = {
  "orderly-key": string;
  "orderly-timestamp": string;
  "orderly-signature": string;
  "orderly-account-id"?: string;
};

/**
 * 签名
 * @example
 * ```ts
 * const signer = new BaseSigner(keyStore);
 * const payload = await signer.sign({
 *  url: "https://api.orderly.io/get_account?address=0x1234567890&brokerId=woofi_dex",
 *   method: "GET",
 *   data: {
 *     address: "0x1234567890",
 *     brokerId: "woofi_dex",
 *    },
 *  });
 *  ```
 */
export interface Signer {
  sign: (data: MessageFactor) => Promise<SignedMessagePayload>;
  signText: (text: string) => Promise<{ signature: string; publicKey: string }>;
}

export class BaseSigner implements Signer {
  constructor(private readonly keyStore: OrderlyKeyStore) {}

  async sign(message: MessageFactor): Promise<SignedMessagePayload> {
    // const orderlyKeyPair = this.keyStore.getOrderlyKey();
    const url = new URL(message.url);
    const timestamp = Date.now().toString();
    let msgStr = [
      timestamp,
      message.method.toUpperCase(),
      url.pathname + url.search,
    ].join("");
    if (message.data && Object.keys(message.data).length) {
      msgStr += JSON.stringify(message.data);
    }

    const { signature, publicKey } = await this.signText(msgStr);

    return {
      "orderly-key": publicKey,
      "orderly-timestamp": timestamp,
      "orderly-signature": signature,
    };
  }

  async signText(
    text: string
  ): Promise<{ signature: string; publicKey: string }> {
    const orderlyKeyPair = this.keyStore.getOrderlyKey();

    // console.log("sign orderlyKeyPair:", orderlyKeyPair);

    if (!orderlyKeyPair) {
      throw new Error("orderlyKeyPair is not defined");
    }

    const u8 = Buffer.from(text);

    const signature = await orderlyKeyPair.sign(u8);

    const signHex = Buffer.from(signature).toString("base64");

    const b64 = base64url(signHex);

    return {
      signature: b64,
      publicKey: await orderlyKeyPair.getPublicKey(),
    };
  }
}
