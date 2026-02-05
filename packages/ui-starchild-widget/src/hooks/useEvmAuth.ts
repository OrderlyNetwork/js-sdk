import { useRef } from "react";
import { BrowserProvider } from "ethers";
import { LS_AUTH_KEY } from "./constants";
import type { AuthTokenData } from "./types";
import {
  ethereumPersonalMessageHash,
  normalizeSignatureV,
  safeParse,
  utf8ToHex,
} from "./utils";

export function useEvmAuth(baseUrl: string, brokerId: string) {
  const tokenRequestInFlightRef = useRef<Map<string, Promise<AuthTokenData>>>(
    new Map(),
  );

  // Request an auth token for EVM wallets
  const requestEvmAuthToken = async (
    address: string,
    provider: any,
  ): Promise<AuthTokenData> => {
    const timestamp = Date.now();
    const messageText = `EVM:${timestamp}`;

    let signatureHex = "" as string;
    try {
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner(address);
      signatureHex = await signer.signMessage(messageText);
    } catch (ethersError) {
      const hash = ethereumPersonalMessageHash(messageText);

      try {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [utf8ToHex(messageText), address],
        });
      } catch (e1) {
        try {
          signatureHex = await provider?.request?.({
            method: "personal_sign",
            params: [address, utf8ToHex(messageText)],
          });
        } catch (e2) {
          try {
            signatureHex = await provider?.request?.({
              method: "eth_sign",
              params: [address, hash],
            });
          } catch (e3) {
            throw new Error(
              `Failed to sign message with provider. Tried: ethers signMessage, personal_sign, and eth_sign. Last error: ${e3 instanceof Error ? e3.message : String(e3)}`,
            );
          }
        }
      }
    }

    const normalizedSignature = normalizeSignatureV(signatureHex);

    const requestBody = {
      message: { chainType: "EVM", timestamp },
      signature: normalizedSignature,
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
    console.log("AuthToken response:", responseJson ?? responseText);
    const token =
      typeof responseJson?.token === "string" ? responseJson.token : null;
    if (!token) throw new Error("AuthToken not found in response");

    return { token, timestamp };
  };

  // Return existing token for address from localStorage if present; otherwise request and persist.
  const getEvmAuthToken = async (
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
      console.log("no saved auth token, requesting from server");
      const res = await requestEvmAuthToken(address, provider);
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

  // Build Authorization header for the connected EVM address
  const getAuthHeader = async (
    address: string,
    provider: any,
  ): Promise<string> => {
    const { token } = await getEvmAuthToken(address, provider);
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  return {
    getEvmAuthToken,
    getAuthHeader,
  };
}
