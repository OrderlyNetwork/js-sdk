import { WalletState } from "@kodiak-finance/orderly-hooks";
import { API } from "@kodiak-finance/orderly-types";
import { isSolana } from "@kodiak-finance/orderly-utils";
import { getEvmBlockTime } from "./getEvmBlockTime";
import { getSolanaBlockTime } from "./getSolanaBlockTime";

// https://tokenterminal.com/explorer/metrics/block-time
export async function getBlockTime(inputs: {
  chainId: number;
  chain: API.Chain;
  wallet: WalletState | null;
}) {
  const { chainId, chain, wallet } = inputs;
  if (isSolana(chainId)) {
    return getSolanaBlockTime(chain, wallet);
  }
  return getEvmBlockTime(chain);
}
