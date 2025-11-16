import { keccak256, toUtf8Bytes } from "ethers";

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
