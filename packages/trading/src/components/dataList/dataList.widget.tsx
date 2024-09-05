import { PositionsProps } from "@orderly.network/ui-positions";
import { DataListTabType, useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget = (props: {
  current?: DataListTabType;
  config: Partial<Omit<PositionsProps, "pnlNotionalDecimalPrecision">>;
}) => {
  const state = useDataListScript(props);
  return <DataList {...state} />;
};
