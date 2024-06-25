import { HistoryDataGroupUI } from "./historyDataGroup.ui";
import { useStateScript } from "./useState.script";

export const HistoryDataGroupWidget = () => {
  const state = useStateScript();
  return <HistoryDataGroupUI {...state} />;
};
