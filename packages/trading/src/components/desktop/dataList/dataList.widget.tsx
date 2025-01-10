import { PositionsProps } from "@orderly.network/ui-positions";
import { DataListTabType, useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget = (
  props: {
    current?: DataListTabType;
  } & PositionsProps
) => {
  const state = useDataListScript({
    ...props,
  });
  return <DataList {...state} />;
};
