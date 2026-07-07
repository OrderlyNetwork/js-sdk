import { ChainNamespace, getChainNamespaceByChainId } from "../src/chains";

describe("getChainNamespaceByChainId", () => {
  it("resolves decimal number and string chain ids", () => {
    expect(getChainNamespaceByChainId(904904904)).toBe(ChainNamespace.sui);
    expect(getChainNamespaceByChainId("904904904")).toBe(ChainNamespace.sui);
    expect(getChainNamespaceByChainId(901901901)).toBe(ChainNamespace.solana);
    expect(getChainNamespaceByChainId("901901901")).toBe(ChainNamespace.solana);
  });

  it("resolves hex EVM chain ids as EVM", () => {
    expect(getChainNamespaceByChainId("0x66EEE")).toBe(ChainNamespace.evm);
    expect(getChainNamespaceByChainId("0xa4b1")).toBe(ChainNamespace.evm);
  });

  it("returns undefined for invalid chain ids", () => {
    expect(getChainNamespaceByChainId()).toBeUndefined();
    expect(getChainNamespaceByChainId("")).toBeUndefined();
    expect(getChainNamespaceByChainId("not-a-chain")).toBeUndefined();
    expect(getChainNamespaceByChainId(Number.NaN)).toBeUndefined();
  });
});
