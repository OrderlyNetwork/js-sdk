import { FC } from "react";
import { Box, cn, Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/widget";
import {
  MarketsProvider,
  MarketsProviderProps,
} from "../../components/marketsProvider";

export type MarketsHomePageProps = MarketsProviderProps & {
  className?: string;
};

export const MarketsHomePage: FC<MarketsHomePageProps> = (props) => {
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <Box
        id="oui-markets-home-page"
        className={cn("oui-font-semibold", props.className)}
        p={6}
      >
        <Text size="2xl" weight="semibold">
          Markets
        </Text>

        <MarketsHeaderWidget />

        <MarketsDataListWidget />
      </Box>
    </MarketsProvider>
  );
};
