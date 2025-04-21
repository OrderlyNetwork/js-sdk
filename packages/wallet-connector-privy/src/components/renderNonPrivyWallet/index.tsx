import React, { useEffect, useState } from "react";
import { useSolanaWallet } from "../../providers/solana/solanaWalletProvider";
import { useWagmiWallet } from "../../providers/wagmi/wagmiWalletProvider";
import { AbstractChains, ChainNamespace } from "@orderly.network/types";
import { WalletType } from "../../types";
import { WalletCard } from "../walletCard";
import { useWallet } from "../../hooks/useWallet";
import { useAbstractWallet } from "../../providers/abstractWallet/abstractWalletProvider";
import { useWalletConnectorPrivy } from "../../provider";
import { useStorageChain } from "@orderly.network/hooks";
import { AddEvmWallet } from "./addEvmWallet";
import { AddSolanaWallet } from "./addSolanaWallet";
import { AddAbstractWallet } from "./addAbstractWallet";

export function RenderNonPrivyWallet() {
  const [walletList, setWalletList] = useState<any[]>([]);
  const [addWalletList, setAddWalletList] = useState<any[]>([]);
  const { storageChain } = useStorageChain();
  const { connectorWalletType, walletChainTypeConfig } =
    useWalletConnectorPrivy();
  const { wallet: walletInWagmi, isConnected: isConnectedEvm } =
    useWagmiWallet();
  const { wallet: walletInSolana, isConnected: isConnectedSolana } =
    useSolanaWallet();
  const { wallet: walletInAbstract, isConnected: isConnectedAbstract } =
    useAbstractWallet();
  const { namespace, switchWallet } = useWallet();

  const isActive = (walletType: WalletType) => {
    if (namespace === ChainNamespace.evm) {
      if (
        walletType === WalletType.ABSTRACT &&
        AbstractChains.has(storageChain.id)
      ) {
        return true;
      }
      if (walletType === WalletType.EVM) {
        return true;
      }
      return false;
    }
    if (namespace === ChainNamespace.solana) {
      return walletType === WalletType.SOL;
    }
    return false;
  };

  useEffect(() => {
    const tempWalletList = [];
    const tempAddWallet = [];
    if (!connectorWalletType.disableWagmi && walletChainTypeConfig.hasEvm) {
      if (isConnectedEvm) {
        tempWalletList.push({
          type: WalletType.EVM,
          address: walletInWagmi?.accounts[0].address,
        });
      } else {
        tempAddWallet.push(WalletType.EVM);
      }
    }
    if (!connectorWalletType.disableSolana && walletChainTypeConfig.hasSol) {
      if (isConnectedSolana) {
        tempWalletList.push({
          type: WalletType.SOL,
          address: walletInSolana?.accounts[0].address,
        });
      } else {
        tempAddWallet.push(WalletType.SOL);
      }
    }
    if (!connectorWalletType.disableAGW && walletChainTypeConfig.hasAbstract) {
      if (isConnectedAbstract) {
        tempWalletList.push({
          type: WalletType.ABSTRACT,
          address: walletInAbstract?.accounts[0].address,
        });
      } else {
        tempAddWallet.push(WalletType.ABSTRACT);
      }
    }
    setWalletList(tempWalletList);
    setAddWalletList(tempAddWallet);
  }, [
    isConnectedEvm,
    isConnectedSolana,
    isConnectedAbstract,
    walletInWagmi,
    walletInSolana,
    walletInAbstract,
    walletChainTypeConfig,
    connectorWalletType,
  ]);
  return (
    <>
      <div className="oui-flex oui-flex-col oui-gap-5">
        {walletList.map((wallet) => (
          <WalletCard
            key={wallet.type}
            type={wallet.type}
            address={wallet.address}
            isActive={isActive(wallet.type)}
            onActiveChange={() => {
              switchWallet(wallet.type);
            }}
            isPrivy={false}
            isBoth={walletList.length > 1}
          />
        ))}
      </div>
      <RenderAddWallet addWalletList={addWalletList} />
    </>
  );
}

function RenderAddWallet({ addWalletList }: { addWalletList: WalletType[] }) {
  if (addWalletList.length === 0) {
    return null;
  }
  return (
    <>
      <div className="oui-h-[1px] oui-bg-line oui-my-5" />
      <div className="oui-flex oui-flex-col oui-gap-5">
        {addWalletList.map((wallet) => {
          if (wallet === WalletType.EVM) {
            return <AddEvmWallet />;
          }
          if (wallet === WalletType.SOL) {
            return <AddSolanaWallet />;
          }
          if (wallet === WalletType.ABSTRACT) {
            return <AddAbstractWallet />;
          }
        })}
      </div>
    </>
  );
}
