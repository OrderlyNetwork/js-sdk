import React from "react";
import { useWagmiWallet } from "../providers/wagmiWalletProvider";
import { useSolanaWallet } from "../providers/solanaWalletProvider";
import { WalletCard } from "./walletCard";
import { useWallet } from "../hooks/useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { AddSolanaWallet } from "./addSolanaWallet";
import { AddEvmWallet } from "./addEvmWallet";
import { WalletChainTypeEnum, WalletType } from "../types";
import { useWalletConnectorPrivy } from "../provider";
import { useStorageChain } from "@orderly.network/hooks";
import { StorageChainNotCurrentWalletType } from "./switchNetworkTips";

export function RenderNoPrivyWallet() {
  const { wallet: walletInWagmi, isConnected: isConnectedEvm } =
    useWagmiWallet();
  const { wallet: walletInSolana, isConnected: isConnectedSolana } =
    useSolanaWallet();
  const { namespace, switchWallet } = useWallet();
  console.log("xxxx RenderNoPrivyWallet", {
    walletInWagmi,
    walletInSolana,
    isConnectedEvm,
    isConnectedSolana,
  });
  const { walletChainType, connectorWalletType } = useWalletConnectorPrivy();
  if (walletChainType === WalletChainTypeEnum.EVM_SOL) {
    if (isConnectedEvm && isConnectedSolana) {
      return (
        <div className="oui-flex oui-flex-col oui-gap-5">
          <WalletCard
            type={WalletType.EVM}
            address={walletInWagmi?.accounts[0].address}
            isActive={namespace === ChainNamespace.evm}
            onActiveChange={() => {
              switchWallet(ChainNamespace.evm);
            }}
            isPrivy={false}
            isBoth={true}
          />
          <WalletCard
            type={WalletType.SOL}
            address={walletInSolana?.accounts[0].address}
            isActive={namespace === ChainNamespace.solana}
            onActiveChange={() => {
              switchWallet(ChainNamespace.solana);
            }}
            isPrivy={false}
            isBoth={true}
          />
        </div>
      );
    }

    if (isConnectedEvm && !isConnectedSolana) {
      return (
        <div className="">
          <StorageChainNotCurrentWalletType
            currentWalletChainType={ChainNamespace.evm}
          />
          <WalletCard
            type={WalletType.EVM}
            address={walletInWagmi?.accounts[0].address}
            isActive={namespace === ChainNamespace.evm}
            onActiveChange={() => {
              switchWallet(ChainNamespace.evm);
            }}
            isPrivy={false}
            isBoth={false}
          />
          {!connectorWalletType.disableSolana && (
            <>
              <div className="oui-h-[1px] oui-bg-line oui-my-5" />
              <AddSolanaWallet />
            </>
          )}
        </div>
      );
    }
    if (!isConnectedEvm && isConnectedSolana) {
      return (
        <div className="">
          <StorageChainNotCurrentWalletType
            currentWalletChainType={ChainNamespace.solana}
          />
          <WalletCard
            type={WalletType.SOL}
            address={walletInSolana?.accounts[0].address}
            isActive={namespace === ChainNamespace.solana}
            onActiveChange={() => {
              switchWallet(ChainNamespace.solana);
            }}
            isPrivy={false}
            isBoth={false}
          />
          {!connectorWalletType.disableWagmi && (
            <>
              <div className="oui-h-[1px] oui-bg-line oui-my-5" />
              <AddEvmWallet />
            </>
          )}
        </div>
      );
    }
  }

  if (walletChainType === WalletChainTypeEnum.onlySOL) {
    if (isConnectedSolana) {
      return (
        <div className="">
          <WalletCard
            type={WalletType.SOL}
            address={walletInSolana?.accounts[0].address}
            isActive={namespace === ChainNamespace.solana}
            onActiveChange={() => {
              switchWallet(ChainNamespace.solana);
            }}
            isPrivy={false}
            isBoth={false}
          />
        </div>
      );
    }
  }
  if (walletChainType === WalletChainTypeEnum.onlyEVM) {
    if (isConnectedEvm) {
      return (
        <div className="">
          <WalletCard
            type={WalletType.EVM}
            address={walletInWagmi?.accounts[0].address}
            isActive={namespace === ChainNamespace.evm}
            onActiveChange={() => {
              switchWallet(ChainNamespace.evm);
            }}
            isPrivy={false}
            isBoth={false}
          />
        </div>
      );
    }
  }
  return;
}
