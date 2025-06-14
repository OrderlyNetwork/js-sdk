import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  cn,
  Input,
  TabPanel,
  Tabs,
  Text,
} from "@orderly.network/ui";
import { FavoritesIcon, SearchIcon } from "../../icons";
import { MarketsTabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import { getMarketsSheetColumns } from "./column";
import { MarketsSheetScriptReturn } from "./marketsSheet.script";

export type MarketsSheetProps = MarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className, tabSort, onTabSort } = props;
  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const { t } = useTranslation();

  const { renderHeader, dataFilter } = useFavoritesProps();

  const renderTab = (type: MarketsTabName) => {
    const isFavorite = type === MarketsTabName.Favorites;
    const extraProps = isFavorite ? { renderHeader, dataFilter } : {};

    return (
      <MarketsListWidget
        type={type}
        initialSort={tabSort[type]}
        onSort={onTabSort(type)}
        getColumns={getMarketsSheetColumns}
        tableClassNames={{
          root: "!oui-bg-base-8 oui-pb-[calc(env(safe-area-inset-bottom))]",
          scroll: isFavorite
            ? "oui-h-[calc(100%_-_70px)]"
            : "oui-h-[calc(100%_-_40px)]",
        }}
        {...extraProps}
      />
    );
  };

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
      classNames={{ root: "oui-border oui-border-line oui-mt-4" }}
      size="sm"
      prefix={
        <Box pl={3} pr={1}>
          <SearchIcon className="oui-text-base-contrast-36" />
        </Box>
      }
      suffix={
        searchValue && (
          <Box mr={2}>
            <CloseCircleFillIcon
              size={14}
              className="oui-cursor-pointer oui-text-base-contrast-36"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
    />
  );
  return (
    <Box height="100%" className={cn("oui-font-semibold", className)}>
      <Box px={3} mt={3} mb={2}>
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
        {search}
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
