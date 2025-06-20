import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import {
  useExpandMarketsScript,
  ExpandMarketsScriptOptions,
} from "./expandMarkets.script";
import { ExpandMarkets } from "./expandMarkets.ui";

export type ExpandMarketsWidgetProps = MarketsProviderProps &
  ExpandMarketsScriptOptions;

export const ExpandMarketsWidget: React.FC<ExpandMarketsWidgetProps> = (
  props,
) => {
  const state = useExpandMarketsScript({
    activeTab: props.activeTab,
    onTabChange: props.onTabChange,
  });

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <ExpandMarkets {...state} />
    </MarketsProvider>
  );
};
