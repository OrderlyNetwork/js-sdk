import React from "react";
import type { PositionsProps } from "@orderly.network/ui-positions";
import type { TradingPageProps } from "../../../types/types";
import { DataListTabType, useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget: React.FC<
  { current?: DataListTabType } & PositionsProps &
    Pick<TradingPageProps, "dataListProductContent">
> = (props) => {
  const state = useDataListScript(props);
  return <DataList {...state} />;
};
