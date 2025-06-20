import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { CollapseIcon, ExpandIcon } from "../../icons";
import { ExpandMarketsWidget } from "../expandMarkets";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import {
  SideMarketsScriptOptions,
  SideMarketsScriptReturn,
} from "./sideMarkets.script";

export type SideMarketsProps = SideMarketsScriptReturn & {
  className?: string;
};

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const {
    collapsable,
    collapsed,
    onCollapse,
    activeTab,
    onTabChange,
    className,
    tabSort,
  } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const { getFavoritesProps } = useFavoritesProps();

  const renderContent = () => {
    if (!collapsed) {
      return (
        <ExpandMarketsWidget
          activeTab={activeTab}
          onTabChange={onTabChange}
          symbol={symbol}
          onSymbolChange={onSymbolChange}
        />
      );
    }

    return (
      <MarketsListWidget
        type={activeTab}
        initialSort={tabSort[activeTab]}
        // collapsed list is not custom sort, so we don't need to pass onSort
        // onSort={onTabSort(activeTab)}
        collapsed={collapsed}
        {...getFavoritesProps(activeTab)}
      />
    );
  };

  return (
    <Flex
      id="oui-side-markets"
      className={cn("oui-font-semibold", className)}
      direction="column"
      gapY={5}
      height="100%"
      width="100%"
    >
      <SideMarketsHeader
        collapsable={collapsable}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
      <Box
        width="100%"
        className={cn(
          collapsed ? "oui-h-[calc(100%_-_52px)]" : "oui-h-[calc(100%_-_56px)]",
        )}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
};

type SideMarketsHeaderProps = SideMarketsScriptOptions;

export const SideMarketsHeader: FC<SideMarketsHeaderProps> = (props) => {
  const { collapsable, collapsed, onCollapse } = props;

  const { t } = useTranslation();

  const cls = cn(
    "oui-text-base-contrast-36",
    collapsable
      ? "oui-cursor-pointer hover:oui-text-base-contrast-80"
      : "oui-cursor-not-allowed",
  );

  if (collapsed) {
    return (
      <ExpandIcon
        className={cls}
        onClick={() => {
          onCollapse?.(false);
        }}
      />
    );
  }

  return (
    <Flex justify="between" px={3} width="100%">
      <Text size="base" intensity={80}>
        {t("common.markets")}
      </Text>
      <CollapseIcon
        className={cls}
        onClick={() => {
          onCollapse?.(true);
        }}
      />
    </Flex>
  );
};
