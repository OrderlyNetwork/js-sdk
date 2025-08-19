import type { OrderlyAppProviderProps } from "@orderly.network/react-app";
import { Box, cn, Flex, Tooltip, Text } from "@orderly.network/ui";
import { SpecialFee } from "./icons";

export const widgetConfigs: OrderlyAppProviderProps["widgetConfigs"] = {
  scanQRCode: {
    onSuccess: (url) => {
      const urlObj = new URL(url);
      const { hostname, port, protocol } = window.location;
      urlObj.hostname = hostname;
      urlObj.port = port;
      urlObj.protocol = protocol;
      window.location.href = urlObj.toString();
    },
  },
  orderEntry: {
    fees: {
      trailing: (original) => {
        return (
          <Flex itemAlign="center" justify="between" width={"100%"} gap={1}>
            {original}
            <Tooltip
              className="oui-w-72 oui-max-w-72 oui-p-1 oui-text-base-contrast-54"
              content={`Special trading fees - valid until Aug 31. New fee tier rules coming in September`}
            >
              <SpecialFee className={cn("oui-cursor-pointer")} />
            </Tooltip>
          </Flex>
        );
      },
    },
  },
  feeTier: {
    header: () => (
      <Box className="oui-w-full oui-px-4 oui-py-3 oui-rounded-xl oui-text-center oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start))] oui-to-[rgb(var(--oui-gradient-brand-end))]">
        <Text.gradient color={"primary"} angle={45}>
          Special trading fees - valid until Aug 31.
          <br />
          New fee tier rules coming in September
        </Text.gradient>
      </Box>
    ),
    tag: () => <div>1234</div>,
    table: () => null,
  },
};
