import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { PositionHistoryProps } from "./positionHistory.widget";

export const usePositionHistoryScript = (props: PositionHistoryProps) => {
    const { onSymbolChange } = props;
  const { data, isLoading } = usePrivateQuery("/v1/position_history?limit=1000", {
    formatter(data) {
        return data.rows ?? null;
    },
  });

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
