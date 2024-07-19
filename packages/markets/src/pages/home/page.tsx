import { Box, Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/widget";
import { MarketsProvider } from "./provider";

export const MarketsHomePage = () => {
  return (
    <MarketsProvider>
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
