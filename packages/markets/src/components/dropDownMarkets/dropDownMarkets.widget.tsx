import React, { PropsWithChildren } from "react";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useMarketCategories } from "../shared/hooks/useMarketCategories";
import { useDropDownMarketsScript } from "./dropDownMarkets.script";
import { DropDownMarkets, DropDownMarketsProps } from "./dropDownMarkets.ui";

export type DropDownMarketsWidgetProps = MarketsProviderProps &
  Pick<
    DropDownMarketsProps,
    | "contentClassName"
    | "renderTabContent"
    | "renderTabBeforeContent"
    | "renderTabAfterContent"
  >;

export type DropDownMarketsExtensionProps = Pick<
  DropDownMarketsWidgetProps,
  | "tabs"
  | "renderTabContent"
  | "renderTabBeforeContent"
  | "renderTabAfterContent"
>;

export const DropDownMarketsWidget: React.FC<
  PropsWithChildren<DropDownMarketsWidgetProps>
> = (props) => {
  const state = useDropDownMarketsScript();
  const defaultTabs = useMarketCategories("dropDownMarkets");
  const tabs = props.tabs ?? defaultTabs;

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={(symbol) => {
        state.hide();
        props.onSymbolChange?.(symbol);
      }}
      tabs={tabs}
    >
      <DropDownMarkets
        {...state}
        contentClassName={props.contentClassName}
        renderTabContent={props.renderTabContent}
        renderTabBeforeContent={props.renderTabBeforeContent}
        renderTabAfterContent={props.renderTabAfterContent}
      >
        {props.children}
      </DropDownMarkets>
    </MarketsProvider>
  );
};
