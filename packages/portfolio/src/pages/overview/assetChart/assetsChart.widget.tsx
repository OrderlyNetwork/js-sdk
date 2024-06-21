import { useAssetsLineChartScript } from "./assetsChart.script";
import { AssetsChartUI } from "./assetsChart.ui";

export const AssetsChartWidget = () => {
  const state = useAssetsLineChartScript();
  return <AssetsChartUI {...state} />;
};
