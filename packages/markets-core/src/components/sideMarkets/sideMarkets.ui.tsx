import React, { useMemo } from "react";
import {
  useLocalStorage,
  useRwaSymbolsInfoStore,
} from "@orderly.network/hooks";
import { Box, cn } from "@orderly.network/ui";
import { createCommunityBrokerFilter } from "../../hooks/useCommunityTabs";
import { MarketsTabName } from "../../type";
import { ExpandMarketsWidget } from "../expandMarkets";
import type { ExpandMarketsWidgetProps } from "../expandMarkets";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import {
  createRwaSubcategoryFilter,
  type RwaSubcategory,
} from "../rwaSubcategoryTabs";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import type { SideMarketsScriptReturn } from "./sideMarkets.script";

const EXPAND_RWA_SUB_TAB_KEY = "orderly_expand_markets_rwa_sel_sub_tab";
const EXPAND_COMMUNITY_SUB_TAB_KEY =
  "orderly_expand_markets_community_sel_sub_tab";

export type SideMarketsProps = SideMarketsScriptReturn & {
  className?: string;
  /** Forwarded to the expanded panel so hosts can add custom tabs (e.g. Prediction). */
  renderTabContent?: ExpandMarketsWidgetProps["renderTabContent"];
  tabs?: ExpandMarketsWidgetProps["tabs"];
} & { panelSize?: "small" | "middle" | "large" };

const BUILT_IN_TAB_NAMES = Object.values(MarketsTabName) as string[];

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { activeTab, onTabChange, className, tabSort, panelSize } = props;

  const { symbol, onSymbolChange } = useMarketsContext();
  const { getFavoritesProps } = useFavoritesProps();

  // Reuse expand-mode subcategory selection; collapsed UI has no secondary tabs.
  const [rwaSubcategory] = useLocalStorage<RwaSubcategory>(
    EXPAND_RWA_SUB_TAB_KEY,
    "all",
  );
  const [communitySubTab] = useLocalStorage<string>(
    EXPAND_COMMUNITY_SUB_TAB_KEY,
    "all",
  );
  const rwaSymbolsInfo = useRwaSymbolsInfoStore();

  const rwaDataFilter = useMemo(
    () => createRwaSubcategoryFilter(rwaSubcategory, rwaSymbolsInfo),
    [rwaSubcategory, rwaSymbolsInfo],
  );
  const communityDataFilter = useMemo(
    () => createCommunityBrokerFilter(communitySubTab),
    [communitySubTab],
  );

  const renderContent = () => {
    if (panelSize === "large") {
      return (
        <ExpandMarketsWidget
          activeTab={activeTab}
          onTabChange={onTabChange}
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          tabs={props.tabs}
          renderTabContent={props.renderTabContent}
        />
      );
    }

    // The collapsed strip has no tab row; a persisted custom-tab key (e.g.
    // "prediction") has no collapsed representation, so fall back to All.
    const collapsedTab = BUILT_IN_TAB_NAMES.includes(activeTab)
      ? (activeTab as MarketsTabName)
      : MarketsTabName.All;

    // Apply persisted show-low-vol preference without rendering the toggle UI.
    if (collapsedTab === MarketsTabName.Rwa) {
      return (
        <MarketsListWidget
          type={collapsedTab}
          dataFilter={rwaDataFilter}
          initialSort={tabSort[collapsedTab]}
          panelSize={"middle"}
        />
      );
    }
    if (collapsedTab === MarketsTabName.Community) {
      return (
        <MarketsListWidget
          type={MarketsTabName.All}
          dataFilter={communityDataFilter}
          initialSort={tabSort[MarketsTabName.Community]}
          panelSize={"middle"}
        />
      );
    }

    return (
      <MarketsListWidget
        type={collapsedTab}
        initialSort={tabSort[collapsedTab]}
        panelSize={"middle"}
        {...getFavoritesProps(collapsedTab)}
      />
    );
  };

  // Parent trading column uses flex-1/min-h-0; avoid nested calc heights that double-subtract.
  return (
    <Box
      width="100%"
      height="100%"
      className={cn(className, "oui-min-h-0 oui-min-w-0 oui-max-w-full")}
    >
      {renderContent()}
    </Box>
  );
};
