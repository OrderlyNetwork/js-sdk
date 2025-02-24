import { cn } from "@orderly.network/ui";
import { Tooltip, ChevronDownIcon, ChevronUpIcon } from "@orderly.network/ui";
import React, { useEffect, useState } from "react";
import { useWagmiWallet } from "../useWagmiWallet";
import { useWallet } from "../useWallet";
import { EVMChainPopover } from "./walletCard";
import { MoreIcon } from "./icons";
import { ChainNamespace } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../provider";
import { WalletType } from "../types";
import { getWalletIcon } from "../util";
export function AddEvmWallet() {
  const [visible, setVisible] = useState(false);
  const { connect } = useWallet();
  const [open, setOpen] = useState(false);
  const { connectors } = useWagmiWallet();
  const {targetNamespace} = useWalletConnectorPrivy();
  console.log('--connectors', connectors)

  useEffect(() => {
    let timer = 0;
    if (targetNamespace === ChainNamespace.evm) {
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
      <Tooltip className="oui-text-warning-darken oui-max-w-[200px] oui-z-[65]"
        open={open}
        content="Connect an EVM-compatible wallet to continue using the EVM network.">

        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
          <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
            <div className="oui-flex oui-items-center oui-justify-start oui-relative oui-w-[55px]">
              <img src="https://oss.orderly.network/static/sdk/chains.png" className="oui-h-[18px] oui-relative oui-z-0" />
              <div className="oui-rounded-full oui-bg-[#282e3a] oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center oui-absolute oui-right-0">
                <EVMChainPopover>

                  <MoreIcon className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-h-3 oui-w-3 oui-relative oui-z-10" style={{ zIndex: 1 }} />
                </EVMChainPopover>
              </div>
            </div>
          </div>
          <div className="oui-text-base-contrast-80 oui-text-2xs oui-font-semibold">

            Add Evm wallet
          </div>

          <button onClick={() => setVisible(!visible)}>
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
        {connectors.map((item, index) =>
          <div
            key={index}
            className="oui-flex oui-items-center oui-justify-center oui-gap-1  oui-px-2 oui-py-[11px] oui-bg-[#131519] oui-cursor-pointer oui-text-2xs"
            onClick={() => connect({ walletType: WalletType.EVM, connector: item })}
          >
            {
              getWalletIcon(item) &&

              <img
                className="oui-w-[18px] oui-h-[18px]"
                src={getWalletIcon(item)}
                alt={item.name}
              />
            }
            {item.name}
          </div>
        )}

      </div>
    </div>
  )
}