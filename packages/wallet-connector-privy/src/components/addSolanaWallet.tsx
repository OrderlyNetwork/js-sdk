import React from "react";
import { useSolanaWallet } from "../useSolanaWallet";
export function AddSolanaWallet() {
  const {wallets} = useSolanaWallet();
  return (
    <div className="oui-bg-[#07080A] oui-rounded-[8px] oui-px-2 oui-py-[11px]" >

      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
        <img
          src="https://oss.orderly.network/static/sdk/solana-logo.png"
          className="oui-w-[15px] oui-h-[15px]"
        />
        <div className="oui-text-base-contrast-80 oui-text-2xs oui-font-semibold">

          Add Solana wallet
        </div>

      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-[6px] oui-mt-3">
        {wallets.map((item, index) => 
        <div key={index} className="oui-flex oui-items-center oui-justify-center oui-gap-1  oui-px-2 oui-py-[11px] oui-bg-[#131519]">
          {item.adapter.name}

        </div>
        )}

      </div>
    </div>
  )
}