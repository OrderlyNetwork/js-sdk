import { ConfigStore } from "./configStore/configStore";
import {
  mainnetUSDCAddress,
  mainnetVaultAddress,
  mainnetVerifyAddress,
  nativeUSDCAddress,
  solanaDevVaultAddress,
  solanaMainnetVaultAddress,
  solanaQaVaultAddress,
  solanaStagingVualtAddress,
  solanaUSDCAddress,
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
  solanaUSDCAddress: string;
  solanaVaultAddress: string;
};

export interface IContract {
  getContractInfoByEnv(): OrderlyContracts;
}

/** @hidden */
export class BaseContract implements IContract {
  constructor(private readonly configStore: ConfigStore) {}

  getContractInfoByEnv() {
    const networkId = this.configStore.get("networkId");
    const env = this.configStore.get("env");

    if (networkId === "mainnet") {
      return {
        usdcAddress: mainnetUSDCAddress,
        usdcAbi: mainnetUSDCAbi,
        vaultAddress: mainnetVaultAddress,
        vaultAbi: mainnetVaultAbi,
        verifyContractAddress: mainnetVerifyAddress,
        erc20Abi: mainnetUSDCAbi,
        solanaUSDCAddress: solanaUSDCAddress,
        solanaVaultAddress: solanaMainnetVaultAddress,
      };
    }

    let solanaVaultAddress = solanaDevVaultAddress;
    if (env === 'qa') {
      solanaVaultAddress = solanaQaVaultAddress;
    } else if (env === 'staging') {
      solanaVaultAddress = solanaStagingVualtAddress;
    }

    return {
      usdcAddress: nativeUSDCAddress,
      usdcAbi: stagingUSDCAbiOnArbitrumTestnet,
      vaultAddress: stagingVaultAddressOnArbitrumTestnet,
      solanaVaultAddress: solanaVaultAddress,
      solanaUSDCAddress: solanaUSDCAddress,
      vaultAbi: stagingVaultAbiOnArbitrumTestnet,
      verifyContractAddress: stagingVerifyAddressOnArbitrumTestnet,
      erc20Abi: stagingUSDCAbiOnArbitrumTestnet,
    };
  }
}
