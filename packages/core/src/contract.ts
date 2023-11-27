import { NetworkId } from "@orderly.network/types";
import { ConfigStore } from "./configStore/configStore";
import {
  mainnetUSDCAddress,
  mainnetVaultAddress,
  mainnetVerifyAddress,
  nativeUSDCAddress,
  stagingUSDCAddressOnArbitrumTestnet,
  stagingVaultAddressOnArbitrumTestnet,
  stagingVerifyAddressOnArbitrumTestnet,
} from "./constants";

import stagingUSDCAbiOnArbitrumTestnet from "./wallet/abis/stagingUSDCAbi.json";
import stagingVaultAbiOnArbitrumTestnet from "./wallet/abis/stagingVaultAbi.json";

import mainnetUSDCAbi from "./wallet/abis/mainnetUSDCAbi.json";
import mainnetVaultAbi from "./wallet/abis/mainnetVaultAbi.json";

/**
 * Orderly contracts information
 * https://wootraders.atlassian.net/wiki/spaces/ORDER/pages/343441906/Orderly+V2+Contract+Information+Board
 */
export type OrderlyContracts = {
  usdcAddress: string;
  usdcAbi: any;
  erc20Abi: any;
  vaultAddress: string;
  vaultAbi: any;
  verifyContractAddress: string;
};

export interface IContract {
  getContractInfoByEnv(): OrderlyContracts;
}

/** @hidden */
export class BaseContract implements IContract {
  constructor(private readonly configStore: ConfigStore) {}
  getContractInfoByEnv() {
    const networkId = this.configStore.get<NetworkId>("networkId");
    if (networkId === "mainnet") {
      return {
        usdcAddress: mainnetUSDCAddress,
        usdcAbi: mainnetUSDCAbi,
        vaultAddress: mainnetVaultAddress,
        vaultAbi: mainnetVaultAbi,
        verifyContractAddress: mainnetVerifyAddress,
        erc20Abi: mainnetUSDCAbi,
      };
    }
    return {
      usdcAddress: nativeUSDCAddress,
      usdcAbi: stagingUSDCAbiOnArbitrumTestnet,
      vaultAddress: stagingVaultAddressOnArbitrumTestnet,
      vaultAbi: stagingVaultAbiOnArbitrumTestnet,
      verifyContractAddress: stagingVerifyAddressOnArbitrumTestnet,
      erc20Abi: stagingUSDCAbiOnArbitrumTestnet,
    };
  }
}
