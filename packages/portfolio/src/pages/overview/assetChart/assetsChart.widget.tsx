import { useAssetsChartScript } from "./assetsChart.script";
import { AssetsChart } from "./assetsChart.ui";

export const AssetsChartWidget = () => {
  const state = useAssetsChartScript();
  return <AssetsChart {...state} />;
};
