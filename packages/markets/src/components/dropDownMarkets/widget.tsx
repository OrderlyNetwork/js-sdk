import React, { PropsWithChildren } from "react";
import { useDropDownMarketsScript } from "./dropDownMarkets.script";
import { DropDownMarkets, DropDownMarketsProps } from "./dropDownMarkets.ui";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

export type DropDownMarketsWidgetProps = MarketsProviderProps &
  Pick<DropDownMarketsProps, "contentClassName">;

export const DropDownMarketsWidget: React.FC<
  PropsWithChildren<DropDownMarketsWidgetProps>
> = (props) => {
  const state = useDropDownMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <DropDownMarkets {...state} contentClassName={props.contentClassName}>
        {props.children}
      </DropDownMarkets>
    </MarketsProvider>
  );
};
