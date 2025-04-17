import React, { useState } from "react";
import {
  ChainIcon,
  Checkbox,
  cn,
  CopyIcon,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  formatAddress,
  Popover,
  toast,
  Tooltip,
} from "@orderly.network/ui";
import { DisconnectIcon, MoreIcon } from "./icons";
import { useWalletConnectorPrivy } from "../provider";
import { usePrivyWallet } from "../providers/privyWalletProvider";
import { useWallet } from "../hooks/useWallet";
import { WalletType } from "../types";
import { useTranslation } from "@orderly.network/i18n";
interface WalletCardProps {
  type: WalletType;
  address: string;
  isActive: boolean;
  isPrivy?: boolean;
  isBoth?: boolean;
  onActiveChange: (active: boolean) => void;
}
export function WalletCard(props: WalletCardProps) {
  const { t } = useTranslation();
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    toast.success(t("common.copy.copied"));
  };

  return (
    <div
      className={cn(
        "oui-rounded-2xl oui-relative oui-p-4 oui-h-[110px]  oui-overflow-hidden",
        props.type === WalletType.EVM ? "oui-bg-[#283BEE]" : "oui-bg-[#630EAD]",
        props.isActive &&
          props.type === WalletType.SOL &&
          props.isBoth &&
          "oui-border-[2px] oui-border-[#faedff]",
        props.isActive &&
          props.type === WalletType.EVM &&
          props.isBoth &&
          "oui-border-[2px] oui-border-[#B9D1FF]"
      )}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: -20,
          background:
            "url('https://oss.orderly.network/static/sdk/wallet-card-bg.png')",
          width: "110px",
          height: "110px",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      <div className="oui-relative oui-z-10 oui-flex oui-flex-col oui-justify-between oui-h-full">
        <div className="oui-flex oui-items-center oui-justify-between">
          <div className="oui-text-base-contrast oui-text-sm oui-font-semibold">
            {formatAddress(props.address)}
          </div>
          <div className="oui-flex oui-items-center oui-justify-center oui-gap-2">
            <Tooltip content={t("common.copy")} className="oui-z-[65]">
              <CopyIcon
                size={16}
                opacity={1}
                className="oui-text-base-contrast-80 oui-cursor-pointer hover:oui-text-base-contrast"
                onClick={() => copyAddress(props.address)}
              />
            </Tooltip>
            {props.isPrivy ? (
              <PrivyWalletHandleOption
                address={props.address}
                type={props.type}
              />
            ) : (
              <NonPrivyWalletHandleOption walletType={props.type} />
            )}
          </div>
        </div>

        <div className="oui-flex oui-items-center oui-justify-between">
          {props.type === WalletType.EVM ? (
            <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
              <div className="oui-flex oui-items-center oui-justify-center oui-relative">
                <div className="oui-flex oui-items-center oui-justify-center oui-h-[18px] ">
                  <img
                    src="https://oss.orderly.network/static/sdk/chains.png"
                    className="oui-h-[18px] oui-w-[49px] oui-relative oui-z-0"
                  />
                </div>
                <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-relative oui-left-[-9px]">
                  <div className="oui-rounded-full oui-bg-[#282e3a] oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center">
                    <EVMChainPopover>
                      <MoreIcon
                        className="oui-text-base-contrast-54 hover:oui-text-base-contrast oui-h-3 oui-w-3 oui-relative oui-z-10"
                        style={{ zIndex: 1 }}
                      />
                    </EVMChainPopover>
                  </div>
                  <div className="oui-text-base-contrast oui-text-2xs oui-font-semibold">
                    EVM
                  </div>
                </div>
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
          {props.isBoth && (
            <div>
              <Checkbox
                checked={props.isActive}
                onCheckedChange={props.onActiveChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function NonPrivyWalletHandleOption({
  walletType,
}: {
  walletType: WalletType;
}) {
  const { disconnect } = useWallet();
  return (
    <div onClick={() => disconnect(walletType)}>
      <DisconnectIcon className="oui-text-base-contrast-80 oui-cursor-pointer hover:oui-text-base-contrast oui-w-4 oui-h-4" />
    </div>
  );
}

function PrivyWalletHandleOption({
  address,
  type,
}: {
  address: string;
  type: WalletType;
}) {
  const { t } = useTranslation();
  const { exportWallet } = usePrivyWallet();
  return (
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
          side="top"
          style={{ width: "100px" }}
          className={"oui-p-1 oui-rounded oui-font-semibold oui-z-[65]"}
          sideOffset={0}
        >
          <DropdownMenuItem
            className="oui-py-1 oui-px-2 oui-text-2xs oui-text-base-contrast-54 hover:oui-text-base-contrast oui-cursor-pointer"
            onClick={() => {
              console.log("export wallet");
              exportWallet(type);
            }}
          >
            <div>{t("common.export")}</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
}

export function EVMChainPopover({ children }: { children: React.ReactNode }) {
  const { getChainsByNetwork } = useWalletConnectorPrivy();
  const [chains] = useState(getChainsByNetwork("mainnet"));
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();

  return (
    <Popover
      content={
        <div>
          <div className="oui-text-2xs oui-text-base-contrast oui-font-semibold">
            {t("connector.privy.supportedEvmChain")}
          </div>
          <div className="oui-grid oui-grid-cols-3 oui-gap-y-3 oui-gap-x-2 oui-mt-3 oui-text-2xs oui-text-base-contrast-54">
            {chains.map((item, key) => (
              <div
                key={key}
                className="oui-flex oui-items-center oui-justify-start oui-gap-1"
              >
                <ChainIcon chainId={item.id} size="2xs" />
                <div>{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      }
      arrow={true}
      contentProps={{
        side: "bottom",
        align: "center",
        className: "oui-p-2 oui-z-[65]",
      }}
    >
      <button>{children}</button>
    </Popover>
  );
}
