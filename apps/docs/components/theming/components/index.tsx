import { Card } from "./card";
import { OrderBookComponent } from "./orderbook";
import { OrderEntryComponent } from "@/components/theming/components/orderEntry";
import { DepositComponent } from "@/components/theming/components/deposit";

import { WithdrawComponent } from "./withdraw";
import { MarketsComponent, MarketsComponentFull } from "./markets";
import { WalletConnector } from "./walletConnector";
import { TradeHistoryComponent } from "./tradeHistory";
import { Orders } from "./orders";
import { AccountStatusBarComponent } from "./accountStateBar";
import { AssetsComponent } from "./assets";
import { ClosePositionPaneComponent } from "./closePositionPane";
import { ThemeEditor } from "../editor";
import { ChainListComponent } from "./chainlist";
import { useThemeUpdate } from "../useThemeUpdate";
import { useRef } from "react";
import { PositionsComponent } from "./positions";

const Components = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useThemeUpdate(rootRef.current);

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
      ref={rootRef}
    >
      <Card maxHeight={500} className="bg-base-700">
        <MarketsComponent />
      </Card>

      <Card
        className="bg-base-900"
        maxHeight={480}
        style={{ gridArea: "2 / 1 / auto / span 3" }}
      >
        <PositionsComponent />
      </Card>

      <Card className="bg-base-600">
        <AssetsComponent />
      </Card>

      <Card>
        <OrderBookComponent />
      </Card>
      <Card>
        <OrderEntryComponent />
      </Card>
      <Card maxHeight={510} style={{ gridArea: "3 / 1 / auto / span 2" }}>
        <MarketsComponentFull />
      </Card>
      <Card className="bg-base-600">
        <DepositComponent />
      </Card>
      <Card className="bg-base-800">
        <TradeHistoryComponent />
      </Card>
      <div className="space-y-5">
        <Card>
          <ClosePositionPaneComponent />
        </Card>
        <Card>
          <AccountStatusBarComponent />
        </Card>
      </div>
      <Card maxHeight={500} className="bg-base-700">
        <MarketsComponent />
      </Card>

      <Card className="bg-base-600">
        <WithdrawComponent />
      </Card>
      <Card className="bg-base-600">
        <WalletConnector />
      </Card>
      <Card>
        <Orders />
      </Card>
      {/* <Card>
       
      </Card> */}
      <Card maxHeight={400}>
        <ChainListComponent />
      </Card>
    </div>
  );
};

export default Components;
