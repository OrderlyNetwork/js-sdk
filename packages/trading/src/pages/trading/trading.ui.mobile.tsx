import { FC } from "react";
import { TradingState } from "./trading.script";
import { TopTabWidget } from "../../components/mobile/topTab";
import { OrderBookAndEntryWidget } from "../../components/mobile/orderBookAndEntry";
import {
  MarketsSheetWidget,
  SymbolInfoBarWidget,
} from "@orderly.network/markets";
import { Box, SimpleSheet } from "@orderly.network/ui";
import { SecondaryLogo } from "../../components/base/secondaryLogo";
import { DataListWidget } from "../../components/mobile/dataList";
import { BottomNavBarWidget } from "../../components/mobile/bottomNavBar";
import {
  MaintenanceTipsWidget,
  RestrictedInfoWidget,
} from "@orderly.network/ui-scaffold";
import { LanguageSwitcherWidget } from "@orderly.network/ui-scaffold";

export const MobileLayout: FC<TradingState> = (props) => {
  const onSymbol = () => {
    props.onOpenMarketsSheetChange(true);
  };

  const topBar = (
    <Box intensity={900} px={3} height={54}>
      <SymbolInfoBarWidget
        symbol={props.symbol}
        trailing={<LanguageSwitcherWidget />}
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
      className="oui-grid oui-grid-rows-[auto,1fr,auto] oui-h-screen oui-gap-1 oui-relative oui-bg-base-10"
    >
      <header>{topBar}</header>

      <div>
        <MaintenanceTipsWidget />
      </div>

      <main className="oui-overflow-y-auto oui-hide-scrollbar oui-space-y-1">
        <RestrictedInfoWidget className="oui-mx-1" />
        <TopTabWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
        <OrderBookAndEntryWidget />
        <DataListWidget
          symbol={props.symbol}
          className="oui-mx-1 oui-rounded-xl"
          sharePnLConfig={props.sharePnLConfig}
        />
      </main>

      <div className="oui-fixed oui-left-0 oui-right-0 oui-bottom-0">
        <BottomNavBarWidget />
      </div>
    </div>
  );
};
