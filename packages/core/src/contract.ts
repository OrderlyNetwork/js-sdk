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
    let verifyContractAddress = stagingVerifyAddressOnArbitrumTestnet;

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

    let solanaVaultAddress =solanaStagingVualtAddress;
    if (env === 'qa') {
      solanaVaultAddress = solanaQaVaultAddress;
      verifyContractAddress = '0x50F59504D3623Ad99302835da367676d1f7E3D44';
    }

    return {
      usdcAddress: nativeUSDCAddress,
      usdcAbi: stagingUSDCAbiOnArbitrumTestnet,
      vaultAddress: stagingVaultAddressOnArbitrumTestnet,
      solanaVaultAddress: solanaVaultAddress,
      solanaUSDCAddress: solanaUSDCAddress,
      vaultAbi: stagingVaultAbiOnArbitrumTestnet,
      verifyContractAddress:verifyContractAddress,
      erc20Abi: stagingUSDCAbiOnArbitrumTestnet,
    };
  }
}
