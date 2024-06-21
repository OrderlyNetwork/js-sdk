import { PerformanceUI } from "./performance.ui";
import { usePerformanceScript } from "./performance.script";

export const PerformanceWidget = () => {
  const state = usePerformanceScript();

  return <PerformanceUI {...state} />;
};
