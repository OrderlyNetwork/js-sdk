/**
 * Onramper widget URL signing utilities.
 *
 * Per https://docs.onramper.com/docs/signing-widget-url.md the `wallets`,
 * `networkWallets` and `walletAddressTags` parameters must be HMAC-SHA256
 * signed and the resulting hex digest appended as a `signature` query param.
 *
 * Uses ethers.js `computeHmac` (already a project dependency) for synchronous
 * HMAC-SHA256 — no extra deps needed.
 */
import { computeHmac } from "ethers";

/**
 * Sort the sensitive-param string alphabetically at both the top-level key
 * level and the nested `key:value` level, as required by the Onramper spec.
 *
 * Input example:
 *   "wallets=eth:0xABC,btc:0xDEF&networkWallets=ethereum:0x1,bitcoin:0x2"
 *
 * Output:
 *   "networkWallets=bitcoin:0x2,ethereum:0x1&wallets=btc:0xDEF,eth:0xABC"
 */
export function arrangeStringAlphabetically(inputString: string): string {
  const inputObject: Record<string, Record<string, string>> = {};

  inputString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    const nestedPairs = value.split(",");
    inputObject[key] = {};
    nestedPairs.forEach((nestedPair) => {
      const [nestedKey, nestedValue] = nestedPair.split(":");
      inputObject[key][nestedKey] = nestedValue;
    });
  });

  // Sort nested keys alphabetically
  for (const key in inputObject) {
    inputObject[key] = Object.fromEntries(
      Object.entries(inputObject[key]).sort(),
    );
  }

  // Sort top-level keys alphabetically and reconstruct
  const sortedKeys = Object.keys(inputObject).sort();
  const parts: string[] = [];
  for (const key of sortedKeys) {
    const nested = Object.entries(inputObject[key])
      .map(([k, v]) => `${k}:${v}`)
      .join(",");
    parts.push(`${key}=${nested}`);
  }
  return parts.join("&");
}

/**
 * Generate an HMAC-SHA256 signature (hex, without 0x prefix) using ethers.js.
 */
export function generateOnramperSignature(
  secretKey: string,
  data: string,
): string {
  const encoder = new TextEncoder();
  const sig = computeHmac(
    "sha256",
    encoder.encode(secretKey),
    encoder.encode(data),
  );
  // computeHmac returns "0x..." prefixed hex — strip the prefix
  return sig.startsWith("0x") ? sig.slice(2) : sig;
}
