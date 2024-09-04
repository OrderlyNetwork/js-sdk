import { DataListTabType, useDataListScript } from "./dataList.script";
import { DataList } from "./dataList.ui";

export const DataListWidget = (props: { current?: DataListTabType }) => {
  const state = useDataListScript({ current: props.current });
  return <DataList {...state} />;
};
