import React from "react";
import { useWagmiWallet } from "../useWagmiWallet";
import { useSolanaWallet } from "../useSolanaWallet";
import { WalletCard } from "./walletCard";
import { useWallet } from "../useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { AddSolanaWallet } from "./addSolanaWallet";
import { AddEvmWallet } from "./addEvmWallet";
export function RenderNoPrivyWallet() {
  const { wallet: walletInWagmi } = useWagmiWallet();
  const { wallet: walletInSolana } = useSolanaWallet();
  const { namespace, switchWallet } = useWallet();
  // only have wagmi wallet
  if (walletInWagmi && !walletInSolana) {
    return (
      <div className="oui-mt-5">
        <WalletCard type={ChainNamespace.evm} address={walletInWagmi?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={false} isBoth={false} />
        <div className="oui-h-[1px] oui-bg-line oui-my-5" />
        <AddSolanaWallet />
      </div>
    )
  }
  // TODO only have solana wallet
  if (!walletInWagmi && walletInSolana) {
    return (
      <div className="oui-mt-5">
        <WalletCard type={ChainNamespace.solana} address={walletInSolana?.accounts[0].address} isActive={namespace === ChainNamespace.solana} onActiveChange={() => { switchWallet(ChainNamespace.solana) }} isPrivy={false} isBoth={false} />
        <div className="oui-h-[1px] oui-bg-line oui-my-5" />
        <AddEvmWallet />
      </div>
    )
  }
  // have both wagmi and solana wallet
  if (walletInWagmi && walletInSolana) {
    return (
      <div className="oui-flex oui-flex-col oui-gap-5 oui-mt-5">
        <WalletCard type={ChainNamespace.evm} address={walletInWagmi?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={false} isBoth={true} />
        <WalletCard type={ChainNamespace.solana} address={walletInSolana?.accounts[0].address} isActive={namespace === ChainNamespace.solana} onActiveChange={() => { switchWallet(ChainNamespace.solana) }} isPrivy={false} isBoth={true} />
      </div>

    )
  }

  return;
}