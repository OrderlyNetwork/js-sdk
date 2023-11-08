import { ConfigStore } from "./configStore/configStore";
import {
  stagingUSDCAddressOnArbitrumTestnet,
  stagingVaultAddressOnArbitrumTestnet,
  stagingVerifyAddressOnArbitrumTestnet,
} from "./constants";

import stagingUSDCAbiOnArbitrumTestnet from "./wallet/abis/stagingUSDCAbi.json";
import stagingVaultAbiOnArbitrumTestnet from "./wallet/abis/stagingVaultAbi.json";

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

export class BaseContract implements IContract {
  constructor(private readonly configStore: ConfigStore) {}
  getContractInfoByEnv() {
    return {
      usdcAddress: stagingUSDCAddressOnArbitrumTestnet,
      usdcAbi: stagingUSDCAbiOnArbitrumTestnet,
      vaultAddress: stagingVaultAddressOnArbitrumTestnet,
      vaultAbi: stagingVaultAbiOnArbitrumTestnet,
      verifyContractAddress: stagingVerifyAddressOnArbitrumTestnet,
      erc20Abi: stagingUSDCAbiOnArbitrumTestnet,
    };
  }
}
