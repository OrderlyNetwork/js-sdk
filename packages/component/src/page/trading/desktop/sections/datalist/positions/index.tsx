import { FC, useContext } from "react";
import { PositionsViewFull } from "@/block/positions";
import { usePositionStream, } from "@orderly.network/hooks";
import {
  API,
  AccountStatusEnum,
} from "@orderly.network/types";
import { useAccount } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page";
import { useTabContext } from "@/tab/tabContext";

export const PositionPane: FC<{
  unPnlPriceBasis: any;
  setUnPnlPriceBasic: any;
}> = (props) => {
  const context = useContext(TradingPageContext);
  const { data: tabExtraData } = useTabContext();

  const calcMode = tabExtraData.unPnlPriceBasis === 0 ? "markPrice" : "lastPrice";
  
  const [data, info, { loading }] = usePositionStream(tabExtraData.showAllSymbol ? undefined : context.symbol, {calcMode});
  const { state } = useAccount();

  const {
    data: { pnlNotionalDecimalPrecision },
  } = useTabContext();


  return (
    <PositionsViewFull
      dataSource={
        state.status < AccountStatusEnum.EnableTrading ? [] : data.rows
      }
      aggregated={data.aggregated}
      isLoading={loading}
      showAllSymbol={tabExtraData.showAllSymbol}
      onSymbolChange={context.onSymbolChange}
      pnlNotionalDecimalPrecision={pnlNotionalDecimalPrecision}
      {...props}
    />
  );
};
