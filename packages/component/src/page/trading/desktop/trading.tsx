import { FC, useContext, useEffect, useState } from "react";
import Split from "@uiw/react-split";
import { AccountInfoElement } from "./elements/accountInfo";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../mobile/sections/orderEntry";
import { TopNav } from "./sections/nav/topNav";
import { MyOrderBookAndTrade } from "./sections/orderbook_trade";
import { MemoizedDataListView } from "./sections/datalist";
import { MyTradingView } from "./myTradingview";
import { AssetsProvider } from "@/provider/assetsProvider";
import { useCSSVariable } from "@/hooks/useCSSVariable";
import { LayoutContext } from "@/layout/layoutContext";
import { useTradingPageContext } from "../context/tradingPageContext";
import { useSplitPersistent } from "./useSplitPersistent";

export const DesktopTradingPage: FC<TradingPageProps> = (props) => {
  // const {} = useLayoutMeasure();
  const { siderWidth, pageHeaderHeight, headerHeight, footerHeight } =
    useContext(LayoutContext);

  const [mainSplitSize, setMainSplitSize] = useSplitPersistent(
    "mainSplitSize",
    "300px"
  );
  const [dataListSplitSize, setDataListSplitSize] = useSplitPersistent(
    "dataListSplitSize",
    "350px"
  );
  const [orderBookSplitSize, setOrderbookSplitSize] = useSplitPersistent(
    "orderBookSplitSize",
    "370px"
  );

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
          minHeight: "990px",
          width: `calc(100vw - ${siderWidth}px)`,
          // paddingBottom:
        }}
        onDragEnd={(preSize: number, nextSize: number, paneNumber: number) => {
          setMainSplitSize(`${nextSize}`);
        }}
      >
        <div style={{ flex: 1 }}>
          {/* @ts-ignore */}
          <Split
            mode="vertical"
            lineBar
            onDragEnd={(_, height, num) => {
              setDataListSplitSize(`${height}`);
            }}
          >
            {/* @ts-ignore */}
            <Split
              style={{ flex: 1, minHeight: "450px" }}
              className={"orderly-min-h-0 orderly-overflow-y-visible"}
              lineBar
              onDragEnd={(_, width, num) => {
                setOrderbookSplitSize(`${width}`);
              }}
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
                style={{ minWidth: "300px", maxWidth: "800px", width: orderBookSplitSize }}
                className="orderly-overflow-hidden"
              >
                <MyOrderBookAndTrade symbol={props.symbol} />
              </div>
            </Split>
            <div style={{ height: dataListSplitSize, minHeight: "350px" }}>
              <MemoizedDataListView />
            </div>
          </Split>
        </div>

        <div
          style={{
            minWidth: "300px",
            maxWidth: "500px",
            minHeight: "990px",
            width: mainSplitSize,
          }}
        >
          <AssetsProvider>
            <AccountInfoElement />

            <div className="orderly-px-3 orderly-mt-3 orderly-z-30">
              <MyOrderEntry symbol={props.symbol} />
            </div>
          </AssetsProvider>
        </div>
        {/* order entry end */}
      </Split>
    </div>
  );
};
