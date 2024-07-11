import {
  Card,
  FeeTierIcon,
  ServerFillIcon,
  TabPanel,
  Tabs,
} from "@orderly.network/ui";
import { ArrowLeftRightIcon } from "@orderly.network/ui";
import { UseMarketsDataListScript } from "./dataList.script";
import { FavoritesWidget } from "./favorites";
import { MarketListWidget } from "./marketList";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { active, onTabChange } = props;
  return (
    <Card>
      <Tabs value={active} onValueChange={onTabChange}>
        <TabPanel
          title="Favorites"
          icon={<ArrowLeftRightIcon />}
          value="favorites"
        >
          <FavoritesWidget />
        </TabPanel>
        <TabPanel title="All Markets" icon={<FeeTierIcon />} value="all">
          <MarketListWidget />
        </TabPanel>
        <TabPanel title="New listings" icon={<ServerFillIcon />} value="new">
          <MarketListWidget type="new" />{" "}
        </TabPanel>
      </Tabs>
    </Card>
  );
};
