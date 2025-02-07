import { SimpleDialog } from "@orderly.network/ui";
import React, { useMemo } from "react";
import { useWallet } from "../useWallet";
import { usePrivyWallet } from "../usePrivyWallet";
import { EmailIcon, GoogleIcon, ProtectedByPrivyIcon, TwitterIcon } from "./icons";

function PrivyConnectArea() {
  const { connect } = useWallet();
  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">Login in</div>
      <div className="oui-flex oui-flex-col oui-gap-[6px]">

        <div

          className="oui-cursor-pointer oui-rounded-[6px] oui-bg-[#333948] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect("privy", "email")}
        >
          <EmailIcon />
          <div className="oui-text-base-contrast oui-text-2xs">Email</div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#335FFC] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect("privy", "email")}
        >
          <GoogleIcon />
          <div className="oui-text-base-contrast oui-text-2xs">Google</div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#07080A] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect("privy", "email")}
        >
          <TwitterIcon />
          <div className="oui-text-base-contrast oui-text-2xs">X / Twitter</div>
        </div>

      </div>
      <div className="oui-h-3 oui-flex oui-justify-center oui-mt-4">

        <ProtectedByPrivyIcon />
      </div>
      <div className="oui-h-[1px] oui-bg-line oui-w-full oui-mt-5"></div>
    </div>
  )
}

function EVMConnectArea() {
  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">EVM</div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-[6px]">
        {['MetaMask', 'WalletConnect', 'Trezor', 'Ledger', 'Binance'].map((item, key) => (
          <div key={key} className=" oui-flex oui-items-center oui-justify-center oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1">
            <div className="oui-text-base-contrast oui-text-2xs">{item}</div>
          </div>
        ))}

      </div>
    </div>
  )

}

function SOLConnectArea() {
  return (
    <div>
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">SOL</div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-[6px]">
        {['Phantom', 'Solflare', 'Glow', 'Coinbase'].map((item, key) => (
          <div key={key} className=" oui-flex oui-items-center oui-justify-center oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1">
            <div className="oui-text-base-contrast oui-text-2xs">{item}</div>
          </div>
        ))}

      </div>
    </div>
  )
}

function ConnectWallet() {
  return (
    <div>
      <div className='oui-font-semibold oui-text-base-contrast-80 oui-text-base'>Connect Wallet</div>
      <div className="oui-flex oui-flex-col oui-gap-5 oui-mt-5">

        <PrivyConnectArea />
        <EVMConnectArea />
        <SOLConnectArea />
      </div>

    </div>
  )

}

function MyWallet() {
  return (
    <div>
      <div className='oui-font-bold oui-text-base-contrast-80 oui-text-base'>My Wallet</div>
    </div>
  )
}

export function ConnectDrawer(props: { open: boolean, onChangeOpen: (open: boolean) => void }) {
  const { walletEVM: privyWalletEVM, walletSOL: privyWalletSOL, logout: disconnectPrivy } =
    usePrivyWallet();

  const isConnected = useMemo(() => {
    return false;
  }, [])

  return (
    <SimpleDialog
      classNames={{ content: 'oui-flex-col  oui-h-[calc(100vh_-_72px)] oui-right-0 oui-left-[calc(100%_-_300px)] oui-w-[300px] oui-translate-x-0 lg:oui-px-4' }}
      open={props.open}
      onOpenChange={props.onChangeOpen}
      contentProps={{
        onOpenAutoFocus: (event) => event.preventDefault(),
      }}
    >
      <div className='oui-z-0 oui-absolute -oui-top-[calc(100vh/2)] oui-h-[100vh] oui-left-[50px] oui-right-[50px]'
        style={{
          background: "conic-gradient(from -41deg at 40.63% 50.41%, rgba(242, 98, 181, 0.00) 125.17920970916748deg, rgba(95, 197, 255, 0.20) 193.4119462966919deg, rgba(255, 172, 137, 0.20) 216.0206937789917deg, rgba(129, 85, 255, 0.20) 236.0708713531494deg, rgba(120, 157, 255, 0.20) 259.95326042175293deg, rgba(159, 115, 241, 0.00) 311.0780096054077deg)",
          filter: "blur(50px)",
        }}
      />

      <div className="oui-z-10 oui-relative oui-h-full">

        {isConnected ? (
          <MyWallet />
        ) : (
          <ConnectWallet />
        )}

      </div>


      <div className="oui-z-10 oui-text-base-contrast-80 oui-text-center oui-text-2xs oui-absolute oui-bottom-0 oui-left-0 oui-right-0 oui-px-4 oui-pb-4  oui-font-semibold">
        By connecting your wallet, you acknowledge and agree to the <span className="oui-cursor-pointer oui-underline oui-text-primary">terms of use</span>.
      </div>
      {/* <div className='oui-mt-5'>
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
          <PrivyConnectArea />
        )}
      </div> */}

    </SimpleDialog>
  )
}