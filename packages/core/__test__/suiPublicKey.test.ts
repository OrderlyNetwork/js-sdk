import { encode as bs58encode } from "bs58";
import {
  SUI_ED25519_SIGNATURE_FLAG,
  SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY,
  assertSupportedSuiPublicKeyScheme,
  getSuiPublicKeyScheme,
  normalizeSuiEd25519PublicKey,
  normalizeSuiPublicKeyToBase58,
  normalizeSuiPublicKeyToBytes,
  normalizeSuiPublicKeyToBytes32Hex,
} from "../src";

describe("suiPublicKey", () => {
  const rawBytes = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
  const rawHex = `0x${Array.from(rawBytes, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("")}`;
  const base58 = bs58encode(rawBytes);

  test("normalizes Ed25519 raw bytes and hex to API-facing formats", () => {
    expect(normalizeSuiPublicKeyToBase58(rawHex)).toBe(base58);
    expect(normalizeSuiPublicKeyToBytes32Hex(base58)).toBe(rawHex);
  });

  test("accepts Sui scheme-prefixed Ed25519 public key bytes", () => {
    const suiBytes = Uint8Array.from([SUI_ED25519_SIGNATURE_FLAG, ...rawBytes]);

    expect(normalizeSuiEd25519PublicKey(suiBytes)).toEqual({
      publicKey: base58,
      rawPublicKey: rawHex,
      rawPublicKeyBytes: rawBytes,
      publicKeyScheme: SUI_ED25519_SIGNATURE_FLAG,
    });
  });

  test("rejects unsupported scheme-prefixed public keys", () => {
    const secp256k1LikeBytes = Uint8Array.from([0x01, ...rawBytes]);

    expect(normalizeSuiEd25519PublicKey(secp256k1LikeBytes)).toBeUndefined();
    expect(getSuiPublicKeyScheme(secp256k1LikeBytes)).toBe(0x01);
    expect(() => assertSupportedSuiPublicKeyScheme(0x01)).toThrow(
      SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR_KEY,
    );
  });

  test("returns raw public key bytes", () => {
    expect(normalizeSuiPublicKeyToBytes(base58)).toEqual(rawBytes);
  });
});
