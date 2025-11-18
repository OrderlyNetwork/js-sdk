import { useRef } from "react";
import { LS_AUTH_KEY } from "./constants";
import type { AuthTokenData } from "./types";
import { bytesToBase58, safeParse } from "./utils";

export function useSolAuth(baseUrl: string, brokerId: string) {
  const tokenRequestInFlightRef = useRef<Map<string, Promise<AuthTokenData>>>(
    new Map(),
  );

  const requestSolAuthToken = async (
    address: string,
    provider: any,
  ): Promise<AuthTokenData> => {
    if (!address) throw new Error("Solana address is required");
    if (!provider) throw new Error("Solana provider is required");

    const timestamp = Date.now();
    const messageText = `SOLANA:${timestamp}`;
    const messageBytes = new TextEncoder().encode(messageText);

    let signatureBase58 = "" as string;

    try {
      const result = await provider.signMessage?.(messageBytes, "utf8");

      if (typeof result === "string") {
        signatureBase58 = result;
      } else if (result instanceof Uint8Array) {
        signatureBase58 = bytesToBase58(result);
      } else if (result && result.signature instanceof Uint8Array) {
        signatureBase58 = bytesToBase58(result.signature);
      } else if (Array.isArray(result)) {
        signatureBase58 = bytesToBase58(Uint8Array.from(result));
      } else {
        throw new Error("Unsupported signMessage result for Solana provider");
      }
    } catch (e) {
      console.error("Failed to sign SOLANA auth message:", e);
      throw e;
    }

    const requestBody = {
      message: { chainType: "SOLANA", timestamp },
      signature: signatureBase58,
      userAddress: address,
      userSource: brokerId,
    };

    const resp = await fetch(`${baseUrl}v1/authToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!resp.ok) throw new Error(`AuthToken request failed: ${resp.status}`);

    const responseText = await resp.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {}
    console.log("SOLANA AuthToken response:", responseJson ?? responseText);
    const token =
      typeof responseJson?.token === "string" ? responseJson.token : null;
    if (!token) throw new Error("AuthToken not found in response");

    return { token, timestamp };
  };

  const getSolAuthToken = async (
    address: string,
    provider: any,
  ): Promise<AuthTokenData> => {
    const inFlight = tokenRequestInFlightRef.current.get(address);
    if (inFlight) return inFlight;

    const promise = (async () => {
      const savedStr = localStorage.getItem(LS_AUTH_KEY);
      const saved = savedStr ? safeParse(savedStr) : null;
      if (
        saved &&
        saved.address === address &&
        typeof saved.token === "string" &&
        saved.token
      ) {
        return {
          token: saved.token as string,
          timestamp: saved.timestamp as number,
        };
      }
      console.log("no saved SOLANA auth token, requesting from server");
      const res = await requestSolAuthToken(address, provider);
      try {
        const next = {
          address,
          timestamp: res.timestamp,
          token: res.token,
          bound: saved?.bound ?? false,
        };
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(next));
      } catch {}
      return res;
    })();

    tokenRequestInFlightRef.current.set(address, promise);
    try {
      return await promise;
    } finally {
      tokenRequestInFlightRef.current.delete(address);
    }
  };

  const getAuthHeader = async (
    address: string,
    provider: any,
  ): Promise<string> => {
    const { token } = await getSolAuthToken(address, provider);
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  return {
    getSolAuthToken,
    getAuthHeader,
  };
}
