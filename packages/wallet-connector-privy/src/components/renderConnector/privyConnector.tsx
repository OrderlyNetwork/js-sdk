import React, { useMemo } from "react";
import { PrivyClientConfig } from "@privy-io/react-auth";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Grid } from "@orderly.network/ui";
import { useScreen } from "@orderly.network/ui";
import { useWalletConnectorPrivy } from "../../provider";

const RenderLoginMethodsDom = ({
  connect,
  loginMethods,
}: {
  connect: (type: any) => void;
  loginMethods?: PrivyClientConfig["loginMethods"];
}) => {
  const { t } = useTranslation();
  const { isDesktop } = useScreen();
  const arr = [];
  if (loginMethods?.includes("email")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          "oui-border-none oui-bg-[#333948]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "email" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/email.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-contrast">
          {t("connector.privy.email")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("google")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          "oui-border-none oui-bg-[#335FFC]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "google" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/google.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-contrast">
          {t("connector.privy.google")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("twitter")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          "oui-border-none oui-bg-[#07080A]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-contrast">
          {t("connector.privy.twitter")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("telegram")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          "oui-border-none oui-bg-[#3D79A9]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "telegram" })}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.652 8.12916L15.0683 4.04929C15.6468 3.87358 16.1499 4.16929 15.9587 4.91069L13.8458 13.3962C13.6898 13.9961 13.2672 14.1461 12.6836 13.859L9.46384 11.8362L7.90929 13.109C7.73824 13.2547 7.59234 13.379 7.2603 13.379L7.4867 10.5891L13.4584 5.99923C13.72 5.80638 13.398 5.69495 13.0559 5.8878L5.68061 9.8434L2.50107 8.99914C1.81687 8.81058 1.80178 8.41201 2.652 8.12916Z"
            fill="white"
          />
        </svg>
        <div className="oui-text-2xs oui-text-base-contrast">
          {t("connector.privy.telegram")}
        </div>
      </div>,
    );
  }
  return arr.map((item, index) => {
    return <div key={index}>{item}</div>;
  });
};

const PrivyConnectAreaMobile = ({
  connect,
}: {
  connect: (type: any) => void;
}) => {
  const { t } = useTranslation();
  const { isMobile, isDesktop } = useScreen();
  const { connectorWalletType, privyConfig } = useWalletConnectorPrivy();
  const loginMethods = privyConfig.loginMethods;
  return (
    <Flex direction="column" className="oui-w-full">
      <Grid cols={2} rows={2} className="oui-w-full" gap={2}>
        <RenderLoginMethodsDom connect={connect} loginMethods={loginMethods} />
      </Grid>
      {(!connectorWalletType.disableWagmi ||
        !connectorWalletType.disableSolana) && (
        <div className="oui-mt-4 oui-h-px oui-w-full oui-bg-line md:oui-mt-5"></div>
      )}
    </Flex>
  );
};

const PrivyConnectAreaDesktop = ({
  connect,
}: {
  connect: (type: any) => void;
}) => {
  const { t } = useTranslation();
  const { connectorWalletType, privyConfig } = useWalletConnectorPrivy();
  const loginMethods = privyConfig.loginMethods;
  return (
    <Flex direction="column" itemAlign={"start"} className="oui-w-full">
      <Grid cols={1} gap={2} className="oui-w-full">
        <RenderLoginMethodsDom connect={connect} loginMethods={loginMethods} />
      </Grid>
      {(!connectorWalletType.disableWagmi ||
        !connectorWalletType.disableSolana) && (
        <div className="oui-mt-4 oui-h-px oui-w-full oui-bg-line md:oui-mt-5"></div>
      )}
    </Flex>
  );
};

export function PrivyConnectArea({
  connect,
}: {
  connect: (type: any) => void;
}) {
  const { isDesktop } = useScreen();
  if (isDesktop) {
    return <PrivyConnectAreaDesktop connect={connect} />;
  }
  return <PrivyConnectAreaMobile connect={connect} />;
}
