import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useCollapseMarketsScript } from "./collapseMarkets.script";
import { CollapseMarkets, CollapseMarketsProps } from "./collapseMarkets.ui";

export type CollapseMarketsWidgetPros = MarketsProviderProps &
  Pick<CollapseMarketsProps, "dataSource">;

export const CollapseMarketsWidget: React.FC<CollapseMarketsWidgetPros> = (
  props
) => {
  const state = useCollapseMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <CollapseMarkets {...state} dataSource={props.dataSource} />
    </MarketsProvider>
  );
};
