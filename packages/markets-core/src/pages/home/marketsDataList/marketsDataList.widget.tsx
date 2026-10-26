import React from "react";
import { useScreen } from "@orderly.network/ui";
import type { MarketTabContentRenderer } from "../../../components/shared/tabUtils";
import { MobileMarketsDataList } from "./marketsDataList.mobile.ui";
import { useMarketsDataListScript } from "./marketsDataList.script";
import { MarketsDataList } from "./marketsDataList.ui";

export const MarketsDataListWidget: React.FC<{
  renderTabContent?: MarketTabContentRenderer;
  /** Appends product content after a built-in market list. */
  renderTabAfterContent?: MarketTabContentRenderer;
}> = (props) => {
  const { isMobile } = useScreen();
  const state = useMarketsDataListScript();
  return isMobile ? (
    <MobileMarketsDataList
      {...state}
      renderTabContent={props.renderTabContent}
      renderTabAfterContent={props.renderTabAfterContent}
    />
  ) : (
    <MarketsDataList
      {...state}
      renderTabContent={props.renderTabContent}
      renderTabAfterContent={props.renderTabAfterContent}
    />
  );
};
