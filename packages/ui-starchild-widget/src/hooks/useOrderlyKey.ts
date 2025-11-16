import { useState } from "react";
import type { AddKeyMessage } from "./types";
import {
  normalizeSignatureV,
  ethereumPersonalMessageHash,
  utf8ToHex,
} from "./utils";

export function useOrderlyKey(
  baseUrl: string,
  brokerId: string,
  getAuthHeader: (address: string, provider: any) => Promise<string>,
) {
  const [didRegisterOrderlyKey, setDidRegisterOrderlyKey] = useState(false);
  const [didVerifyOrderlyKey, setDidVerifyOrderlyKey] = useState(false);

  const getTemporaryOrderlyKey = async (
    walletAddress: string,
    provider: any,
  ): Promise<{
    orderlyKey: string;
    privateKey: string;
  }> => {
    if (!walletAddress || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(walletAddress, provider);

    const resp = await fetch(`${baseUrl}v1/private/temporary/orderlyKey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({}),
    });
    if (!resp.ok)
      throw new Error(`temporary orderlyKey request failed: ${resp.status}`);
    const json = await resp.json();
    if (!json?.orderlyKey || !json?.privateKey)
      throw new Error("temporary orderlyKey response missing fields");
    return {
      orderlyKey: json.orderlyKey,
      privateKey: json.privateKey,
    };
  };

  // Build EIP-712 typed data for AddOrderlyKey (parity with Go getOrderlyKeyEIP712Data)
  const getOrderlyKeyEIP712Data = (
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

  // Sign the AddOrderlyKey EIP-712 typed data using the connected wallet
  const signOrderlyKeyEIP712 = async (
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

  // Register orderly key with local service (signature left blank)
  const registerOrderlyKey = async (
    orderlyKey: string,
    walletAddress: string,
    provider: any,
    opts?: {
      userAddress?: string;
      scope?: string;
      brokerId?: string;
      chainId?: number;
      chainType?: "EVM" | "SOLANA";
      timestamp?: number;
      expiration?: number;
    },
  ): Promise<any> => {
    const now = Date.now();
    const payload = {
      message: {
        brokerId: opts?.brokerId ?? brokerId,
        chainId: opts?.chainId ?? 8453,
        chainType: opts?.chainType ?? "EVM",
        orderlyKey,
        scope: opts?.scope ?? "read",
        timestamp: opts?.timestamp ?? now,
        expiration: opts?.expiration ?? now + 24 * 60 * 60,
        tag: "orderlykey",
      },
      signature: "",
      userAddress: opts?.userAddress ?? (walletAddress || ""),
    };

    // Compute EIP-712 signature
    (payload as any).signature = await signOrderlyKeyEIP712(
      {
        brokerId: payload.message.brokerId,
        chainId: payload.message.chainId,
        orderlyKey: payload.message.orderlyKey,
        scope: payload.message.scope,
        timestamp: payload.message.timestamp,
        expiration: payload.message.expiration,
      },
      Number(payload.message.chainId),
      walletAddress,
      provider,
    );

    if (!walletAddress || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(walletAddress, provider);

    const resp = await fetch(`${baseUrl}v1/private/registerOrderlyKey`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}
    if (!resp.ok)
      throw new Error(`registerOrderlyKey failed: ${resp.status} ${text}`);
    // Signal effect to update cache centrally
    setDidRegisterOrderlyKey(true);
    return json ?? text;
  };

  // Verify orderly key - signs and verifies with the same format as authToken
  const verifyOrderlyKey = async (
    walletAddress: string,
    provider: any,
  ): Promise<any> => {
    if (!walletAddress || !provider) throw new Error("Wallet not connected");

    const timestamp = Date.now();
    const messageText = `EVM:${timestamp}`;
    const hash = ethereumPersonalMessageHash(messageText);

    let signatureHex = "" as string;
    try {
      signatureHex = await provider?.request?.({
        method: "eth_sign",
        params: [walletAddress, hash],
      });
    } catch (e) {
      try {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [utf8ToHex(messageText), walletAddress],
        });
      } catch (e2) {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [walletAddress, utf8ToHex(messageText)],
        });
      }
    }

    const normalizedSignature = normalizeSignatureV(signatureHex);

    const requestBody = {
      message: { chainType: "EVM", timestamp },
      signature: normalizedSignature,
      userAddress: walletAddress,
    };

    const authHeader = await getAuthHeader(walletAddress, provider);

    const resp = await fetch(`${baseUrl}v1/private/verifyOrderlyKey`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!resp.ok)
      throw new Error(`VerifyOrderlyKey request failed: ${resp.status}`);

    const responseText = await resp.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {}
    console.log("VerifyOrderlyKey response:", responseJson ?? responseText);

    // Signal effect to update cache and check account info
    setDidVerifyOrderlyKey(true);

    return responseJson ?? responseText;
  };

  return {
    getTemporaryOrderlyKey,
    getOrderlyKeyEIP712Data,
    registerOrderlyKey,
    verifyOrderlyKey,
    didRegisterOrderlyKey,
    didVerifyOrderlyKey,
    setDidRegisterOrderlyKey,
    setDidVerifyOrderlyKey,
  };
}
