import { useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";
import { SharePnLConfig } from "@orderly.network/ui-share";

export const DataListWidget = (props: {
  symbol: string;
  className?: string;
  sharePnLConfig?: SharePnLConfig;
}) => {
  const state = useDataListScript(props);
  return <DataList {...state} className={props.className} />;
};
