import { FC } from "react";
import { Box, Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/widget";
import { MarketsProvider, MarketsProviderProps } from "./provider";

export type MarketsHomePageProps = MarketsProviderProps;

export const MarketsHomePage: FC<MarketsHomePageProps> = (props) => {
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <Box id="oui-markets-home-page" className="oui-font-semibold" p={6}>
        <Text size="2xl" weight="semibold">
          Markets
        </Text>

        <MarketsHeaderWidget />

        <MarketsDataListWidget />
      </Box>
    </MarketsProvider>
  );
};
