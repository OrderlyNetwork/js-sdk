// export const definedTypes = {
//   EIP712Domain: [
//     { name: "name", type: "string" },
//     { name: "version", type: "string" },
//     { name: "chainId", type: "uint256" },
//     { name: "verifyingContract", type: "address" },
//   ],
//   Registration: [
//     { name: "brokerId", type: "string" },
//     { name: "chainId", type: "uint256" },
//     { name: "timestamp", type: "uint64" },
//     { name: "registrationNonce", type: "uint256" },
//   ],
//   Withdraw: [
//     { name: "brokerId", type: "string" },
//     { name: "chainId", type: "uint256" },
//     { name: "receiver", type: "address" },
//     { name: "token", type: "string" },
//     { name: "amount", type: "uint256" },
//     { name: "withdrawNonce", type: "uint64" },
//     { name: "timestamp", type: "uint64" },
//   ],
//   AddOrderlyKey: [
//     { name: "brokerId", type: "string" },
//     { name: "chainId", type: "uint256" },
//     { name: "orderlyKey", type: "string" },
//     { name: "scope", type: "string" },
//     { name: "timestamp", type: "uint64" },
//     { name: "expiration", type: "uint64" },
//   ],
//   SettlePnl: [
//     { name: "brokerId", type: "string" },
//     { name: "chainId", type: "uint256" },
//     { name: "settleNonce", type: "uint64" },
//     { name: "timestamp", type: "uint64" },
//   ],
// } as const;

export const nativeUSDCAddress = "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63";

export const stagingUSDCAddressOnArbitrumTestnet =
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

export const stagingVaultAddressOnArbitrumTestnet =
  "0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f";
export const stagingVerifyAddressOnArbitrumTestnet =
  "0x1826B75e2ef249173FC735149AE4B8e9ea10abff";

export const mainnetUSDCAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const mainnetVaultAddress = "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9";
export const mainnetVerifyAddress =
  "0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203";
