import { Divider } from "@/divider";
import { PositionCell } from "./cell";
import { AggregatedData, PositionOverview } from "./overview";
import { ListView } from "@/listView";
import { FC } from "react";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";

interface PositionsViewProps {
  dataSource: any[] | null;
  aggregated: AggregatedData;
  // actions
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;
  onShowAllSymbolChange?: (isAll: boolean) => void;
  showAllSymbol?: boolean;
  onMarketCloseAll?: () => void;
  loadMore?: () => void;
  isLoading?: boolean;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const PositionsView: FC<PositionsViewProps> = (props) => {
  return (
    <StatisticStyleProvider
      labelClassName="orderly-text-3xs orderly-text-base-contrast/30"
      valueClassName="orderly-text-base-contrast/80"
    >
      <div>
        <PositionOverview
          onMarketCloseAll={props.onMarketCloseAll}
          aggregated={props.aggregated}
          onShowAllSymbolChange={props.onShowAllSymbolChange}
          showAllSymbol={props.showAllSymbol}
        />
        <Divider />
        <>
          <ListView.separated<any>
            dataSource={props.dataSource}
            renderItem={(item, index) => {
              return (
                <SymbolProvider symbol={item.symbol}>
                  <PositionCell
                    item={item}
                    onLimitClose={props.onLimitClose}
                    onMarketClose={props.onMarketClose}
                    onSymbolChange={props.onSymbolChange}
                  />
                </SymbolProvider>
              );
            }}
            renderSeparator={(item, index) => {
              return <Divider key={index} />;
            }}
            loadMore={props.loadMore}
          />
        </>
      </div>
    </StatisticStyleProvider>
  );
};
