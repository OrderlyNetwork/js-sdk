import { SimpleDialog } from "@orderly.network/ui";
import { ConnectPanel } from "./connectPanel";
import React from "react";
import { useWallet } from "./useWallet";
import { usePrivyWallet } from "./usePrivyWallet";

export function ConnectDrawer(props: {open: boolean, onChangeOpen: (open: boolean) => void}) {
  const {connect} =useWallet();
  const { walletEVM: privyWalletEVM, walletSOL: privyWalletSOL , logout: disconnectPrivy} =
    usePrivyWallet();
  return (
    <SimpleDialog
      classNames={{ content: 'oui-flex-col oui-h-[700px] oui-right-0 oui-left-[calc(100%_-_300px)] oui-w-[300px] oui-translate-x-0' }}
      open={props.open}
      onOpenChange={props.onChangeOpen}
    >
      <div>Connect Wallet</div>
      <div className='oui-border'>
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
            <div onClick={disconnectPrivy}>
              logout
            </div>
          </div>
        ) : (
          <div>
            <div>Login in</div>
            <div onClick={() => connect("privy", "email")}>email</div>
            <div>protected by privy</div>
          </div>
        )}
      </div>

    </SimpleDialog>
  )
}