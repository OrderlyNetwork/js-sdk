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

export const devUSDCAddressOnArbitrumTestnet =
  "0x004d88aa993fd2100d6c8beb6cdb6bc04f565b44";

export const devVaultAddressOnArbitrumTestnet =
  "0x0C554dDb6a9010Ed1FD7e50d92559A06655dA482";
export const devVerifyAddressOnArbitrumTestnet =
  "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e";
