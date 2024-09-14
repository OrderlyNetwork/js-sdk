import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useExpandMarketsScript } from "./expandMarkets.script";
import { ExpandMarkets } from "./expandMarkets.ui";

export type ExpandMarketsWidgetProps = MarketsProviderProps;

export const ExpandMarketsWidget: React.FC<ExpandMarketsWidgetProps> = (
  props
) => {
  const state = useExpandMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <ExpandMarkets {...state} />
    </MarketsProvider>
  );
};
