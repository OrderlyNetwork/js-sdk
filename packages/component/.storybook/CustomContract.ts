import { BaseContractManager } from "@orderly.network/core";

export const devVaultAddressOnArbitrumTestnet =
  "0x3ac2ba11ca2f9f109d50fb1a46d4c23fcadbbef6";

export const qaVaultAddressOnArbitrumTestnet =
  "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1";

export const devVerifyContractAddress =
  "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e";

export const qaVerifyContractAddress =
  "0x50F59504D3623Ad99302835da367676d1f7E3D44";

export class CustomContractManager extends BaseContractManager {
  constructor(props) {
    super(props);
  }

  getContractInfoByEnv() {
    const contracts = super.getContractInfoByEnv();

    // @ts-ignore
    const env = this.configStore?.get("env");

    let verifyContractAddress = contracts.verifyContractAddress;

    let vaultAddress = contracts.vaultAddress;

    if (env === "dev") {
      vaultAddress = devVaultAddressOnArbitrumTestnet;
    } else if (env === "qa") {
      vaultAddress = qaVaultAddressOnArbitrumTestnet;
      verifyContractAddress = qaVerifyContractAddress;
    }

    return {
      ...contracts,
      // vaultAddress,
      verifyContractAddress,
    };
  }
}
