import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
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
import { useWallet } from "../hooks/useWallet";
import { useWalletConnectorPrivy } from "../provider";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { WalletConnectType, WalletType } from "../types";
import { PrivyConnectorImagePath } from "../util";
import { DisconnectIcon, MoreIcon } from "./icons";

interface WalletCardProps {
  type: WalletType;
  address: string;
  isActive: boolean;
  isPrivy?: boolean;
  isMulti?: boolean;
  onActiveChange: (active: boolean) => void;
}

const getCardBgClassName = (type: WalletType = WalletType.EVM) => {
  const cardBgColorMap: { [key in WalletType]: string } = {
    [WalletType.EVM]: "oui-bg-[#283BEE]",
    [WalletType.ABSTRACT]: "oui-bg-[#00A858]",
    [WalletType.SOL]: "oui-bg-[#630EAD]",
  };
  return cardBgColorMap[type];
};

const getCardActiveClassName = (
  isActive: boolean,
  isMulti: boolean,
  type: WalletType = WalletType.EVM,
) => {
  const cardActiveColorMap: { [key in WalletType]: string } = {
    [WalletType.EVM]: "oui-border-[2px] oui-border-[#B9D1FF]",
    [WalletType.ABSTRACT]: "oui-border-[2px] oui-border-[#B9D1FF]",
    [WalletType.SOL]: "oui-border-[2px] oui-border-[#faedff]",
  };
  return isActive && isMulti && cardActiveColorMap[type];
};

export function WalletCard(props: WalletCardProps) {
  const { t } = useTranslation();
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    toast.success(t("common.copy.copied"));
  };

  return (
    <div
      className={cn(
        "oui-relative oui-h-[110px] oui-overflow-hidden oui-rounded-2xl  oui-p-4",
        getCardBgClassName(props.type),
        getCardActiveClassName(
          props.isActive,
          props.isMulti || false,
          props.type,
        ),
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
      <div className="oui-relative oui-z-10 oui-flex oui-h-full oui-flex-col oui-justify-between">
        <div className="oui-flex oui-items-center oui-justify-between">
          <div className="oui-text-sm oui-font-semibold oui-text-base-contrast">
            {formatAddress(props.address)}
          </div>
          <div className="oui-flex oui-items-center oui-justify-center oui-gap-2">
            <Tooltip content={t("common.copy")} className="oui-z-[65]">
              <CopyIcon
                size={16}
                opacity={1}
                className="oui-cursor-pointer oui-text-base-contrast-80 hover:oui-text-base-contrast"
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
          <RenderWalletType walletType={props.type} />

          {props.isMulti && (
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
  const disconnectWallet = () => {
    let walletConnectType: WalletConnectType = WalletConnectType.EVM;
    switch (walletType) {
      case WalletType.EVM:
        walletConnectType = WalletConnectType.EVM;
        break;
      case WalletType.SOL:
        walletConnectType = WalletConnectType.SOL;
        break;
      case WalletType.ABSTRACT:
        walletConnectType = WalletConnectType.ABSTRACT;
        break;
    }
    disconnect(walletConnectType);
  };
  return (
    <div onClick={() => disconnectWallet()}>
      <DisconnectIcon className="oui-size-4 oui-cursor-pointer oui-text-base-contrast-80 hover:oui-text-base-contrast" />
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
          <MoreIcon className="oui-cursor-pointer oui-text-base-contrast-80 hover:oui-text-base-contrast" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          size={"xl"}
          align={"end"}
          side="top"
          style={{ width: "100px" }}
          className={"oui-z-[65] oui-rounded oui-p-1 oui-font-semibold"}
          sideOffset={0}
        >
          <DropdownMenuItem
            className="oui-cursor-pointer oui-px-2 oui-py-1 oui-text-2xs oui-text-base-contrast-54 hover:oui-text-base-contrast"
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
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
            {t("connector.privy.supportedEvmChain")}
          </div>
          <div className="oui-mt-3 oui-grid oui-grid-cols-3 oui-gap-x-2 oui-gap-y-3 oui-text-2xs oui-text-base-contrast-54">
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

const RenderWalletType = ({ walletType }: { walletType: WalletType }) => {
  if (walletType === WalletType.SOL) {
    return (
      <div className="oui-flex oui-items-center oui-justify-start oui-gap-1">
        <div className="">
          <img
            src="https://oss.orderly.network/static/sdk/solana-logo.png"
            className="oui-w-4"
          />
        </div>
        <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
          Solana
        </div>
      </div>
    );
  }
  if (walletType === WalletType.ABSTRACT) {
    return (
      <div className="oui-flex oui-items-center oui-justify-start oui-gap-[6px]">
        <img
          src={`${PrivyConnectorImagePath}/abstract-transparent.png`}
          className="oui-w-4"
        />
        <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
          Abstract
        </div>
      </div>
    );
  }
  if (walletType === WalletType.EVM) {
    return (
      <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
        <div className="oui-relative oui-flex oui-items-center oui-justify-center">
          <div className="oui-flex oui-h-[18px] oui-items-center oui-justify-center ">
            <img
              src="https://oss.orderly.network/static/sdk/chains.png"
              className="oui-relative oui-z-0 oui-h-[18px] oui-w-[49px]"
            />
          </div>
          <div className="oui-relative oui-left-[-9px] oui-flex oui-items-center oui-justify-center oui-gap-1">
            <div className="oui-flex oui-size-[18px] oui-items-center oui-justify-center oui-rounded-full oui-bg-[#282e3a]">
              <EVMChainPopover>
                <MoreIcon
                  className="oui-relative oui-z-10 oui-size-3 oui-text-base-contrast-54 hover:oui-text-base-contrast"
                  style={{ zIndex: 1 }}
                />
              </EVMChainPopover>
            </div>
            <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
              EVM
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <></>;
};
