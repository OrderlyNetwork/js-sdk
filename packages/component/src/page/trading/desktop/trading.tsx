import { FC, useContext, useEffect } from "react";
import Split from "@uiw/react-split";
import { AccountInfoElement } from "./elements/accountInfo";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../mobile/sections/orderEntry";
import { Divider } from "@/divider";
import { TopNav } from "./sections/nav/topNav";
import { MyOrderBookAndTrade } from "./sections/orderbook_trade";
import { MemoizedDataListView } from "./sections/datalist";
import { MyTradingView } from "./myTradingview";
import { AssetsProvider } from "@/provider/assetsProvider";
import { useCSSVariable } from "@/hooks/useCSSVariable";
import { LayoutContext } from "@/layout/layoutContext";
import { useTradingPageContext } from "../context/tradingPageContext";

export const DesktopTradingPage: FC<TradingPageProps> = (props) => {
  // const {} = useLayoutMeasure();
  const { siderWidth, pageHeaderHeight, headerHeight, footerHeight } =
    useContext(LayoutContext);

  const { disableFeatures } = useTradingPageContext();

  if (!disableFeatures) {
    throw new Error("TradingPage must be use in TradingPageProvider");
  }

  const cssVariable = useCSSVariable([
    "--orderly-color-primary",
    "--orderly-color-divider",
  ]);

  useEffect(() => {
    document.body.style.setProperty(
      "--w-split-line-bar-background",
      // "rgb(42, 46, 52)"
      `rgb(${cssVariable["--orderly-color-divider"]})`
    );
    document.body.style.setProperty(
      "--w-split-line-bar-active-background",
      `rgb(${cssVariable["--orderly-color-primary"]})`
    );
  }, [cssVariable]);

  return (
    <div className="orderly-tabular-nums">
      {/* @ts-ignore */}
      <Split
        lineBar
        style={{
          height: `calc(100vh - ${
            headerHeight + footerHeight + (pageHeaderHeight ?? 0)
          }px)`,
          minHeight: "900px",
          width: `calc(100vw - ${siderWidth}px)`,
        }}
      >
        <div style={{ flex: 1 }}>
          {/* @ts-ignore */}
          <Split mode="vertical" lineBar>
            {/* @ts-ignore */}
            <Split
              style={{ flex: 1, minHeight: "450px" }}
              className={"orderly-min-h-0 orderly-overflow-y-visible"}
              lineBar
            >
              <div
                style={{ flex: 1, minWidth: "468px" }}
                className="orderly-grid orderly-grid-rows-[48px_1fr]"
              >
                <div className="orderly-border-b orderly-border-b-divider orderly-min-w-0">
                  <TopNav symbol={props.symbol} />
                </div>

                <div className="orderly-flex-1">
                  <MyTradingView
                    symbol={props.symbol}
                    tradingViewConfig={props.tradingViewConfig}
                  />
                </div>
              </div>
              <div
                style={{ minWidth: "280px", width: "280px" }}
                className="orderly-overflow-hidden"
              >
                <MyOrderBookAndTrade symbol={props.symbol} />
              </div>
            </Split>
            <div style={{ height: "350px", minHeight: "300px" }}>
              <MemoizedDataListView />
            </div>
          </Split>
        </div>
        {/* order entry start */}
        <div
          style={{ minWidth: "300px", maxWidth: "500px", minHeight: "900px" }}
        >
          <AssetsProvider>
            <AccountInfoElement />

            <div className="orderly-px-3 orderly-mt-3">
              <MyOrderEntry symbol={props.symbol} />
            </div>
          </AssetsProvider>
        </div>
        {/* order entry end */}
      </Split>
    </div>
  );
};
