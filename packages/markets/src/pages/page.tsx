import { Text } from "@orderly.network/ui";
import { MarketsDataListWidget } from "./dataList";
import { MarketsHeaderWidget } from "./header/header.widget";

export const MarketsPage = () => {
  return (
    <div className="" id="oui-markets-header">
      <Text size="2xl" weight="semibold">
        Markets
      </Text>

      <MarketsHeaderWidget />

      <MarketsDataListWidget />
    </div>
  );
};
