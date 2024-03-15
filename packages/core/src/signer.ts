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
 * Singer interface
 * @example
 * ```ts
 * const signer = new BaseSigner(keyStore);
 * const payload = await signer.sign({
 *  url: "https://api.orderly.io/get_account?address=0x1234567890&brokerId=orderly",
 *   method: "GET",
 *   data: {
 *     address: "0x1234567890",
 *     brokerId: "orderly",
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
    const timestamp = Date.now().toString();
    // const url = message.url.split(message.baseUrl)[1];

    let msgStr = [timestamp, message.method.toUpperCase(), message.url].join(
      ""
    );

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
