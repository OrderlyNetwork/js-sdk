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
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-border-none oui-px-2 oui-py-[11px]",
          "oui-bg-[#333948]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "email" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/email.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-static">
          {t("connector.privy.email")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("google")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-border-none oui-px-2 oui-py-[11px]",
          "oui-bg-[#335FFC]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "google" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/google.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-static">
          {t("connector.privy.google")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("twitter")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-border-none oui-px-2 oui-py-[11px]",
          "oui-bg-[#07080A]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "twitter" })}
      >
        <img
          src="https://oss.orderly.network/static/sdk/privy/twitter.svg"
          className="oui-size-[18px]"
        />
        <div className="oui-text-2xs oui-text-base-static">
          {t("connector.privy.twitter")}
        </div>
      </div>,
    );
  }
  if (loginMethods?.includes("telegram")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-border-none oui-px-2 oui-py-[11px]",
          "oui-bg-[#3D79A9]",
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
            className="oui-fill-white"
          />
        </svg>
        <div className="oui-text-2xs oui-text-base-static">
          {t("connector.privy.telegram")}
        </div>
      </div>,
    );
  }

  if (loginMethods?.includes("discord")) {
    arr.push(
      <div
        className={cn(
          "oui-flex oui-cursor-pointer oui-items-center oui-justify-center oui-gap-1 oui-rounded-[6px] oui-border-none oui-px-2 oui-py-[11px]",
          "oui-bg-[#5865F2]",
        )}
        onClick={() => connect({ walletType: "privy", extraType: "discord" })}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.244 3.736A14.78 14.78 0 0 0 11.578 2.6a.055.055 0 0 0-.058.027c-.158.281-.333.648-.456.937a13.65 13.65 0 0 0-4.123 0 9.485 9.485 0 0 0-.463-.937.057.057 0 0 0-.058-.027 14.74 14.74 0 0 0-3.665 1.136.052.052 0 0 0-.024.02C.444 7.246-.27 10.65.08 14.014a.062.062 0 0 0 .023.042 14.83 14.83 0 0 0 4.475 2.262.058.058 0 0 0 .063-.02c.345-.471.652-.968.916-1.49a.057.057 0 0 0-.031-.079 9.77 9.77 0 0 1-1.398-.667.058.058 0 0 1-.006-.096c.094-.07.188-.144.278-.218a.056.056 0 0 1 .058-.008c2.93 1.339 6.103 1.339 8.999 0a.056.056 0 0 1 .059.007c.09.075.184.148.279.219a.058.058 0 0 1-.005.096 9.16 9.16 0 0 1-1.4.667.058.058 0 0 0-.03.08c.27.521.577 1.018.915 1.489a.057.057 0 0 0 .063.02 14.78 14.78 0 0 0 4.483-2.262.058.058 0 0 0 .023-.041c.42-3.89-.703-7.265-2.974-10.258a.045.045 0 0 0-.024-.021ZM6.05 11.965c-.881 0-1.607-.81-1.607-1.804 0-.995.712-1.804 1.607-1.804.902 0 1.621.816 1.607 1.804 0 .995-.712 1.804-1.607 1.804Zm5.943 0c-.882 0-1.607-.81-1.607-1.804 0-.995.711-1.804 1.607-1.804.901 0 1.62.816 1.606 1.804 0 .995-.705 1.804-1.606 1.804Z"
            className="oui-fill-white"
          />
        </svg>
        <div className="oui-text-2xs oui-text-base-static">
          {t("connector.privy.discord")}
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
