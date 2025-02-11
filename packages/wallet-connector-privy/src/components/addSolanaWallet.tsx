import React, { useEffect, useRef, useState } from "react";
import { useSolanaWallet } from "../useSolanaWallet";
import { ChevronDownIcon, ChevronUpIcon, cn, Tooltip, } from "@orderly.network/ui";
import { useWallet } from "../useWallet";
import { useWalletConnectorPrivy } from "../provider";
import { ChainNamespace } from "@orderly.network/types";
export function AddSolanaWallet() {
  const { wallets } = useSolanaWallet();
  const {connect} = useWallet();
  const [visible, setVisible] = useState(false);
  const onToggleVisibility = () => {
    setVisible(!visible);
  }
  const {targetNamespace} = useWalletConnectorPrivy();
  // TODO: need get value from useWalletConnectorPrivy
  const [open, setOpen] = useState(false);
  console.log('-- open and targetNamespace', open, targetNamespace);

  useEffect(() => {
    let timer = 0;
    if (targetNamespace === ChainNamespace.solana) {
      timer = window.setTimeout(() => {
        setOpen(true);
      }, 200);
    }
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    }
  }, [targetNamespace]);
  useEffect(() => {
    if (open === false){
      return;
    }
    const timeId = window.setTimeout(() => {
      setOpen(false);
    }, 5000);
    return () => {
      if (timeId) {
        window.clearTimeout(timeId);
      }
    }
  }, [open]);

  return (
    <div className="oui-bg-[#07080A] oui-rounded-[8px] oui-px-2 oui-py-[11px]" >

      <Tooltip className="oui-text-warning-darken oui-max-w-[200px]" open={open} content="Connect an EVM-compatible wallet to continue using the EVM network.">

        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
          <img
            src="https://oss.orderly.network/static/sdk/solana-logo.png"
            className="oui-w-[15px] oui-h-[15px]"
          />
          <div className="oui-text-base-contrast-80 oui-text-2xs oui-font-semibold">

            Add Solana wallet
          </div>

          <button onClick={onToggleVisibility}>
            {visible ? (
              <ChevronDownIcon size={16} opacity={1} className="oui-text-base-contrast-36" />
            ) : (
              <ChevronUpIcon size={16} opacity={1} className="oui-text-base-contrast" />
            )}
          </button>

        </div>
      </Tooltip>
      <div
        className={cn(
          "oui-grid oui-grid-cols-2 oui-gap-[6px] oui-transition-height oui-duration-150 oui-overflow-hidden",
          visible ? "oui-max-h-0 oui-mt-0" : "oui-max-h-[400px] oui-mt-3"
        )}
      >
        {wallets.map((item, index) =>
          <div
            key={index}
            className="oui-flex oui-items-center oui-justify-center oui-gap-1  oui-px-2 oui-py-[11px] oui-bg-[#131519] oui-cursor-pointer"
            onClick={() => connect({walletType: 'SOL', walletAdapter: item.adapter})}
          >
            {item.adapter.name}
          </div>
        )}

      </div>
    </div>
  )
}