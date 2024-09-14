import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useCollapseMarketsScript } from "./collapseMarkets.script";
import { CollapseMarkets } from "./collapseMarkets.ui";

export type CollapseMarketsWidgetPros = MarketsProviderProps;

export const CollapseMarketsWidget: React.FC<CollapseMarketsWidgetPros> = (
  props
) => {
  const state = useCollapseMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <CollapseMarkets {...state} />
    </MarketsProvider>
  );
};
