import { FC } from "react";
import {
  MarketsSheetWidget,
  SymbolInfoBarWidget,
} from "@orderly.network/markets";
import { Flex, Box, SimpleSheet } from "@orderly.network/ui";
import { LanguageSwitcherWidget } from "@orderly.network/ui-scaffold";
import { SecondaryLogo } from "../../components/base/secondaryLogo";
import { BottomNavBarWidget } from "../../components/mobile/bottomNavBar";
import { DataListWidget } from "../../components/mobile/dataList";
import { OrderBookAndEntryWidget } from "../../components/mobile/orderBookAndEntry";
import { TopTabWidget } from "../../components/mobile/topTab";
import { TradingState } from "./trading.script";

export const MobileLayout: FC<TradingState> = (props) => {
  const onSymbol = () => {
    props.onOpenMarketsSheetChange(true);
  };
  const topBar = (
    <Box intensity={900} px={3} height={54}>
      <SymbolInfoBarWidget
        symbol={props.symbol}
        trailing={
          <Flex gapX={3}>
            <LanguageSwitcherWidget />
            <SecondaryLogo />
          </Flex>
        }
        onSymbol={onSymbol}
      />
      <SimpleSheet
        open={props.openMarketsSheet}
        onOpenChange={props.onOpenMarketsSheetChange}
        classNames={{
          body: "oui-h-full oui-pb-[env(safe-area-inset-bottom)]",
          content: "oui-w-[280px] !oui-p-0 oui-rounded-bl-[40px] oui-h-full ",
        }}
        contentProps={{ side: "left", closeable: false }}
      >
        <MarketsSheetWidget
          symbol={props.symbol}
          onSymbolChange={(symbol) => {
            props.onOpenMarketsSheetChange(false);
            props.onSymbolChange?.(symbol);
          }}
        />
      </SimpleSheet>
    </Box>
  );

  return (
    <div
      style={{
        paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
      }}
      className="oui-relative oui-grid oui-h-screen oui-grid-rows-[auto,1fr,auto] oui-gap-1 oui-bg-base-10"
    >
      <header>{topBar}</header>

      <main className="oui-hide-scrollbar oui-space-y-1 oui-overflow-y-auto">
        <TopTabWidget className="oui-mx-1 oui-rounded-xl oui-bg-base-9" />
        <OrderBookAndEntryWidget />
        <DataListWidget
          symbol={props.symbol}
          className="oui-mx-1 oui-rounded-xl"
          sharePnLConfig={props.sharePnLConfig}
        />
      </main>

      <div className="oui-fixed oui-inset-x-0 oui-bottom-0">
        <BottomNavBarWidget />
      </div>
    </div>
  );
};
