import { ChevronDownIcon, ChevronUpIcon, cn } from "@orderly.network/ui";
import React, { useState } from "react";
import { PrivyConnectorImagePath } from "../../util";
import { Tooltip } from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../../provider";
import { useWallet } from "../../hooks/useWallet";
import { WalletType } from "../../types";
import { useTranslation } from "@orderly.network/i18n";
export function AddAbstractWallet() {
  const [visible, setVisible] = useState(false);
  const onToggleVisibility = () => {
    setVisible(!visible);
  };
  const { connect } = useWallet();
  const { targetNamespace } = useWalletConnectorPrivy();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="oui-bg-[#07080A] oui-rounded-[8px] oui-px-2 oui-py-[11px]">
      <Tooltip
        className="oui-text-warning-darken oui-max-w-[200px] oui-z-[65]"
        open={open}
        content={t("connector.privy.addAbstractWallet.tips")}
      >
        <div className="oui-flex oui-items-center oui-justify-center oui-gap-1 ">
          <img
            src={`${PrivyConnectorImagePath}/abstract-transparent.png`}
            className="oui-w-[15px] oui-h-[15px]"
          />
          <div className="oui-text-base-contrast-80 oui-text-2xs oui-font-semibold">
            {t("connector.privy.addAbstractWallet")}
          </div>

          <button onClick={onToggleVisibility}>
            {visible ? (
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
          "oui-grid oui-grid-cols-2 oui-gap-2 oui-transition-height oui-duration-150 oui-overflow-hidden",
          visible ? "oui-max-h-0 oui-mt-0" : "oui-max-h-[400px] oui-mt-3"
        )}
      >
        <div
          className="oui-flex oui-items-center oui-justify-start oui-gap-1  oui-px-2 oui-py-[11px] oui-bg-[#131519] oui-cursor-pointer"
          onClick={() =>
            connect({
              walletType: WalletType.ABSTRACT,
            })
          }
        >
          <img
            className={cn("oui-w-[12px] oui-h-[12px]")}
            src={`${PrivyConnectorImagePath}/abstract.png`}
            alt="abstract wallet"
          />
          <div className="oui-text-base-contrast oui-text-2xs">Abstract</div>
        </div>
      </div>
    </div>
  );
}
