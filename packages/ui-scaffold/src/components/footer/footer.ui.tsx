import { FC, useMemo } from "react";
import { Divider, Flex, Text } from "@orderly.network/ui";
import {
  CommuntiyDiscordIcon,
  CommuntiyTelegramIcon,
  CommuntiyXIcon,
  OrderlyTextIcon,
  SignalIcon,
} from "../icons/index";
import { FooterReturns } from "./footer.script";
import { WsNetworkStatus } from "@orderly.network/hooks";
import { FooterProps } from "./footer.widget";

export const Footer: FC<FooterReturns & FooterProps> = (props) => {
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
      height={28}
      px={3}
      width={"100%"}
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
        <Flex gap={2}>
          <Text intensity={54} size="2xs">
            Join our community
          </Text>
          <Flex direction={"row"} gap={1}>
            {typeof props.telegramUrl !== "undefined" && (
              <CommuntiyTelegramIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.telegramUrl)}
              />
            )}
            {typeof props.discordUrl !== "undefined" && (
              <CommuntiyDiscordIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.discordUrl)}
              />
            )}
            {typeof props.twitterUrl !== "undefined" && (
              <CommuntiyXIcon
                className="oui-fill-white/[.54] hover:oui-fill-white/[.98] oui-cursor-pointer"
                fill="currentColor"
                fillOpacity={1}
                onClick={(e) => openUrl(props.twitterUrl)}
              />
            )}
          </Flex>
          {typeof props?.trailing !== "undefined" && (
            <>
              <Divider
                direction="vertical"
                className="oui-h-[18px] oui-border-line-12"
              />
              {props?.trailing}
            </>
          )}
        </Flex>
      </Flex>
      <Flex direction={"row"} gap={1}>
        <Text intensity={54} size="2xs">
          Powered by
        </Text>
        <OrderlyTextIcon />
      </Flex>
    </Flex>
  );
};
