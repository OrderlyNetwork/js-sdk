import React, { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  cn,
  toast,
  Tooltip,
} from "@orderly.network/ui";
import { useWallet } from "../../hooks/useWallet";
import { useWalletConnectorPrivy } from "../../provider";
import { useSuiWallet } from "../../providers/sui";
import { WalletConnectType, WalletType } from "../../types";
import { RenderSlushWalletIcon, RenderWalletIcon } from "../common";

export function AddSuiWallet() {
  const { t } = useTranslation();
  const { wallets } = useSuiWallet();
  const { connect } = useWallet();
  const [collapsed, setCollapsed] = useState(false);
  const { targetWalletType } = useWalletConnectorPrivy();
  const [open, setOpen] = useState(false);

  const showUnavailableToast = () => {
    toast.error(t("connector.sui.installOrEnableWallet"));
  };

  useEffect(() => {
    let timer = 0;
    if (targetWalletType === WalletType.SUI) {
      timer = window.setTimeout(() => {
        setOpen(true);
      }, 200);
    }
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [targetWalletType]);

  useEffect(() => {
    if (!open) return;
    const timeId = window.setTimeout(() => {
      setOpen(false);
    }, 5000);
    return () => {
      window.clearTimeout(timeId);
    };
  }, [open]);

  return (
    <div className="oui-rounded-[8px] oui-bg-base-10 oui-px-2 oui-py-[11px]">
      <Tooltip
        className="oui-z-[65] oui-max-w-[200px] oui-text-warning-darken"
        open={open}
        content={t(
          "connector.privy.addSuiWallet.tips",
          "Connect a SUI-compatible wallet to continue using the SUI network.",
        )}
      >
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1">
          <div className="oui-flex oui-size-[15px] oui-items-center oui-justify-center oui-rounded-full oui-bg-[#4DA2FF] oui-text-[8px] oui-font-bold oui-text-white">
            S
          </div>
          <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast-80">
            {t("connector.privy.addSuiWallet", "Add Sui wallet")}
          </div>

          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <ChevronDownIcon
                size={16}
                opacity={1}
                className="oui-text-base-contrast-36"
              />
            ) : (
              <ChevronUpIcon
                size={16}
                opacity={1}
                className="oui-text-base-contrast"
              />
            )}
          </button>
        </div>
      </Tooltip>
      <div
        className={cn(
          "oui-transition-height oui-grid oui-grid-cols-2 oui-gap-2 oui-overflow-hidden oui-duration-150",
          collapsed ? "oui-mt-0 oui-max-h-0" : "oui-mt-3 oui-max-h-[400px]",
        )}
      >
        {!wallets.length && (
          <div
            className="oui-flex oui-cursor-pointer oui-items-center oui-justify-start oui-gap-1 oui-bg-base-9 oui-px-2 oui-py-[11px]"
            onClick={showUnavailableToast}
          >
            <RenderSlushWalletIcon />
            <div className="oui-text-2xs oui-text-base-contrast">Slush</div>
          </div>
        )}
        {wallets.map((item) => (
          <div
            key={item.name}
            className="oui-flex oui-cursor-pointer oui-items-center oui-justify-start oui-gap-1 oui-bg-base-9 oui-px-2 oui-py-[11px]"
            onClick={() =>
              connect({
                walletType: WalletConnectType.SUI,
                suiWallet: item,
              })
            }
          >
            <RenderWalletIcon connector={item as any} />
            <div className="oui-text-2xs oui-text-base-contrast">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
