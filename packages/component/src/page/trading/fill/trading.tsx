import { FC, useContext, useEffect } from "react";
import Split from "@uiw/react-split";
import { AccountInfo } from "@/block/accountStatus/desktop";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../xs/sections/orderEntry";
import { Divider } from "@/divider";
import { TopNav } from "./sections/nav/topNav";
import { MyOrderBookAndTrade } from "./sections/orderbook_trade";
import { MemoizedDataListView } from "./sections/datalist";
import { MyTradingView } from "./myTradingview";
import { Header } from "./sections/tradingHeader";
import { AssetsProvider } from "@/provider/assetsProvider";
import { SystemStatusBar } from "@/block/systemStatusBar";
import { useLayoutMeasure } from "./useLayoutMeasure";

interface PageProps {
  header?: React.ReactNode;
  logo?: React.ReactNode;
}

export const TradingPage: FC<TradingPageProps> = (props) => {
  const {} = useLayoutMeasure();

  useEffect(() => {
    document.body.style.setProperty(
      "--w-split-line-bar-background",
      "rgb(42, 46, 52)"
    );
    document.body.style.setProperty(
      "--w-split-line-bar-active-background",
      "#B64FFF"
    );
  }, []);

  return (
    <>
      <div className="orderly-app-trading-header orderly-border-b orderly-border-divider">
        {/** header component solt  */}
        <Header />
      </div>
      <Split lineBar style={{ height: "calc(100vh - 50px)", width: "100vw" }}>
        <div style={{ flex: 1 }}>
          <Split mode="vertical" lineBar>
            <Split
              style={{ flex: 1 }}
              className={"orderly-min-h-0 orderly-overflow-y-visible"}
              lineBar
            >
              <div
                style={{ flex: 1 }}
                className="orderly-grid orderly-grid-rows-[48px_1fr]"
              >
                <div className="orderly-border-b orderly-border-b-divider orderly-min-w-0">
                  <TopNav symbol={props.symbol} />
                </div>
                <div className="orderly-flex-1">
                  <MyTradingView />
                </div>
              </div>
              <div
                style={{ minWidth: "280px", width: "280px" }}
                className="orderly-overflow-hidden"
              >
                <MyOrderBookAndTrade symbol={props.symbol} />
              </div>
            </Split>
            <div style={{ height: "40%" }}>
              <MemoizedDataListView />
            </div>
          </Split>
        </div>
        {/* order entry start */}
        <div style={{ minWidth: "300px", maxWidth: "500px" }}>
          <AssetsProvider>
            <div className="orderly-px-3">
              <AccountInfo />
            </div>
            <Divider className="orderly-my-3" />
            <div className="orderly-px-3">
              <MyOrderEntry symbol={props.symbol} />
            </div>
          </AssetsProvider>
        </div>
        {/* order entry end */}
      </Split>
      <SystemStatusBar />
    </>
  );
};
