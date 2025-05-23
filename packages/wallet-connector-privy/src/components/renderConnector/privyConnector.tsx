import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn } from "@orderly.network/ui";
import { useScreen } from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../../provider";

export function PrivyConnectArea({
  connect,
}: {
  connect: (type: any) => void;
}) {
  const { t } = useTranslation();
  const { isMobile, isDesktop } = useScreen();
  const { connectorWalletType } = useWalletConnectorPrivy();
  return (
    <div className="">
      <div
        className={cn(
          "oui-flex oui-items-center oui-justify-between",
          "oui-mb-3 oui-text-sm oui-font-semibold oui-text-base-contrast-80",
          "md:oui-mb-2",
        )}
      >
        {t("connector.privy.loginIn")}
        {isMobile && (
          <div className="oui-flex oui-h-3 oui-justify-center">
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
          "md:oui-flex md:oui-flex-col md:oui-gap-2",
        )}
      >
        <div
          className="oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-bg-[#333948] oui-px-2 oui-py-[11px]"
          onClick={() => connect({ walletType: "privy", extraType: "email" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/email.svg"
            className="oui-size-[18px]"
          />
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.email")}
          </div>
        </div>

        <div
          className="oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-bg-[#335FFC] oui-px-2 oui-py-[11px]"
          onClick={() => connect({ walletType: "privy", extraType: "google" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/google.svg"
            className="oui-size-[18px]"
          />
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.google")}
          </div>
        </div>

        <div
          className="oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-bg-[#07080A] oui-px-2 oui-py-[11px]"
          onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
        >
          <img
            src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
            className="oui-size-[18px]"
          />
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.twitter")}
          </div>
        </div>
      </div>
      {isDesktop && (
        <div className="oui-mt-4 oui-flex oui-h-3 oui-justify-center">
          <img
            src="https://oss.orderly.network/static/sdk/privy/privy-logo.png"
            className=" oui-h-[10px]"
          />
        </div>
      )}
      {(!connectorWalletType.disableWagmi ||
        !connectorWalletType.disableSolana) && (
        <div className="oui-mt-4 oui-h-px oui-w-full oui-bg-line md:oui-mt-5"></div>
      )}
    </div>
  );
}
