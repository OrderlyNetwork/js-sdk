import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useExpandMarketsScript } from "./expandMarkets.script";
import { ExpandMarkets } from "./expandMarkets.ui";

export type ExpandMarketsWidgetPros = MarketsProviderProps;

export const ExpandMarketsWidget: React.FC<ExpandMarketsWidgetPros> = (
  props
) => {
  const state = useExpandMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <ExpandMarkets {...state} />
    </MarketsProvider>
  );
};
