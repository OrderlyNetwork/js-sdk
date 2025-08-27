import React from "react";
import type { OrderlyAppProviderProps } from "@orderly.network/react-app";
import {
  Box,
  cn,
  Flex,
  Tooltip,
  Text,
  useScreen,
  modal,
} from "@orderly.network/ui";
import { SpecialFee } from "./icons";

const info = `GODMODE ACTIVATED. ENJOY 0% MAKER AND 0.01% TAKER FEES ACROSS ALL TIERS UNTIL AUGUST 31.`;

const SpecialFeeSection: React.FC = () => {
  const { isMobile } = useScreen();
  if (isMobile) {
    return (
      <SpecialFee
        onClick={() => modal.dialog({ title: "Tips", content: info })}
      />
    );
  }
  return (
    <Tooltip
      content={info}
      className="oui-w-72 oui-max-w-72 oui-p-1 oui-text-base-contrast-54"
    >
      <SpecialFee className={"oui-cursor-pointer"} />
    </Tooltip>
  );
};

const specialFeeIsActive = true; // mock for sdk

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
  orderEntry: specialFeeIsActive
    ? {
        fees: {
          trailing: (original) => {
            return (
              <Flex itemAlign="center" justify="between" width={"100%"} gap={1}>
                {original}
                <SpecialFeeSection />
              </Flex>
            );
          },
        },
      }
    : undefined,
  feeTier: specialFeeIsActive
    ? {
        header: () => {
          return (
            <Box className="oui-w-full oui-px-4 oui-py-3 oui-rounded-xl oui-text-center oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)]">
              <Text.gradient color={"brand"}>
                GODMODE ACTIVATED.
                <br />
                ENJOY 0% MAKER AND 0.01% TAKER FEES ACROSS ALL TIERS UNTIL
                AUGUST 31.
              </Text.gradient>
            </Box>
          );
        },
        tag: () => {
          return (
            <Flex
              gap={1}
              justify="center"
              itemAlign="center"
              className="oui-rounded oui-px-1 oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)]"
            >
              <SpecialFee />
              <Text.gradient
                className="oui-select-none"
                color={"brand"}
                size="xs"
                weight="regular"
              >
                FEES NUKED
              </Text.gradient>
            </Flex>
          );
        },
        // table: () => null,
      }
    : undefined,
};
