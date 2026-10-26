import React from "react";
import type { SharePnLConfig } from "@orderly.network/ui-share";
import type { TradingPageState } from "../../../types/types";
import { useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget: React.FC<{
  symbol: string;
  className?: string;
  sharePnLConfig?: SharePnLConfig;
  dataListProductContent?: TradingPageState["dataListProductContent"];
}> = (props) => {
  const state = useDataListScript(props);
  return <DataList {...state} className={props.className} />;
};
