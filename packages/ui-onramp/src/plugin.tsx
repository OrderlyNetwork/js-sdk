import React from "react";
import { createInterceptor } from "@orderly.network/plugin-core";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { BuyCryptoIcon } from "./components/icons";
import { OnrampForm } from "./components/onrampForm";

export function registerOnrampPlugin() {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "orderly-onramp",
      name: "Buy Crypto (Onramper)",
      version: "1.0.0",
      interceptors: [
        createInterceptor("Transfer.DepositAndWithdraw", (Original, props) => {
          const onrampTab = {
            id: "onramp",
            title: "Buy Crypto",
            icon: (
              <div className="oui-flex oui-items-center oui-justify-center">
                <BuyCryptoIcon
                  width={11}
                  height={11}
                  className="oui-mt-0.5 oui-ml-0.5"
                />
              </div>
            ),
            component: OnrampForm,
            order: 30,
          };
          const extraTabs = [
            ...(Array.isArray(props.extraTabs) ? props.extraTabs : []),
            onrampTab,
          ];
          return <Original {...props} extraTabs={extraTabs} />;
        }),
      ],
    });
  };
}
