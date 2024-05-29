import { BaseContractManager, ConfigStore } from "@orderly.network/core";
import { useWalletConnector } from "@orderly.network/hooks";

const USDCAddress = {
  ArbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  MantleSepolia: "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080",
};

// Ledger
const VerifyContractAddressSepolia = {
  dev: "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e",
  qa: "0x50F59504D3623Ad99302835da367676d1f7E3D44",
};

const ArbitrumSepolia = {
  dev: {
    USDC: USDCAddress.ArbitrumSepolia,
    verifyContractAddress: VerifyContractAddressSepolia.dev,
    vaultAddress: "0x3ac2ba11ca2f9f109d50fb1a46d4c23fcadbbef6",
  },
  qa: {
    USDC: USDCAddress.ArbitrumSepolia,
    verifyContractAddress: VerifyContractAddressSepolia.qa,
    vaultAddress: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1",
  },
};

const MantleSepolia = {
  dev: {
    USDC: USDCAddress.MantleSepolia,
    verifyContractAddress: VerifyContractAddressSepolia.dev,
    vaultAddress: "0x3CAA46F94610BDa1C60267a364d2E154E677BdF9",
  },
  qa: {
    USDC: USDCAddress.MantleSepolia,
    verifyContractAddress: VerifyContractAddressSepolia.qa,
    vaultAddress: "0x08a17582C4cCe303C37439341c6E6138Fb62304d",
  },
};

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
      vaultAddress = MantleSepolia.dev.vaultAddress;
      verifyContractAddress = MantleSepolia.dev.verifyContractAddress;
    } else if (env === "qa") {
      vaultAddress = MantleSepolia.qa.vaultAddress;
      verifyContractAddress = MantleSepolia.qa.verifyContractAddress;
    }

    return {
      ...contracts,
      vaultAddress,
      verifyContractAddress,
    };
  }
}
