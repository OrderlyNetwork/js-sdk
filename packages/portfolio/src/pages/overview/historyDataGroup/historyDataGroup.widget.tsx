import React from "react";
import { HistoryDataGroupUI } from "./historyDataGroup.ui";
import { useStateScript } from "./useState.script";

export const HistoryDataGroupWidget: React.FC = () => {
  const state = useStateScript();
  return <HistoryDataGroupUI {...state} />;
};
