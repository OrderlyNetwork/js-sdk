import { FC, useMemo } from "react";
import {
  cn,
  
  Divider,
  Flex,
  
  Text,
} from "@orderly.network/ui";

import {CommuntiyDiscordIcon,
    CommuntiyTelegramIcon,
    CommuntiyXIcon,OrderlyNetworkTextIcon,
    SignalIcon,} from "../icons/index";

import { FooterReturns } from "./footer.script";
import { BaseIcon, BaseIconProps } from "@orderly.network/ui/src/icon/baseIcon";
import { WsNetworkStatus } from "@orderly.network/hooks";

export const FooterUI: FC<FooterReturns> = (props) => {
  const signalClsName = useMemo(() => {
    switch (props.wsStatus) {
      case WsNetworkStatus.Connected:
        return "oui-fill-success-light oui-text-success-light";
      case WsNetworkStatus.Disconnected:
        return "oui-fill-danger-light oui-text-danger-light";
      case WsNetworkStatus.Unstable:
        return "oui-fill-warning-light oui-text-warning-light";
    }
  }, [props.wsStatus]);

  const openUrl = (url?: string) => {
    window.open(url, "_blank");
  };

  return (
    <Flex
      direction={"row"}
      justify={"between"}
      height={29}
      px={3}
      className="oui-hidden lg:oui-flex oui-bg-base-9 oui-border-t-2 oui-border-line-6"
    >
      <Flex>
        <Flex
          direction={"row"}
          itemAlign={"center"}
          gap={1}
          className={signalClsName}
        >
          <SignalIcon
            // className={cn(signalClsName, "oui-fill-success-light")}
            fillOpacity={1}
            fill="currentColor"
          />
          <Text size="2xs">Operational</Text>
        </Flex>
        <Divider
          direction="vertical"
          className="oui-h-[18px] oui-px-1 oui-ml-2 oui-border-line-12"
        />
        <Flex>
          <Text intensity={54} size="2xs">
            Juon our community
          </Text>
          <Flex direction={"row"} gap={1}>
            {typeof props.config?.telegramUrl !== "undefined" && (
              <CommuntiyTelegramIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.config?.telegramUrl)}
              />
            )}
            {typeof props.config?.discordmUrl !== "undefined" && (
              <CommuntiyDiscordIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.config?.discordmUrl)}
              />
            )}
            {typeof props.config?.twitterUrl !== "undefined" && (
              <CommuntiyXIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.config?.twitterUrl)}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex direction={"row"} gap={1}>
        <Text intensity={54} size="2xs">
          Powered by
        </Text>
        <OrderlyNetworkTextIcon />
      </Flex>
    </Flex>
  );
};
