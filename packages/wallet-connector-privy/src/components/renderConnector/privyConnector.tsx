import React, { useMemo } from "react";
import { PrivyClientConfig } from "@privy-io/react-auth";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { cn, Flex, Grid } from "@kodiak-finance/orderly-ui";
import { useScreen } from "@kodiak-finance/orderly-ui";
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
          isDesktop && "oui-border-none oui-bg-[#333948]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "email" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/email.svg"
          className="oui-size-[18px]"
        />
        {isDesktop && (
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.email")}
          </div>
        )}
      </div>,
    );
  }
  if (loginMethods?.includes("google")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          isDesktop && "oui-border-none oui-bg-[#335FFC]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "google" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/google.svg"
          className="oui-size-[18px]"
        />
        {isDesktop && (
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.google")}
          </div>
        )}
      </div>,
    );
  }
  if (loginMethods?.includes("twitter")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px]  oui-border oui-border-base-contrast-12 oui-px-2 oui-py-[11px]",
          isDesktop && "oui-border-none oui-bg-[#07080A]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
          className="oui-size-[18px]"
        />
        {isDesktop && (
          <div className="oui-text-2xs oui-text-base-contrast">
            {t("connector.privy.twitter")}
          </div>
        )}
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
      <Grid cols={3} rows={1} className="oui-w-full" gap={2}>
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
