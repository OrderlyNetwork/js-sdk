import React from "react";
import { useWagmiWallet } from "../useWagmiWallet";
import { useSolanaWallet } from "../useSolanaWallet";
import { WalletCard } from "./walletCard";
import { useWallet } from "../useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { AddSolanaWallet } from "./addSolanaWallet";
export function RenderNoPrivyWallet() {
  const { wallet: walletInWagmi } = useWagmiWallet();
  const { wallet: walletInSolana } = useSolanaWallet();
  const { namespace, switchWallet } = useWallet();
  // only have wagmi wallet
  if (walletInWagmi && !walletInSolana) {
    return (
      <div>
        <WalletCard type={ChainNamespace.evm} address={walletInWagmi?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={false} isBoth={false} />
        <div className="oui-h-[1px] oui-bg-line oui-my-5" />
        <AddSolanaWallet />
      </div>
    )
  }
  // TODO only have solana wallet
  if (!walletInWagmi && walletInSolana) {
  }
  // TODO have both wagmi and solana wallet
  if (walletInWagmi && walletInSolana) {

  }

  return;
}