import React from "react";
import { useSoalanWallet } from "./useSoalanWallet";
import { useWagmiWallet } from "./useWagmiWallet";
import { useWallet } from "./useWallet";
import { usePrivyWallet } from "./usePrivyWallet";

export function ConnectPanel() {
  const { wallets: SOLWallets, wallet: walletSOL } = useSoalanWallet();
  const {
    connectors: EVMWallets,
    wallet: walletEVM,
    connectedChain: connectedChainEVM,
  } = useWagmiWallet();
  const { walletEVM: privyWalletEVM, walletSOL: privyWalletSOL } =
    usePrivyWallet();
  const { connect } = useWallet();

  console.log("-- sol wallet", walletSOL);
  return (
    <div className="oui-flex oui-flex-col oui-gap-2 oui-w-[500px]">
      <div className="oui-flex oui-flex-col oui-gap-1 oui-border oui-p-2">
        <h2>Privy wallets login in</h2>

        <div>
          {privyWalletEVM || privyWalletSOL ? (
            <div className='oui-flex oui-flex-col oui-gap-2'>
              {privyWalletSOL && (
                <div className='oui-border oui-p-1'>
                  <div>solana wallet in privy</div>
                  <div>{privyWalletSOL.label}</div>
                  <div>{privyWalletSOL.accounts[0].address}</div>
                </div>
              )}
              {privyWalletEVM && (
                <div className='oui-border oui-p-1'>
                  <div>evm wallet in privy</div>
                  <div>{privyWalletEVM.label}</div>
                  <div>{privyWalletEVM.accounts[0].address}</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div onClick={() => connect("privy", "email")}>email</div>
            </div>
          )}
        </div>
      </div>
      <div className="oui-flex oui-flex-col oui-gap-1 oui-border oui-p-2">
        <h2>SOL Wallets</h2>

        {walletSOL ? (
          <div>
            current sol wallet:
            <div>{walletSOL.label}</div>
            <div>{walletSOL.accounts[0].address}</div>
          </div>
        ) : (
          <div className="oui-flex oui-gap-2">
            {SOLWallets.map((item, index) => (
              <div
                key={index}
                className="oui-flex oui-gap-1 oui-border oui-px-2 oui-py-1"
              >
                <p onClick={() => connect("SOL", item.adapter)}>
                  {item.adapter.name}
                </p>
                <p>{item.adapter.readyState}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="oui-flex oui-flex-col oui-gap-1 oui-border oui-p-1">
        <h2>EVM wallets</h2>

        {walletEVM ? (
          <div className="oui-flex oui-flex-col oui-gap-1 ">
            current wallet:
            <div>{walletEVM.label}</div>
            <div>current chain: {connectedChainEVM?.id}</div>
            <div>{walletEVM.accounts[0].address}</div>
            <div>discconnect</div>
          </div>
        ) : (
          <div className="oui-flex oui-gap-2">
            {EVMWallets.map((item, index) => (
              <div
                key={index}
                className="oui-flex oui-items-center oui-gap-1 oui-border oui-px-2 oui-py-1"
              >
                {item.icon && (
                  <img src={item.icon} className="oui-w-4 oui-h-4" />
                )}
                <p onClick={() => connect("EVM", item)}>{item.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
