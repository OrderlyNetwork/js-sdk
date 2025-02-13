import { SimpleDialog, } from "@orderly.network/ui";
import React, { useMemo } from "react";
import { useWallet } from "../useWallet";
import { usePrivyWallet } from "../usePrivyWallet";
import { ChainNamespace, ConnectorKey } from "@orderly.network/types";
import { WalletCard } from "./walletCard";
import { ConnectProps, WalletType } from "../types";
import { RenderPrivyTypeIcon } from "./common";
import { useWalletConnectorPrivy } from "../provider";
import { useWagmiWallet } from "../useWagmiWallet";
import { useSolanaWallet } from "../useSolanaWallet";
import { useLocalStorage } from "@orderly.network/hooks";
import { RenderNoPrivyWallet } from "./renderNoPrivyWallet";
import { CloseIcon } from "./icons";
import { WalletAdapter } from "@solana/wallet-adapter-base";

function PrivyConnectArea({ connect }: { connect: (type: any) => void }) {
  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">Login in</div>
      <div className="oui-flex oui-flex-col oui-gap-[6px]">

        <div

          className="oui-cursor-pointer oui-rounded-[6px] oui-bg-[#333948] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect({ walletType: 'privy', extraType: 'email' })}
        >
          <img src="https://oss.orderly.network/static/sdk/email.svg" className="oui-w-[18px] oui-h-[18px]" />
          <div className="oui-text-base-contrast oui-text-2xs">Email</div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#335FFC] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: 'privy', extraType: 'google' })}
        >
          <img src="https://oss.orderly.network/static/sdk/google.svg" className="oui-w-[18px] oui-h-[18px]" />
          <div className="oui-text-base-contrast oui-text-2xs">Google</div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#07080A] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: 'privy', extraType: 'twitter' })}
        >
          <img src="https://oss.orderly.network/static/sdk/twitter.svg" className="oui-w-[18px] oui-h-[18px]" />
          <div className="oui-text-base-contrast oui-text-2xs">X / Twitter</div>
        </div>

      </div>
      <div className="oui-h-3 oui-flex oui-justify-center oui-mt-4">

        <img src="https://oss.orderly.network/static/sdk/privy-logo.png" className=" oui-h-[10px]" />
      </div>
      <div className="oui-h-[1px] oui-bg-line oui-w-full oui-mt-5"></div>
    </div>
  )
}

function EVMConnectArea({ connect }: { connect: (type: any) => void }) {
  const { connectors } = useWagmiWallet();
  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">EVM</div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-[6px]">
        {connectors.map((item, key) => (
          <div key={key}
            className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
            onClick={() => connect(item)}
          >
            <img className="oui-w-[18px] oui-h-[18px]" src='https://oss.orderly.network/static/wallet_icon/metamask.png' />
            <div className="oui-text-base-contrast oui-text-2xs">{item.name}</div>
          </div>
        ))}

      </div>
    </div>
  )

}

function SOLConnectArea({ connect }: { connect: (walletAdapter:WalletAdapter) => void }) {
  const { wallets } = useSolanaWallet();
  return (
    <div>
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">SOL</div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-[6px]">
        {wallets.map((item, key) => (
          <div key={key}
            className=" oui-flex oui-items-center oui-justify-center oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
            onClick={() => connect(item.adapter)}
          >
            <div className="oui-text-base-contrast oui-text-2xs">{item.adapter.name}</div>
          </div>
        ))}

      </div>
    </div>
  )
}

function ConnectWallet() {
  const { connect } = useWallet();
  const { setOpenConnectDrawer } = useWalletConnectorPrivy();

  const handleConnect = (params: ConnectProps) => {
    connect(params);
    if (params.walletType === WalletType.PRIVY) {
      setOpenConnectDrawer(false);
    }
  };

  return (
    <div className="oui-flex oui-flex-col oui-gap-5">
      <PrivyConnectArea connect={(type) => handleConnect({ walletType: WalletType.PRIVY, extraType: type })} />
      <EVMConnectArea connect={(connector) => handleConnect({ walletType: WalletType.EVM, connector: connector })} />
      <SOLConnectArea connect={(walletAdapter) => handleConnect({ walletType: WalletType.SOL, walletAdapter: walletAdapter })} />
    </div>
  )
}

function RenderPrivyWallet() {
  const { walletEVM, walletSOL, linkedAccount } = usePrivyWallet();
  const { namespace, switchWallet, disconnect } = useWallet();

  return (
    <div>

      <div className="oui-flex oui-justify-between oui-items-center">
        {linkedAccount &&
          <div className="oui-flex oui-items-center oui-justify-start oui-gap-2 oui-text-base-contrast">
            <div><RenderPrivyTypeIcon type={linkedAccount.type} size={24} /></div>
            <div className="oui-text-xs">{linkedAccount.address}</div>

          </div>
        }
        <div className="oui-cursor-pointer oui-text-primary oui-text-2xs oui-font-semibold" onClick={() => disconnect(WalletType.PRIVY)}>Log out</div>


      </div>
      <div className="oui-flex oui-flex-col oui-gap-5 oui-mt-5">
        <WalletCard type={WalletType.EVM} address={walletEVM?.accounts[0].address} isActive={namespace === ChainNamespace.evm} onActiveChange={() => { switchWallet(ChainNamespace.evm) }} isPrivy={true} isBoth={true} />
        <WalletCard type={WalletType.SOL} address={walletSOL?.accounts[0].address} isActive={namespace === ChainNamespace.solana} onActiveChange={() => { switchWallet(ChainNamespace.solana) }} isPrivy={true} isBoth={true} />
      </div>
    </div>
  )
}

function MyWallet() {
  const [connectorKey, setConnectorKey] = useLocalStorage(ConnectorKey, '')

  return (
    <div>
      {connectorKey === 'privy' && <RenderPrivyWallet />
      }

      {connectorKey !== 'privy'
        &&
        <RenderNoPrivyWallet />
      }
    </div>
  )
}



export function ConnectDrawer(props: { open: boolean, onChangeOpen: (open: boolean) => void }) {
  const { isConnected: isConnectedPrivy } =
    usePrivyWallet();
  const {  isConnected: isConnectedEvm } = useWagmiWallet();
  const { isConnected: isConnectedSolana } = useSolanaWallet();

  const isConnected = useMemo(() => {
    if (isConnectedPrivy) {
      return true;
    }
    if (isConnectedEvm) {
      return true;
    }
    if (isConnectedSolana) {
      return true;
    }
    return false;
  }, [isConnectedPrivy, isConnectedEvm, isConnectedSolana])

  return (
    <SimpleDialog
      classNames={{
        content: 'oui-flex-col  oui-h-[calc(100vh_-_72px)] oui-right-0 oui-left-[calc(100%_-_300px)] oui-w-[300px] oui-translate-x-0 lg:oui-px-4',
        body: 'oui-overflow-hidden oui-h-full oui-relative',
      }}
      open={props.open}
      onOpenChange={props.onChangeOpen}
      closable={false}
      contentProps={{
        // onPointerDownOutside: (event) => event.preventDefault(),
      }}
    >
      <div className='oui-z-0 oui-absolute -oui-top-[calc(100vh/2)] oui-h-[100vh] oui-left-[50px] oui-right-[50px]'
        style={{
          background: "conic-gradient(from -41deg at 40.63% 50.41%, rgba(242, 98, 181, 0.00) 125.17920970916748deg, rgba(95, 197, 255, 0.20) 193.4119462966919deg, rgba(255, 172, 137, 0.20) 216.0206937789917deg, rgba(129, 85, 255, 0.20) 236.0708713531494deg, rgba(120, 157, 255, 0.20) 259.95326042175293deg, rgba(159, 115, 241, 0.00) 311.0780096054077deg)",
          filter: "blur(50px)",
        }}
      />
      <div className="oui-z-10 oui-relative oui-h-full">
        <div className="oui-flex oui-justify-between oui-items-center oui-mb-5">
          <div className='oui-font-semibold oui-text-base-contrast-80 oui-text-base'>{isConnected ? 'My Wallet' : 'Connect Wallet'}</div>
          <CloseIcon className="oui-cursor-pointer oui-text-base-contrast-20 oui-w-5 oui-h-5 hover:oui-text-base-contrast-80" onClick={() => props.onChangeOpen(false)} />
        </div>
        {isConnected ? (
          <MyWallet />
        ) : (
          <ConnectWallet />
        )}
      </div>

      {
        !isConnected &&
        <div className="oui-z-10 oui-text-base-contrast-80 oui-text-center oui-text-2xs oui-absolute oui-bottom-0 oui-left-0 oui-right-0 oui-px-4 oui-pb-4  oui-font-semibold">
          By connecting your wallet, you acknowledge and agree to the <span className="oui-cursor-pointer oui-underline oui-text-primary">terms of use</span>.
        </div>
      }
    </SimpleDialog>
  )
}