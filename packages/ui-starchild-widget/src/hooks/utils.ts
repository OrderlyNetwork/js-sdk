import {
  AbiCoder,
  keccak256,
  solidityPackedKeccak256,
  toUtf8Bytes,
} from "ethers";
import type { AddKeyMessage } from "./types";

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const bytesToBase58 = (bytes: Uint8Array): string => {
  if (!bytes.length) return "";

  let num = 0n;
  for (const b of bytes) {
    num = (num << 8n) + BigInt(b);
  }

  let encoded = "";
  while (num > 0n) {
    const rem = Number(num % 58n);
    num /= 58n;
    encoded = BASE58_ALPHABET[rem] + encoded;
  }

  // Preserve leading zeros as "1" in base58
  for (const b of bytes) {
    if (b === 0) {
      encoded = "1" + encoded;
    } else {
      break;
    }
  }

  return encoded;
};

export const safeParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const utf8ToHex = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
};

export const ethereumPersonalMessageHash = (text: string) => {
  // "\x19Ethereum Signed Message:\n" + len + message
  const messageBytes = toUtf8Bytes(text);
  const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
  const prefixed = new Uint8Array([...toUtf8Bytes(prefix), ...messageBytes]);
  return keccak256(prefixed);
};

export const normalizeSignatureV = (sigHex: string) => {
  let s = sigHex.toLowerCase();
  if (s.startsWith("0x")) s = s.slice(2);
  if (s.length !== 130) return s;
  const v = s.slice(128, 130);
  if (v === "00") return s.slice(0, 128) + "1b";
  if (v === "01") return s.slice(0, 128) + "1c";
  return s;
};

// Build EIP-712 typed data for AddOrderlyKey (parity with Go getOrderlyKeyEIP712Data)
export const getOrderlyKeyEIP712Data = (
  chainId: number,
  _isSmartWallet: boolean,
  orderlyKeyMessage: AddKeyMessage,
) => {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      AddOrderlyKey: [
        { name: "brokerId", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "orderlyKey", type: "string" },
        { name: "scope", type: "string" },
        { name: "timestamp", type: "uint64" },
        { name: "expiration", type: "uint64" },
      ],
    },
    primaryType: "AddOrderlyKey",
    domain: {
      name: "Orderly",
      version: "1",
      chainId: chainId,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    message: {
      brokerId: orderlyKeyMessage.brokerId,
      chainId: String(orderlyKeyMessage.chainId),
      orderlyKey: orderlyKeyMessage.orderlyKey,
      scope: orderlyKeyMessage.scope,
      timestamp: String(orderlyKeyMessage.timestamp),
      expiration: String(orderlyKeyMessage.expiration),
    },
  } as const;
};

// Sign the AddOrderlyKey EIP-712 typed data using the connected EVM wallet
export const signOrderlyKeyEIP712 = async (
  message: AddKeyMessage,
  chainId: number,
  signer: string,
  provider: any,
): Promise<string> => {
  if (!signer || !provider) throw new Error("Wallet not connected");

  const typed = getOrderlyKeyEIP712Data(chainId, false, message);
  const typedJson = JSON.stringify(typed);

  let signatureHex = "" as string;
  try {
    signatureHex = await provider.request?.({
      method: "eth_signTypedData_v4",
      params: [signer, typedJson],
    });
  } catch (e) {
    try {
      signatureHex = await provider.request?.({
        method: "eth_signTypedData",
        params: [signer, typed],
      });
    } catch (e2) {
      signatureHex = await provider.request?.({
        method: "eth_signTypedData_v3",
        params: [signer, typedJson],
      });
    }
  }
  return normalizeSignatureV(signatureHex);
};

// Build the Solana AddOrderlyKey preimage using the same scheme as the
// default Solana adapter's `addOrderlyKeyMessage` helper.
export const buildSolanaAddOrderlyKeySignBytes = (
  message: AddKeyMessage,
): Uint8Array => {
  const brokerIdHash = solidityPackedKeccak256(["string"], [message.brokerId]);
  const orderlyKeyHash = solidityPackedKeccak256(
    ["string"],
    [message.orderlyKey],
  );
  const scopeHash = solidityPackedKeccak256(["string"], [message.scope]);

  const abi = AbiCoder.defaultAbiCoder();
  const encoded = abi.encode(
    ["bytes32", "bytes32", "bytes32", "uint256", "uint256", "uint256"],
    [
      brokerIdHash,
      orderlyKeyHash,
      scopeHash,
      BigInt(message.chainId),
      BigInt(message.timestamp),
      BigInt(message.expiration),
    ],
  );

  const msgToSignHex = keccak256(encoded); // 0x-prefixed hex string
  const hexWithoutPrefix = msgToSignHex.startsWith("0x")
    ? msgToSignHex.slice(2)
    : msgToSignHex;

  return new TextEncoder().encode(hexWithoutPrefix);
};

// Internal helper to normalize Solana signMessage results into a hex string
const signWithSolanaProvider = async (
  messageBytes: Uint8Array,
  provider: any,
): Promise<string> => {
  if (!provider) throw new Error("Wallet not connected");

  let result: any;
  try {
    result = await provider.signMessage?.(messageBytes);
  } catch {
    result = await provider.signMessage?.(messageBytes, "utf8");
  }

  if (!result) {
    throw new Error("Solana provider.signMessage is not available");
  }

  const toHex = (bytes: Uint8Array): string =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  if (typeof result === "string") {
    if (result.startsWith("0x") || result.startsWith("0X")) return result;
    throw new Error("Solana signMessage returned a non-hex string");
  }
  if (result instanceof Uint8Array) {
    return "0x" + toHex(result);
  }
  if (result && result.signature instanceof Uint8Array) {
    return "0x" + toHex(result.signature);
  }
  if (Array.isArray(result)) {
    return "0x" + toHex(Uint8Array.from(result));
  }

  throw new Error("Unsupported signMessage result for Solana provider");
};

// Sign the AddOrderlyKey message using a Solana wallet's signMessage
export const signOrderlyKeySolana = async (
  message: AddKeyMessage,
  provider: any,
): Promise<string> => {
  const messageBytes = buildSolanaAddOrderlyKeySignBytes(message);
  return signWithSolanaProvider(messageBytes, provider);
};

// Sign an arbitrary text message using a Solana wallet's signMessage
export const signSolanaMessage = async (
  messageText: string,
  provider: any,
): Promise<string> => {
  const messageBytes = new TextEncoder().encode(messageText);
  return signWithSolanaProvider(messageBytes, provider);
};
