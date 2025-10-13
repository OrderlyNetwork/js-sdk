import { ethers } from "ethers";
import type { API } from "@kodiak-finance/orderly-types";

const blockCount = 5;

export async function getEvmBlockTime(chain: API.Chain) {
  const provider = new ethers.JsonRpcProvider(
    chain.network_infos.public_rpc_url,
  );

  const latest = await provider.getBlockNumber();

  const blocks = await Promise.all(
    Array.from({ length: blockCount }, (_, i) => provider.getBlock(latest - i)),
  );

  const timestamps = blocks
    .filter((b) => b?.timestamp != null)
    .map((b) => Number(b?.timestamp));

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
