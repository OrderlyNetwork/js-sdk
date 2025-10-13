import { ethers } from "ethers";
import { API } from "@kodiak-finance/orderly-types";
import getAppUlnConfigAbi from "./abi/getAppUlnConfigAbi.json";
import { getEndpointId } from "./endpointId";

/**
 * no need to distinguish between EVM and SOL
 */
export async function getChainConfirmations(chain: API.Chain) {
  const chainId = chain.network_infos.chain_id;
  const isMainnet = chain.network_infos.mainnet;

  const publicRpcUrl = isMainnet
    ? "https://rpc.orderly.network"
    : "https://testnet-rpc.orderly.org";

  // mainnet: https://explorer-orderly-mainnet-0.t.conduit.xyz/address/0xCFf08a35A5f27F306e2DA99ff198dB90f13DEF77?tab=read_write_contract
  // testnet: https://testnet-explorer.orderly.org/address/0x3013C32e5F45E69ceA9baD4d96786704C2aE148c?tab=read_contract#39e3f938
  const contractAddress = isMainnet
    ? "0xCFf08a35A5f27F306e2DA99ff198dB90f13DEF77"
    : "0x3013C32e5F45E69ceA9baD4d96786704C2aE148c";

  const endpointId = getEndpointId(chainId);

  const address = "0x0000000000000000000000000000000000000000";

  const provider = new ethers.JsonRpcProvider(publicRpcUrl);

  const contract = new ethers.Contract(
    contractAddress,
    // full abi: https://explorer-orderly-mainnet-0.t.conduit.xyz/address/0xCFf08a35A5f27F306e2DA99ff198dB90f13DEF77?tab=contract_abi
    // this only need to use getAppUlnConfig abi, other functions are not needed
    getAppUlnConfigAbi,
    provider,
  );

  const result = await contract.getAppUlnConfig(address, endpointId);

  // console.log("getChainConfirmations", chainId, result);

  return Number(result.confirmations || 0);
}
