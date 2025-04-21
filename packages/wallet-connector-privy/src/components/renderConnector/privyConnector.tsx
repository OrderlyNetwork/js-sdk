import React from "react";
import { cn } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";
import { useWalletConnectorPrivy } from "../../provider";
import { useScreen } from "@orderly.network/ui";

export function PrivyConnectArea({ connect }: { connect: (type: any) => void }) {
  const { t } = useTranslation();
  const { isMobile, isDesktop } = useScreen();
  const { connectorWalletType } = useWalletConnectorPrivy();
  return (
    <div className="">
      <div
        className={cn(
          "oui-flex oui-items-center oui-justify-between",
          "oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-3",
          "md:oui-mb-2"
        )}
      >
        {t("connector.privy.loginIn")}
        {isMobile && (
          <div className="oui-h-3 oui-flex oui-justify-center">
            <img
              src="https://oss.orderly.network/static/sdk/privy/privy-logo.png"
              className=" oui-h-[10px]"
            />
          </div>
        )}
      </div>
      <div
        className={cn(
          "oui-grid oui-grid-cols-2 oui-gap-2",
          "md:oui-flex md:oui-flex-col md:oui-gap-2"
        )}
      >
        <div
          className="oui-cursor-pointer oui-rounded-[6px] oui-bg-[#333948] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1"
          onClick={() => connect({ walletType: "privy", extraType: "email" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/email.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.email")}
          </div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#335FFC] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: "privy", extraType: "google" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/google.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.google")}
          </div>
        </div>

        <div
          className="oui-rounded-[6px] oui-bg-[#07080A] oui-px-2 oui-py-[11px] oui-flex oui-justify-center oui-items-center oui-gap-1 oui-cursor-pointer"
          onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
            className="oui-w-[18px] oui-h-[18px]"
          />
          <div className="oui-text-base-contrast oui-text-2xs">
            {t("connector.privy.twitter")}
          </div>
        </div>
      </div>
      {isDesktop && (
        <div className="oui-h-3 oui-flex oui-justify-center oui-mt-4">
          <img
            src="https://oss.orderly.network/static/sdk/privy/privy-logo.png"
            className=" oui-h-[10px]"
          />
        </div>
      )}
      {(!connectorWalletType.disableWagmi ||
        !connectorWalletType.disableSolana) && (
        <div className="oui-h-[1px] oui-bg-line oui-w-full oui-mt-4 md:oui-mt-5"></div>
      )}
    </div>
  );
}