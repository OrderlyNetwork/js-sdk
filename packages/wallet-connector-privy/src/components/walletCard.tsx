import React from "react";
import { ChainNamespace } from "@orderly.network/types";
import {
  Checkbox,
  cn,
  CopyIcon,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  formatAddress,
  toast,
  Tooltip,
} from "@orderly.network/ui";
import { MoreIcon } from "./icons";

interface WalletCardProps {
  type: ChainNamespace;
  address: string;
  isActive: boolean;
  isPrivy?: boolean;
  onActiveChange: (active: boolean) => void;
}
export function WalletCard(props: WalletCardProps) {
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    toast.success("Copied!");
  };

  return (
    <div
      className={cn(
        "oui-rounded-2xl  oui-p-4 oui-h-[110px] oui-flex oui-flex-col oui-justify-between",
        props.type === ChainNamespace.evm
          ? "oui-bg-[#283BEE]"
          : "oui-bg-[#630EAD]"
      )}
    >
      <div className="oui-flex oui-items-center oui-justify-between">
        <div className="oui-text-base-contrast oui-text-sm oui-font-semibold">
          {formatAddress(props.address)}
        </div>
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
          <Tooltip content="Copy">
            <CopyIcon
              size={16}
              opacity={1}
              className="oui-text-base-contrast-80 oui-cursor-pointer hover:oui-text-base-contrast"
              onClick={() => copyAddress(props.address)}
            />
          </Tooltip>
          {props.isPrivy ? <PrivyWalletHandleOption /> : <div>disconnect</div>}
        </div>
      </div>

      <div className="oui-flex oui-items-center oui-justify-between">
        {props.type === ChainNamespace.evm ? (
          <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
            <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
              <div className="oui-flex oui-items-center oui-justify-center oui-w-[18px] oui-h-[18px] oui-rounded-full oui-bg-[#282e3a]">
                <MoreIcon className="oui-text-base-contrast-54 oui-h-3 oui-w-3" />
              </div>
            </div>
            <div className="oui-text-base-contrast oui-text-2xs oui-font-semibold">
              EVM
            </div>
          </div>
        ) : (
          <div className="oui-flex oui-items-center oui-justify-start oui-gap-1">
            <div className="">
              <img
                src="https://oss.orderly.network/static/sdk/solana-logo.png"
                className="oui-w-4"
              />
            </div>
            <div className="oui-text-base-contrast oui-text-2xs oui-font-semibold">
              Solana
            </div>
          </div>
        )}
        <div>
          <Checkbox checked={props.isActive} onCheckedChange={props.onActiveChange} />
        </div>
      </div>
    </div>
  );
}

function PrivyWalletHandleOption() {
  return (
    <div>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button>
          <MoreIcon className="oui-text-base-contrast-80 oui-cursor-pointer hover:oui-text-base-contrast" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            size={"xl"}
            align={"end"}
            onCloseAutoFocus={(e) => e.preventDefault()}
            side='top'
            style={{ width: "100px" }}
            className={"oui-p-1 oui-rounded oui-font-semibold"}
            sideOffset={0}
          >
            <DropdownMenuItem className="oui-py-1 oui-px-2 oui-text-2xs oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer">
              <div>export</div>
            </DropdownMenuItem>
            {/* <DropdownMenuItem className="oui-py-1 oui-px-2 oui-text-2xs oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer">
              <div>import</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  );
}
