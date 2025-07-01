import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Button,
  cn,
  EmptyStateIcon,
  Flex,
  PlusIcon,
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import { FavoritesIcon } from "../../icons";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { SearchInput } from "../searchInput.tsx";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import { getMarketsSheetColumns } from "./column";
import { MarketsSheetScriptReturn } from "./marketsSheet.script";

export type MarketsSheetProps = MarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className, tabSort, onTabSort } = props;

  const { t } = useTranslation();

  const { getFavoritesProps } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    const isFavorites = type === MarketsTabName.Favorites;
    return (
      <MarketsListWidget
        type={type}
        initialSort={tabSort[type]}
        onSort={onTabSort(type)}
        getColumns={getMarketsSheetColumns}
        tableClassNames={{
          root: "!oui-bg-base-8",
          scroll: cn(
            "oui-pb-[env(safe-area-inset-bottom,_20px)]",
            isFavorites
              ? "oui-h-[calc(100%_-_70px)]"
              : "oui-h-[calc(100%_-_40px)]",
          ),
        }}
        emptyView={
          isFavorites ? (
            <Flex
              direction="column"
              itemAlign="center"
              gapY={4}
              className="oui-h-[calc(100%_-_70px)] oui-text-center"
            >
              <EmptyStateIcon />
              <Button
                color="gray"
                size="xs"
                className="oui-bg-base-4"
                onClick={() => {
                  props.onTabChange(MarketsTabName.All);
                }}
              >
                <PlusIcon
                  className="oui-mr-1 oui-text-base-contrast"
                  opacity={1}
                  size={12}
                />
                <Text intensity={98}>
                  {t("markets.favorites.addFavorites")}
                </Text>
              </Button>
            </Flex>
          ) : undefined
        }
        {...getFavoritesProps(type)}
      />
    );
  };

  return (
    <Box height="100%" className={cn("oui-font-semibold", className)}>
      <Box px={3} mt={3} mb={2}>
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
        <SearchInput classNames={{ root: "oui-mt-4" }} />
      </Box>

      <Tabs
        variant="contained"
        size="md"
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        classNames={{
          tabsList: cn("oui-my-[6px]"),
          tabsContent: "oui-h-full",
          scrollIndicator: "oui-mx-3",
        }}
        className="oui-h-[calc(100%_-_92px)]"
        showScrollIndicator
      >
        <TabPanel
          title={t("markets.favorites")}
          icon={<FavoritesIcon />}
          value={MarketsTabName.Favorites}
        >
          {renderTab(MarketsTabName.Favorites)}
        </TabPanel>

        <TabPanel title={t("common.all")} value={MarketsTabName.All}>
          {renderTab(MarketsTabName.All)}
        </TabPanel>
      </Tabs>
    </Box>
  );
};
