import { describe, expect, it } from "vitest";
import { ChainNamespace } from "@orderly.network/types";
import {
  getAccountLookupIdentities,
  getWalletLookupNetworkByNamespace,
  getWalletLookupNetworkLabel,
  normalizeExternalWalletAddress,
  normalizeSuiWithdrawAddress,
  validateAccountLookupIdentity,
  validateExternalWalletAddress,
} from "../walletIdentity";

const EVM_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const SOL_PUBLIC_KEY = "11111111111111111111111111111111";
const SUI_PUBLIC_KEY_HEX =
  "0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";

describe("walletIdentity", () => {
  it("maps chain namespaces to wallet lookup networks", () => {
    expect(getWalletLookupNetworkByNamespace(ChainNamespace.evm)).toBe("EVM");
    expect(getWalletLookupNetworkByNamespace(ChainNamespace.solana)).toBe(
      "SOL",
    );
    expect(getWalletLookupNetworkByNamespace(ChainNamespace.sui)).toBe("SUI");
    expect(getWalletLookupNetworkByNamespace("solana")).toBe("SOL");
    expect(getWalletLookupNetworkByNamespace("sui")).toBe("SUI");
    expect(getWalletLookupNetworkByNamespace("unknown")).toBeUndefined();
  });

  it("formats wallet lookup network labels", () => {
    expect(getWalletLookupNetworkLabel("EVM")).toBe("EVM");
    expect(getWalletLookupNetworkLabel("SOL")).toBe("Solana");
    expect(getWalletLookupNetworkLabel("SUI")).toBe("Sui");
    expect(getWalletLookupNetworkLabel()).toBe("");
  });

  it("normalizes Sui withdraw addresses to 32-byte hex", () => {
    expect(normalizeSuiWithdrawAddress("0xabc")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000abc",
    );
    expect(normalizeSuiWithdrawAddress("ABC")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000abc",
    );
    expect(normalizeSuiWithdrawAddress("g123")).toBeUndefined();
    expect(normalizeSuiWithdrawAddress("1".repeat(65))).toBeUndefined();
  });

  it("normalizes external wallet addresses by target network", () => {
    expect(normalizeExternalWalletAddress(" 0xabc ", "SUI")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000abc",
    );
    expect(normalizeExternalWalletAddress(` ${EVM_ADDRESS} `, "EVM")).toBe(
      EVM_ADDRESS,
    );
    expect(normalizeExternalWalletAddress("   ", "EVM")).toBeUndefined();
  });

  it("validates external wallet addresses against the preferred network", () => {
    expect(validateExternalWalletAddress(EVM_ADDRESS, "EVM")).toEqual({
      valid: true,
      network: "EVM",
    });
    expect(validateExternalWalletAddress(SOL_PUBLIC_KEY, "SOL")).toEqual({
      valid: true,
      network: "SOL",
    });
    expect(validateExternalWalletAddress("0xabc", "SUI")).toEqual({
      valid: true,
      network: "SUI",
    });
    expect(validateExternalWalletAddress("not-a-sui-address", "SUI")).toEqual({
      valid: false,
    });
  });

  it("resolves account lookup identities with preferred network filters", () => {
    expect(getAccountLookupIdentities(EVM_ADDRESS, "EVM")).toEqual([
      { address: EVM_ADDRESS, network: "EVM" },
    ]);
    expect(getAccountLookupIdentities(SOL_PUBLIC_KEY, "SOL")).toEqual([
      { address: SOL_PUBLIC_KEY, network: "SOL" },
    ]);

    const [suiIdentity] = getAccountLookupIdentities(SUI_PUBLIC_KEY_HEX, "SUI");
    expect(suiIdentity?.network).toBe("SUI");
    expect(suiIdentity?.address).toBeTruthy();

    expect(getAccountLookupIdentities(EVM_ADDRESS, "SOL")).toEqual([]);
  });

  it("prefers EVM identity for EVM-shaped addresses without a network filter", () => {
    expect(getAccountLookupIdentities(EVM_ADDRESS)).toEqual([
      { address: EVM_ADDRESS, network: "EVM" },
    ]);
  });

  it("returns every matching non-EVM identity when network is ambiguous", () => {
    expect(getAccountLookupIdentities(SOL_PUBLIC_KEY)).toEqual([
      { address: SOL_PUBLIC_KEY, network: "SUI" },
      { address: SOL_PUBLIC_KEY, network: "SOL" },
    ]);
    expect(validateAccountLookupIdentity(SOL_PUBLIC_KEY)).toEqual({
      valid: true,
      network: undefined,
    });
  });
});
