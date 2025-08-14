import { ethers } from "ethers";
import {
  DefaultSolanaWalletAdapter,
  SolanaWalletProvider,
} from "@orderly.network/default-solana-adapter";
import { WalletState } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { isSolana } from "@orderly.network/utils";

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

async function getSolanaBlockTime(
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

const blockCount = 5;

async function getEvmBlockTime(chain: API.Chain) {
  const provider = new ethers.JsonRpcProvider(
    chain.network_infos.public_rpc_url,
  );

  const latest = await provider.getBlockNumber();

  const blocks = await Promise.all(
    Array.from({ length: blockCount }, (_, i) => provider.getBlock(latest - i)),
  );

  const timestamps = blocks
    .filter((b) => !!b?.timestamp)
    .map((b) => b!.timestamp);

  if (timestamps.length < 2) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    const diff = timestamps[i] - timestamps[i + 1];
    sum += diff;
  }

  return sum / (timestamps.length - 1);
}
