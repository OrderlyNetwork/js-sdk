import { TESTNET_WHITE_CHAINS } from "@orderly.network/hooks";
import { ADI_TESTNET_CHAINID } from "@orderly.network/types";

export const chainFilter = {
  testnet: [...TESTNET_WHITE_CHAINS, { id: ADI_TESTNET_CHAINID }],
};
