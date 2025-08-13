import { readContract } from "@wagmi/core";
import { API } from "@orderly.network/types";
import getAppUlnConfigAbi from "./abi/getAppUlnConfigAbi.json";
import { CHAIN_ID_TO_ENDPOINT_ID } from "./chainIdToEndpointId";
import { getWagmiConfig } from "./getConfig";

/**
 * no need to distinguish between EVM and SOL
 */
export async function getChainConfirmations(chain: API.Chain) {
  const chainId = chain.network_infos.chain_id;
  const isMainnet = chain.network_infos.mainnet;

  const publicRpcUrl = isMainnet
    ? "https://rpc.orderly.network"
    : "https://testnet-rpc.orderly.org";

  const config = getWagmiConfig(chainId, {
    ...chain,
    network_infos: {
      ...chain.network_infos,
      public_rpc_url: publicRpcUrl,
    },
  });

  // mainnet: https://explorer-orderly-mainnet-0.t.conduit.xyz/address/0xCFf08a35A5f27F306e2DA99ff198dB90f13DEF77?tab=read_write_contract
  // testnet: https://testnet-explorer.orderly.org/address/0x3013C32e5F45E69ceA9baD4d96786704C2aE148c?tab=read_contract#39e3f938
  const contractAddress = isMainnet
    ? "0xCFf08a35A5f27F306e2DA99ff198dB90f13DEF77"
    : "0x3013C32e5F45E69ceA9baD4d96786704C2aE148c";

  const endpointId = CHAIN_ID_TO_ENDPOINT_ID[chainId];

  const address = "0x0000000000000000000000000000000000000000";

  const result: any = await readContract(config, {
    abi: getAppUlnConfigAbi,
    address: contractAddress,
    functionName: "getAppUlnConfig",
    args: [address, endpointId],
  });

  // console.log("getChainConfirmations", chainId, result);

  return Number(result.confirmations || 0);
}
