import { FC } from "react";
import Split from "@uiw/react-split";

export const TradingFull: FC = () => {
  return (
    <Split
      style={{ height: 100, border: "1px solid #d5d5d5", borderRadius: 3 }}
    >
      <div>Left Pane</div>
      <div>Center Pane</div>
      <div>Center Pane</div>
      <div style={{ flex: 1 }}>Right Pane</div>
    </Split>
  );
};
