import { MarketsDataList } from "./dataList.ui";
import { useMarketsDataListScript } from "./dataList.script";

export const MarketsDataListWidget = () => {
  const state = useMarketsDataListScript();
  return <MarketsDataList {...state} />;
};
