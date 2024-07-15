import { Card, SimpleDialog, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { ArrowLeftRightIcon } from "@orderly.network/ui";
import { UseMarketsDataListScript } from "./dataList.script";
import { FavoritesWidget } from "./favorites";
import { MarketListWidget } from "./marketList";
import { AllMarketsIcon, FavoritesIcon, NewListingsIcon } from "../icons";

export type MarketsDataListProps = UseMarketsDataListScript;

export const MarketsDataList: React.FC<MarketsDataListProps> = (props) => {
  const { active, onTabChange } = props;
  return (
    <Card>
      <Tabs value={active} onValueChange={onTabChange}>
        <TabPanel title="Favorites" icon={<FavoritesIcon />} value="favorites">
          <FavoritesWidget />
        </TabPanel>
        <TabPanel title="All Markets" icon={<AllMarketsIcon />} value="all">
          <MarketListWidget />
        </TabPanel>
        <TabPanel title="New listings" icon={<NewListingsIcon />} value="new">
          <MarketListWidget type="new" />{" "}
        </TabPanel>
      </Tabs>
    </Card>
  );
};

export type DeleteFavoriteTabDialogProps = {
  tabName: string;
};

export const DeleteFavoriteTabDialog: React.FC<DeleteFavoriteTabDialogProps> = (
  props
) => {
  console.log("DeleteFavoriteTabDialog", props);
  // return (
  //   <Text size="sm">{`Are you sure you want to delete ${props.tabName}?`}</Text>
  // );
  return (
    <SimpleDialog
      open
      title="Delete list"
      actions={{
        primary: {
          label: "Confirm",
          onClick: () => {},
        },
        secondary: {
          label: "Cancel",
          onClick: () => {},
        },
      }}
    >
      <Text size="sm">{`Are you sure you want to delete ${props.tabName}?`}</Text>
    </SimpleDialog>
  );
};
