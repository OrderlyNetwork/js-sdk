import { FC } from "react";
import Split from "@uiw/react-split";
import { AccountInfo } from "@/block/accountStatus/full";

export const TradingPage: FC = () => {
  return (
    <Split lineBar style={{ height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1 }}>
        <Split mode="vertical" lineBar>
          <Split style={{ height: "50%" }} lineBar>
            <div style={{ flex: 1 }}>Left Pane</div>
            <div>Right Pane</div>
          </Split>
          <div style={{ height: "30%" }}></div>
        </Split>
      </div>
      <div>
        <AccountInfo />
      </div>
    </Split>
  );
};
