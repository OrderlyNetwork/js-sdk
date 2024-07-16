import { Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/widget";

export const MarketsPage = () => {
  return (
    <div id="oui-markets-header" className="oui-font-semibold">
      <Text size="2xl" weight="semibold">
        Markets
      </Text>

      <MarketsHeaderWidget />

      <MarketsDataListWidget />
    </div>
  );
};
