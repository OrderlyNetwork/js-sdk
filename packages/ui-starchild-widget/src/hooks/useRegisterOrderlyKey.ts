import { useState } from "react";
import { signOrderlyKeyEIP712, signOrderlyKeySolana } from "./utils";

export function useRegisterOrderlyKey(
  baseUrl: string,
  brokerId: string,
  getAuthHeader: (address: string, provider: any) => Promise<string>,
) {
  const [didRegisterOrderlyKey, setDidRegisterOrderlyKey] = useState(false);

  const getTemporaryOrderlyKey = async (
    walletAddress: string,
    provider: any,
    opts?: {
      chainType?: "EVM" | "SOLANA";
    },
  ): Promise<{
    orderlyKey: string;
    privateKey: string;
  }> => {
    if (!walletAddress || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(walletAddress, provider);

    const isSolana = opts?.chainType === "SOLANA";

    const endpointPath = isSolana
      ? "v1/private/temporary/solanaOrderlyKey"
      : "v1/private/temporary/orderlyKey";

    const body = isSolana ? { solanaAddress: walletAddress } : {};

    const resp = await fetch(`${baseUrl}${endpointPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
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

    const effectiveChainType = opts?.chainType ?? "EVM";
    const isSolana = effectiveChainType === "SOLANA";

    const endpointPath = isSolana
      ? "v1/private/registerSolanaOrderlyKey"
      : "v1/private/registerOrderlyKey";

    const payload = {
      message: {
        brokerId: opts?.brokerId ?? brokerId,
        chainId: opts?.chainId ?? 8453,
        chainType: isSolana ? "SOL" : "EVM",
        orderlyKey,
        scope: opts?.scope ?? "read,trading",
        timestamp: opts?.timestamp ?? now,
        expiration: opts?.expiration ?? now + 365 * 24 * 60 * 60,
      },
      signature: "",
      userAddress: opts?.userAddress ?? (walletAddress || ""),
    };

    // Compute signature depending on chain type
    if (isSolana) {
      (payload as any).signature = await signOrderlyKeySolana(
        {
          brokerId: payload.message.brokerId,
          chainId: payload.message.chainId,
          orderlyKey: payload.message.orderlyKey,
          scope: payload.message.scope,
          timestamp: payload.message.timestamp,
          expiration: payload.message.expiration,
        },
        provider,
      );
    } else {
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
    }

    if (!walletAddress || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(walletAddress, provider);

    const resp = await fetch(`${baseUrl}${endpointPath}`, {
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
    setDidRegisterOrderlyKey(true);
    return json ?? text;
  };

  return {
    getTemporaryOrderlyKey,
    registerOrderlyKey,
    didRegisterOrderlyKey,
    setDidRegisterOrderlyKey,
  };
}
