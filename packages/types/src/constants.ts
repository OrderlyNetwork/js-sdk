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

export const ARBITRUM_TESTNET_CHAINID = 421613;
export const ARBITRUM_MAINNET_CHAINID = 42161;
export const ARBITRUM_MAINNET_CHAINID_HEX = "0xa4b1";
export const ARBITRUM_TESTNET_CHAINID_HEX = "0x66EED";

export const MEDIA_TABLET = "(max-width: 768px)";

export const DEPOSIT_FEE_RATE = 1.05;

/**
 *  A constant for the maximum value for a ``uint256``.
 */
export const MaxUint256: bigint = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
