import { Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/widget";
import { MarketsProvider } from "./provider";

export const MarketsHomePage = () => {
  return (
    <MarketsProvider>
      <div id="oui-markets-header" className="oui-font-semibold">
        <Text size="2xl" weight="semibold">
          Markets
        </Text>

        <MarketsHeaderWidget />

        <MarketsDataListWidget />
      </div>
    </MarketsProvider>
  );
};
