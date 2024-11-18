import { FC } from "react";
import { Box, cn, TabPanel, Tabs } from "@orderly.network/ui";
import { TopTabState, TopTabType } from "./topTab.script";
import { MWebLastTrades } from "../lastTrades/lastTrades.widget";
import { TradeDataWidget } from "../tradeData";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { useTradingPageContext } from "../../../provider/context";

export const TopTab: FC<
  TopTabState & {
    className?: string;
  }
> = (props) => {
  const { tradingViewConfig } = useTradingPageContext();

  return (
    <Tabs
      variant="contained"
      value={props.tab}
      contentVisible={props.visible}
      onValueChange={(e) => {
        props.setTab(e as any);
        props.setVisible(true);
      }}
      className={props.className}
      classNames={{
        tabsList: "oui-p-2",
        tabsContent: "oui-min-h-[176px] oui-max-h-[234px]",
      }}
      trailing={
        <button className="oui-px-5" onClick={props.toggleContentVisible}>
          <ChevronIcon
            className={(props.visible ? "oui-rotate-0" : "oui-rotate-180")}
          />
        </button>
      }
    >
      <TabPanel title="Chart" value={TopTabType.chart}>
        <div className="oui-h-[234px] oui-pb-1">
          <TradingviewWidget
            symbol={props.symbol}
            libraryPath={tradingViewConfig?.library_path}
            mode={3}
            scriptSRC={tradingViewConfig?.scriptSRC}
            customCssUrl={tradingViewConfig?.customCssUrl}
          />
        </div>
      </TabPanel>
      <TabPanel title="Trades" value={TopTabType.trades}>
        <MWebLastTrades symbol={props.symbol} />
      </TabPanel>
      <TabPanel title="Data" value={TopTabType.data}>
        <Box px={3}>
          <TradeDataWidget symbol={props.symbol} />
        </Box>
      </TabPanel>
    </Tabs>
  );
};

const ChevronIcon = (props: { className?: string }) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("oui-fill-base-contrast-54 hover:oui-fill-base-contrast-80",props.className)}
    >
      <path
        d="M5.721 4.585 2.726 6.578a.51.51 0 0 0-.14.7.51.51 0 0 0 .702.14l2.714-1.806 2.715 1.806c.23.153.549.089.702-.14a.51.51 0 0 0-.14-.7L6.283 4.585a.51.51 0 0 0-.562 0"
        // fill="url(#a)"
      />
      <defs>
        {/* <linearGradient
          id="a"
          x1="9.502"
          y1="6.001"
          x2="2.502"
          y2="6.001"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#59B0FE" />
          <stop offset="1" stopColor="#26FEFE" />
        </linearGradient> */}
      </defs>
    </svg>
  );
};
