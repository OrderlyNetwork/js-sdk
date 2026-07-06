import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, toast, useScreen } from "@orderly.network/ui";
import { useSuiWallet } from "../../providers/sui";
import { RenderSlushWalletIcon, RenderWalletIcon } from "../common";

export function SUIConnectArea({
  connect,
}: {
  connect: (wallet: any) => void;
}) {
  const { t } = useTranslation();
  const { wallets } = useSuiWallet();
  const { isMobile } = useScreen();

  const showUnavailableToast = () => {
    toast.error(t("connector.sui.installOrEnableWallet"));
  };

  return (
    <div>
      <div className="oui-mb-2 oui-text-sm oui-font-semibold oui-text-base-contrast-80">
        Sui
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        {!wallets.length && (
          <div
            className={cn(
              "oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-py-[11px]",
              isMobile ? "oui-bg-base-5" : "oui-bg-base-10",
            )}
            onClick={showUnavailableToast}
          >
            <RenderSlushWalletIcon />
            <div className="oui-text-2xs oui-text-base-contrast">Slush</div>
          </div>
        )}
        {wallets.map((item) => (
          <div
            key={item.name}
            className={cn(
              "oui-flex oui-flex-1 oui-cursor-pointer oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-py-[11px]",
              isMobile ? "oui-bg-base-5" : "oui-bg-base-10",
            )}
            onClick={() => connect(item)}
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
