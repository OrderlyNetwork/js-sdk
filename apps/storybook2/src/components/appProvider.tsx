import { FC, PropsWithChildren } from "react";
import { OrderlyAppProvider } from "@orderly.network/react";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { CustomConfigStore } from "../constants/CustomConfigStore.ts";
import { onboardOptions } from "../constants/onboardOptions.ts";

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const networkId = "testnet";
  const configStore = new CustomConfigStore({ networkId, env: "qa" });
  return (
    <ConnectorProvider options={onboardOptions}>
      <OrderlyAppProvider
        networkId={networkId ?? "testnet"}
        brokerId="orderly"
        brokerName="Orderly"
        // configStore={configStore}
        // contracts={new CustomContractManager(configStore)}
        referral={{
          saveRefCode: true,
          onClickReferral: () => {
            console.log("click referral");
          },
          onBoundRefCode: (success, error) => {},
        }}
        appIcons={{
          main: {
            img: "/orderly-logo.svg",
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        }}
        footerStatusBarProps={{
          xUrl: "https://twitter.com/OrderlyNetwork",
          // telegramUrl: "https://orderly.network",
          discordUrl: "https://discord.com/invite/orderlynetwork",
        }}
        shareOptions={{
          pnl: {
            backgroundImages: [
              "/images/poster_bg_1.png",
              "/images/poster_bg_2.png",
              "/images/poster_bg_3.png",
              "/images/poster_bg_4.png",
              "/images/poster_bg_5.png",
            ],
          },
        }}
        onChainChanged={(networkId, isTestnet) => {
          console.log("network changed", networkId, isTestnet);
          localStorage.setItem(
            "preview-orderly-networkId",
            isTestnet ? "testnet" : "mainnet"
          );
          // realod page
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }}
      >
        {children}
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
};
