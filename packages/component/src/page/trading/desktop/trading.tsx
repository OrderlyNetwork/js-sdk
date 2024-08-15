import { FC, useContext, useEffect, useRef, useState } from "react";
import Split from "@uiw/react-split";
import { AccountInfoElement } from "./elements/accountInfo";
import { TradingPageProps } from "../types";
import { MyOrderEntry } from "../mobile/sections/orderEntry";
import { TopNav } from "./sections/nav/topNav";
import { MyOrderBookAndTrade } from "./sections/orderbook_trade";
import { MemoizedDataListView } from "./sections/datalist";
import MyTradingView from "./myTradingview/index";
import { AssetsProvider } from "@/provider/assetsProvider";
import { useCSSVariable } from "@/hooks/useCSSVariable";
import { LayoutContext } from "@/layout/layoutContext";
import { useTradingPageContext } from "../context/tradingPageContext";
import { useSplitPersistent } from "./useSplitPersistent";
import SwitchMarginModulePlace from "@/page/trading/desktop/elements/switchMarginModulePlace";
import { Divider } from "@/divider";
import { cn } from "@/utils";
import { TradingFeatures } from "@/page";

export const DesktopTradingPage: FC<TradingPageProps> = (props) => {
  // const {} = useLayoutMeasure();
  const {
    siderWidth,
    pageHeaderHeight,
    headerHeight,
    footerHeight,
    marginModulePosition,
  } = useContext(LayoutContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const [entryMaxWidth, setEntryMaxWidth] = useState(500);

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

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setEntryMaxWidth(Math.min(width - 768, 500));
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return (
    <div ref={containerRef} className="orderly-tabular-nums">
      {/* @ts-ignore */}
      <Split
        lineBar
        style={{
          height: `calc(100vh - ${
            headerHeight + footerHeight + (pageHeaderHeight ?? 0)
          }px)`,
          minHeight: "990px",
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
                style={{
                  minWidth: "300px",
                  maxWidth: "800px",
                  width: orderBookSplitSize,
                }}
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
          className={cn(
            "orderly-flex orderly-flex-col orderly-justify-start",
            marginModulePosition === "bottom" &&
              "orderly-flex-col-reverse orderly-justify-end"
          )}
          style={{
            minWidth: "300px",
            maxWidth: `${entryMaxWidth}px`,
            minHeight: "990px",
            width: mainSplitSize,
            position: "relative",
          }}
        >
          <AssetsProvider>
            <AccountInfoElement />

            {!disableFeatures?.includes(TradingFeatures.AssetAndMarginInfo) && (
              <Divider className="orderly-mt-3" />
            )}

            <div className="orderly-px-3 orderly-mt-4 orderly-z-30">
              <MyOrderEntry symbol={props.symbol} />
            </div>
          </AssetsProvider>
        </div>
        {/* order entry end */}
      </Split>
    </div>
  );
};
