import { FC } from "react";
import { TradingV2State } from "./tradingV2.script";
import { NavBarWidget } from "../components/mWeb/navBar";
import { TopTabWidget } from "../components/mWeb/topTab";
import { OrderBookAndEntryWidget } from "../components/mWeb/orderBookAndEntry";
import { BottomTabWidget } from "../components/mWeb/bottomTab";

export const MobileLayout: FC<TradingV2State> = (props) => {
  return (
    <div className="oui-h-100% oui-overflow-auto oui-hide-scrollbar oui-space-y-1">
      <NavBarWidget className="oui-mx-1 oui-bg-base-9 oui-rounded-xl" />
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
