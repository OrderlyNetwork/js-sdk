import { FC, useEffect } from "react";
import Split from "@uiw/react-split";
import { AccountInfo } from "@/block/accountStatus/full";
import { PositionsViewFull } from "@/block/positions";
import { MyOrderBook } from "../xs/sections/orderbook";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../xs/sections/orderEntry";
import { Divider } from "@/divider";

export const TradingPage: FC<TradingPageProps> = (props) => {
  useEffect(() => {
    document.body.style.setProperty(
      "--w-split-line-bar-background",
      "rgb(42, 46, 52)"
    );
  }, []);
  return (
    <Split lineBar style={{ height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1 }}>
        <Split mode="vertical" lineBar>
          <Split style={{ flex: 1 }} lineBar>
            <div style={{ flex: 1 }}>Left Pane</div>
            <div style={{ minWidth: "280px" }}>
              <div className="orderly-px-3">
                <MyOrderBook symbol={props.symbol} />
              </div>
            </div>
          </Split>
          <div style={{ height: "30%" }}>
            <PositionsViewFull
              dataSource={null}
              aggregated={{
                unsettledPnL: 0,
                unrealPnL: 0,
                unrealPnlROI: 0,
                notional: 0,
              }}
            />
          </div>
        </Split>
      </div>
      <div style={{ minWidth: "320px" }}>
        <div className="orderly-px-3">
          <AccountInfo />
        </div>
        <Divider className="orderly-my-3" />
        <div className="orderly-px-3">
          <MyOrderEntry symbol={props.symbol} />
        </div>
      </div>
    </Split>
  );
};
