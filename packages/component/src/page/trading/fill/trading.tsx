import { FC, useEffect } from "react";
import Split from "@uiw/react-split";
import { AccountInfo } from "@/block/accountStatus/full";
import { PositionsViewFull } from "@/block/positions";
import { MyOrderBook } from "../xs/sections/orderbook";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../xs/sections/orderEntry";
import { Divider } from "@/divider";
import { TopNav } from "./sections/nav/topNav";
import { MyOrderBookAndTrade } from "./sections/orderbook_trade";

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
            <div style={{ flex: 1 }}>
              <div className="orderly-h-[48px] orderly-border-b orderly-border-b-divider">
                <TopNav symbol={props.symbol} />
              </div>
              <div>Left Pane</div>
            </div>
            <div style={{ minWidth: "280px", width: "280px" }}>
              <MyOrderBookAndTrade symbol={props.symbol} />
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
      <div style={{ minWidth: "300px" }}>
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
