import { useState } from "react";
import { BrowserProvider } from "ethers";
import {
  normalizeSignatureV,
  ethereumPersonalMessageHash,
  utf8ToHex,
} from "./utils";

/**
 * Hook responsible only for verifying an orderly key.
 */
export function useVerifyOrderlyKey(
  baseUrl: string,
  getAuthHeader: (address: string, provider: any) => Promise<string>,
) {
  const [didVerifyOrderlyKey, setDidVerifyOrderlyKey] = useState(false);

  // Verify orderly key - signs and verifies with the same format as authToken
  const verifyOrderlyKey = async (
    walletAddress: string,
    provider: any,
    opts?: {
      chainType?: "EVM" | "SOLANA";
    },
  ): Promise<any> => {
    if (!walletAddress || !provider) throw new Error("Wallet not connected");

    const timestamp = Date.now();
    const effectiveChainType = opts?.chainType ?? "EVM";
    const isSolana = effectiveChainType === "SOLANA";

    const messageText = `${isSolana ? "SOL" : "EVM"}:${timestamp}`;

    let signature = "" as string;
    if (isSolana) {
      const messageBytes = new TextEncoder().encode(messageText);
      try {
        const result = await provider.signMessage?.(messageBytes, "utf8");

        const toHex = (bytes: Uint8Array): string =>
          Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        if (typeof result === "string") {
          signature = result;
        } else if (result instanceof Uint8Array) {
          signature = toHex(result);
        } else if (result && result.signature instanceof Uint8Array) {
          signature = toHex(result.signature);
        } else if (Array.isArray(result)) {
          signature = toHex(Uint8Array.from(result));
        } else {
          throw new Error("Unsupported signMessage result for Solana provider");
        }
      } catch (e) {
        console.error("Failed to sign SOL verify message:", e);
        throw e;
      }
    } else {
      try {
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner(walletAddress);
        signature = await signer.signMessage(messageText);
      } catch (ethersError) {
        const hash = ethereumPersonalMessageHash(messageText);

        try {
          signature = await provider?.request?.({
            method: "personal_sign",
            params: [utf8ToHex(messageText), walletAddress],
          });
        } catch (e1) {
          try {
            signature = await provider?.request?.({
              method: "personal_sign",
              params: [walletAddress, utf8ToHex(messageText)],
            });
          } catch (e2) {
            try {
              signature = await provider?.request?.({
                method: "eth_sign",
                params: [walletAddress, hash],
              });
            } catch (e3) {
              throw new Error(
                `Failed to sign message with provider. Tried: ethers signMessage, personal_sign, and eth_sign. Last error: ${e3 instanceof Error ? e3.message : String(e3)}`,
              );
            }
          }
        }
      }
    }

    const normalizedSignature = isSolana
      ? signature
      : normalizeSignatureV(signature);

    const requestBody = {
      message: { chainType: isSolana ? "SOL" : "EVM", timestamp },
      signature: normalizedSignature,
      userAddress: walletAddress,
    };

    const authHeader = await getAuthHeader(walletAddress, provider);

    const endpointPath = isSolana
      ? "v1/private/verifySolanaOrderlyKey"
      : "v1/private/verifyOrderlyKey";

    const resp = await fetch(`${baseUrl}${endpointPath}`, {
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
    verifyOrderlyKey,
    didVerifyOrderlyKey,
    setDidVerifyOrderlyKey,
  };
}
