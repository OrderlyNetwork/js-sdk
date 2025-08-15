import {
  DefaultSolanaWalletAdapter,
  SolanaWalletProvider,
} from "@orderly.network/default-solana-adapter";
import { WalletState } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

export async function getSolanaBlockTime(
  chain: API.Chain,
  wallet: WalletState | null,
) {
  if (!wallet) {
    return 0;
  }

  const walletAdapter = new DefaultSolanaWalletAdapter();

  walletAdapter.active({
    address: wallet.accounts[0].address,
    chain: { id: chain.network_infos.chain_id },
    provider: wallet.provider as SolanaWalletProvider,
  });

  // console.log("walletAdapter", walletAdapter);

  // The Solana RPC node keeps a history of performance samples, typically for a few hours.
  // A limit of 60 samples gives us a good average over the last hour or so.
  const samples =
    await walletAdapter.connection.getRecentPerformanceSamples(60);

  let totalBlockTime = 0;
  let validSamples = 0;

  for (const sample of samples) {
    if (sample.numSlots > 0 && sample.samplePeriodSecs > 0) {
      const blockTime = sample.samplePeriodSecs / sample.numSlots;
      totalBlockTime += blockTime;
      validSamples++;
    }
  }

  return totalBlockTime / validSamples;
}
