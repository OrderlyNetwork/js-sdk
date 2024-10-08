import { FC } from "react";
import { TradingV2State } from "./tradingV2.script";
import { TopTabWidget } from "../components/mWeb/topTab";
import { OrderBookAndEntryWidget } from "../components/mWeb/orderBookAndEntry";
import { BottomTabWidget } from "../components/mWeb/bottomTab";
import {
  MarketsSheetWidget,
  TokenInfoBarWidget,
} from "@orderly.network/markets";
import { Box, modal } from "@orderly.network/ui";
import { SecondaryLogo } from "../components/base/secondaryLogo";

export const MobileLayout: FC<TradingV2State> = (props) => {
  const onSymbol = () => {
    modal.sheet({
      title: null,
      classNames: {
        content: "oui-w-[280px] !oui-p-0 oui-rounded-bl-[40px]",
      },
      content: <MarketsSheetWidget onSymbolChange={props.onSymbolChange} />,
      contentProps: { side: "left", closeable: false },
    });
  };

  const topBar = (
    <Box intensity={900} px={3} height={54}>
      <TokenInfoBarWidget
        symbol="PERP_BTC_USDC"
        trailing={<SecondaryLogo />}
        onSymbol={onSymbol}
      />
    </Box>
  );

  return (
    <div className="oui-h-100% oui-overflow-auto oui-hide-scrollbar oui-space-y-1">
      {topBar}
      <TopTabWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
      <OrderBookAndEntryWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
      <BottomTabWidget
        symbol={props.symbol}
        className="oui-mx-1 oui-bg-base-9 oui-rounded-xl oui-p-2"
        config={props.dataList.config}
      />
    </div>
  );
};
