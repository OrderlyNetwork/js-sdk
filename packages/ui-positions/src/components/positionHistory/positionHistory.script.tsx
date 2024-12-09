import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { PositionHistoryProps } from "./positionHistory.widget";
import { API } from "@orderly.network/types";

export type PositionHistoryExt = API.PositionHistory & {
  netPnL?: number;
}

export const usePositionHistoryScript = (props: PositionHistoryProps) => {
  const { onSymbolChange } = props;
  const { data, isLoading } = usePrivateQuery<PositionHistoryExt[]>(
    "/v1/position_history?limit=1000",
    {
      formatter(data) {
        return (data.rows ?? null)?.map((item: API.PositionHistory): PositionHistoryExt => {
          if (
            item.realized_pnl &&
            item.accumulated_funding_fee &&
            item.trading_fee
          ) {
            const netPnL =
              (item.realized_pnl) -
              (item.accumulated_funding_fee) -
              (item.trading_fee);
            return {
              ...item,
              netPnL: netPnL,
            };
          }
          return item;
        });
      },
    }
  );

  const symbolsInfo = useSymbolsInfo();

  const dataSource = useDataTap(data, {
    accountStatus: AccountStatusEnum.EnableTrading,
  });

  return {
    dataSource,
    isLoading,
    onSymbolChange,
    symbolsInfo,
  };
};

export type PositionHistoryState = ReturnType<typeof usePositionHistoryScript>;
