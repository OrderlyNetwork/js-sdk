import { useMarketsDataListScript } from "./dataList.script";
import { MarketsDataList } from "./dataList.ui";

export const MarketsDataListWidget = () => {
  const state = useMarketsDataListScript();
  return <MarketsDataList {...state} />;
};
