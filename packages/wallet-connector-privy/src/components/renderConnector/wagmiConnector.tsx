import React from "react";
import { RenderWalletIcon } from "../common";
import { useWagmiWallet } from "../../providers/wagmi/wagmiWalletProvider";

export function EVMConnectArea({ connect }: { connect: (type: any) => void }) {
  const { connectors } = useWagmiWallet();

  return (
    <div className="">
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">
        EVM
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        {connectors.map((item, key) => (
          <div
            key={key}
            className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
            onClick={() => connect(item)}
          >
            <RenderWalletIcon connector={item} />
            <div className="oui-text-base-contrast oui-text-2xs">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}