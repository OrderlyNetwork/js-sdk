import { PositionsProps } from "@orderly.network/ui-positions";
import { DataListTabType, useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget = (props: {
  current?: DataListTabType;
  config: PositionsProps & {
    /**
     * If symbol is passed in as undefined or null, the positions of all symbols will be calculated
     */
    symbol?: string;
    unPnlPriceBasis: "markPrice" | "lastPrice";
  };
}) => {
  const state = useDataListScript(props);
  return <DataList {...state} />;
};
