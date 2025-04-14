import React from "react";
import { ChainNamespace } from "@orderly.network/types";
import { ExclamationFillIcon } from "@orderly.network/ui";

export function SwitchNetworkTips({
  chainNamespace,
}: {
  chainNamespace: ChainNamespace;
}) {
  const getChainName = () => {
    if (chainNamespace === ChainNamespace.evm) {
      return "EVM";
    }
    return "SOLANA";
  };
  return (
    <div className="oui-flex oui-mb-3 oui-items-center oui-gap-1  oui-px-2 oui-py-[6px] oui-bg-[rgba(255,125,0,0.1)] oui-rounded-[8px] ">
      <ExclamationFillIcon
        size={14}
        className=" oui-text-warning-darken oui-flex-shrink-0"
      />
      <div className="oui-text-2xs oui-text-warning-darken">
        Switch to {getChainName()} to continue.
      </div>
    </div>
  );
}
