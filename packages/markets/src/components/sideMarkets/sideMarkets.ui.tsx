import { FC } from "react";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import {
  UseSideMarketsScriptOptions,
  UseSideMarketsScriptReturn,
} from "./sideMarkets.script";
import { CollapseIcon, ExpandIcon } from "../../icons";
import { ExpandMarketsWidget } from "../expandMarkets";
import { FavoritesListWidget } from "../favoritesList";
import { RecentListWidget } from "../recentList";
import { MarketsListWidget } from "../marketsList";
import { NewListingListWidget } from "../newListingList";
import { useMarketsContext } from "../marketsProvider";

export type SideMarketsProps = UseSideMarketsScriptReturn & {
  className?: string;
};

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { collapsed, onCollapse, activeTab, onTabChange, className } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

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

    if (activeTab === "favorites") {
      return <FavoritesListWidget collapsed={collapsed} />;
    }

    if (activeTab === "recent") {
      return <RecentListWidget collapsed={collapsed} />;
    }

    if (activeTab === "newListing") {
      return <NewListingListWidget collapsed={collapsed} />;
    }

    return (
      <MarketsListWidget
        type="all"
        sortKey="24h_amount"
        sortOrder="desc"
        collapsed={collapsed}
      />
    );
  };

  return (
    <Flex
      className={cn("oui-font-semibold", className)}
      direction="column"
      gapY={5}
      height="100%"
      width="100%"
    >
      <SideMarketsHeader collapsed={collapsed} onCollapse={onCollapse} />
      <Box
        width="100%"
        className={cn(
          collapsed ? "oui-h-[calc(100%_-_52px)]" : "oui-h-[calc(100%_-_56px)]"
        )}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
};

type SideMarketsHeaderProps = UseSideMarketsScriptOptions;

export const SideMarketsHeader: FC<SideMarketsHeaderProps> = (props) => {
  const { collapsed, onCollapse } = props;

  if (collapsed) {
    return (
      <ExpandIcon
        className="oui-text-base-contrast-36 hover:oui-text-base-contrast-80 oui-cursor-pointer"
        onClick={() => {
          onCollapse?.(false);
        }}
      />
    );
  }

  return (
    <Flex justify="between" px={3} width="100%">
      <Text size="base" intensity={80}>
        Markets
      </Text>
      <CollapseIcon
        className="oui-text-base-contrast-36 hover:oui-text-base-contrast-80 oui-cursor-pointer"
        onClick={() => {
          onCollapse?.(true);
        }}
      />
    </Flex>
  );
};
