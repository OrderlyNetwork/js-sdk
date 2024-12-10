export enum AccountStatusEnum {
  NotConnected = 0,
  Connected = 1,
  NotSignedIn = 2,
  SignedIn = 3,
  DisabledTrading = 4,
  EnableTrading = 5,
}

export enum SystemStateEnum {
  Loading = 0,
  Error = 1,
  Ready = 10,
}

export enum ExchangeStatusEnum {
  Normal = 0,
  Maintain = 1,
}

export type NetworkId = "testnet" | "mainnet";

export enum NetworkStatusEnum {
  unknown = 0,
  unsupported = 1,
  supported = 2,
}

// Testnet
// Arbitrum Goerli
// export const ARBITRUM_TESTNET_CHAINID = 421613;
// export const ARBITRUM_TESTNET_CHAINID_HEX = "0x66EED";

// Arbitrum Sepolia
export const ARBITRUM_TESTNET_CHAINID = 421614;
export const SOLANA_TESTNET_CHAINID = 901901901;
export const STORY_TESTNET_CHAINID = 1516;
export const ARBITRUM_TESTNET_CHAINID_HEX = "0x66EEE";

export const MANTLE_TESTNET_CHAINID = 5003;
export const MANTLE_TESTNET_CHAINID_HEX = "0x138b";

// Mainnet
export const ARBITRUM_MAINNET_CHAINID = 42161;
export const ARBITRUM_MAINNET_CHAINID_HEX = "0xa4b1";

export const MEDIA_TABLET = "(max-width: 768px)";

export const DEPOSIT_FEE_RATE = 1.05;

/**
 *  A constant for the maximum value for a ``uint256``.
 */
export const MaxUint256: bigint = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

export const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const isNativeTokenChecker = (address: string) =>
  address === nativeTokenAddress;
