import { ConfigStore } from "./configStore";
import {
  devUSDCAddressOnArbitrumTestnet,
  devVaultAddressOnArbitrumTestnet,
  devVerifyAddressOnArbitrumTestnet,
} from "./constants";

export type OrderlyContracts = {
  usdcAddress: string;
  usdcAbi: any;
  vaultAddress: string;
  vaultAbi: any;
  verifyContractAddress: string;
};

export interface IContract {
  getContractInfoByEnv(): any;
}

export class BaseContract implements IContract {
  constructor(private readonly configStore: ConfigStore) {}
  getContractInfoByEnv() {
    return {
      usdcAddress: devUSDCAddressOnArbitrumTestnet,
      // usdcAbi: devUSDCAbiOnArbitrumTestnet,
      vaultAddress: devVaultAddressOnArbitrumTestnet,
      // vaultAbi: devVaultAbiOnArbitrumTestnet,
      verifyContractAddress: devVerifyAddressOnArbitrumTestnet,
    };
  }
}
