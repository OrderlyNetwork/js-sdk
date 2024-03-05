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

import mainnetUSDCAbi from "./wallet/abis/mainnetUSDCAbi.json";
import mainnetVaultAbi from "./wallet/abis/mainnetVaultAbi.json";

import stagingUSDCAbiOnArbitrumTestnet from "./wallet/abis/stagingUSDCAbi.json";
import stagingVaultAbiOnArbitrumTestnet from "./wallet/abis/stagingVaultAbi.json";

/**
 * Orderly contracts information
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
    const networkId = this.configStore.get("networkId");

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
