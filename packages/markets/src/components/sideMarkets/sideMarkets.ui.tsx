import React from "react";
import { Box, cn, Flex } from "@orderly.network/ui";
import { ExpandMarketsWidget } from "../expandMarkets";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import type { SideMarketsScriptReturn } from "./sideMarkets.script";

export type SideMarketsProps = SideMarketsScriptReturn & { className?: string };

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { activeTab, onTabChange, className, tabSort } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const { getFavoritesProps } = useFavoritesProps();

  const renderContent = () => {
    return (
      <ExpandMarketsWidget
        activeTab={activeTab}
        onTabChange={onTabChange}
        symbol={symbol}
        onSymbolChange={onSymbolChange}
      />
    );
  };

  return (
    <Flex
      id="oui-side-markets"
      className={cn("oui-relative oui-font-semibold", className)}
      direction="column"
      gapY={5}
      height="100%"
      width="100%"
    >
      <Box width="100%" height="100%">
        {renderContent()}
      </Box>
    </Flex>
  );
};
