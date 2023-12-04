export const definedTypes: { [key: string]: any } = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  Registration: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "timestamp", type: "uint64" },
    { name: "registrationNonce", type: "uint256" },
  ],
  Withdraw: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "receiver", type: "address" },
    { name: "token", type: "string" },
    { name: "amount", type: "uint256" },
    { name: "withdrawNonce", type: "uint64" },
    { name: "timestamp", type: "uint64" },
  ],
  AddOrderlyKey: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "orderlyKey", type: "string" },
    { name: "scope", type: "string" },
    { name: "timestamp", type: "uint64" },
    { name: "expiration", type: "uint64" },
  ],
  SettlePnl: [
    { name: "brokerId", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "settleNonce", type: "uint64" },
    { name: "timestamp", type: "uint64" },
  ],
};

export const nativeUSDCAddress = "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63";

export const stagingUSDCAddressOnArbitrumTestnet =
  "0x6aAd876244E7A1Ad44Ec4824Ce813729E5B6C291";

export const stagingVaultAddressOnArbitrumTestnet =
  "0xd64AeB281f3E8cd70e668b6cb24De7e532dC214D";
export const stagingVerifyAddressOnArbitrumTestnet =
  "0x1826B75e2ef249173FC735149AE4B8e9ea10abff";

export const mainnetUSDCAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const mainnetVaultAddress = "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9";
export const mainnetVerifyAddress =
  "0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203";
