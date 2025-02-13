import React from "react";
import { useWagmiWallet } from "../useWagmiWallet";
import { useSolanaWallet } from "../useSolanaWallet";
import { WalletCard } from "./walletCard";
import { useWallet } from "../useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { AddSolanaWallet } from "./addSolanaWallet";
import { AddEvmWallet } from "./addEvmWallet";
import { WalletType } from "../types";
export function RenderNoPrivyWallet() {
  const { wallet: walletInWagmi, isConnected: isConnectedEvm } = useWagmiWallet();
  const { wallet: walletInSolana, isConnected: isConnectedSolana } = useSolanaWallet();
  const { namespace, switchWallet } = useWallet();
  console.log('xxxx RenderNoPrivyWallet', {
    walletInWagmi,
    walletInSolana,
    isConnectedEvm,
    isConnectedSolana,
  });
  if (isConnectedEvm && isConnectedSolana) {
    return (
      <div className="oui-flex oui-flex-col oui-gap-5">
        <WalletCard type={WalletType.EVM} address={walletInWagmi?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={false} isBoth={true} />
        <WalletCard type={WalletType.SOL} address={walletInSolana?.accounts[0].address} isActive={namespace === ChainNamespace.solana} onActiveChange={() => { switchWallet(ChainNamespace.solana) }} isPrivy={false} isBoth={true} />
      </div>

    )
  }

  if (isConnectedEvm && !isConnectedSolana) {
    return (
      <div className="">
        <WalletCard type={WalletType.EVM} address={walletInWagmi?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={false} isBoth={false} />
        <div className="oui-h-[1px] oui-bg-line oui-my-5" />
        <AddSolanaWallet />
      </div>
    )
  }
  if (!isConnectedEvm && isConnectedSolana) {
    return (
      <div className="">
        <WalletCard type={WalletType.SOL} address={walletInSolana?.accounts[0].address} isActive={namespace === ChainNamespace.solana} onActiveChange={() => { switchWallet(ChainNamespace.solana) }} isPrivy={false} isBoth={false} />
        <div className="oui-h-[1px] oui-bg-line oui-my-5" />
        <AddEvmWallet />
      </div>
    )
  }
  return;
}