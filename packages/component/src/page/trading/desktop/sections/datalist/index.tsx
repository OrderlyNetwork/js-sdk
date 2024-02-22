import { TabPane, Tabs } from "@/tab";
import { memo, useCallback, useState } from "react";
import { PositionPane } from "./positions";
import { MyOrders } from "./orders";
import { OrderStatus } from "@orderly.network/types";
import { MemoizedOrdersTabTitle } from "@/page/trading/mobile/sections/dataList/orders/tabTitle";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";
import { TabBarExtraNode } from "@/page/trading/desktop/sections/datalist/tabbarExtraNode";
import { HistoryView } from "./history";
import { usePositionStream, useSessionStorage } from "@orderly.network/hooks";
import { DecimalPrecisionType } from "./decimalPrecisionCheckBox";
import { UnPnlPriceBasisType } from "./unPnlPriceBasisCheckBox";

export const DataListView = () => {
  const [activeTab, setActiveTab] = useState("positions");
  const [data] = usePositionStream();
  const hasPositions = (data.rows?.length || 0) > 0;

  const [decimalPrecision, setDecimalPrecision] = useSessionStorage(
    "orderly_dicimal_precision_key",
    DecimalPrecisionType.TWO
  );
  const [unPnlPriceBasis, setUnPnlPriceBasic] = useSessionStorage(
    "orderly_unrealized_pnl_price_basis_key",
    UnPnlPriceBasisType.MARKET_PRICE
  );

  const [orderStatus, setOrderStatus] = useSessionStorage(
    "orderly_order_status",
    "positions"
  );

  const onTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setOrderStatus(
      {
        positions: "positions",
        orders: OrderStatus.INCOMPLETE,
        filled: OrderStatus.FILLED,
        cancelled: OrderStatus.CANCELLED,
        rejected: OrderStatus.REJECTED,
        history: "history",
      }[value]
    );
  }, []);

  return (
    <Tabs
      autoFit
      value={activeTab}
      onTabChange={onTabChange}
      tabBarClassName="orderly-h-[48px] orderly-text-sm desktop:orderly-font-semibold"
      tabBarExtra={
        <TabBarExtraNode
          decimalPrecision={decimalPrecision}
          setDecimalPrecision={setDecimalPrecision}
          unPnlPriceBasis={unPnlPriceBasis}
          setUnPnlPriceBasic={setUnPnlPriceBasic}
        />
      }
      extraData={{
        showAllSymbol: false,
        // value is 0 1 2
        pnlNotionalDecimalPrecision: decimalPrecision,
        // 0: mark price 1: last price
        unPnlPriceBasis: unPnlPriceBasis,
      }}
    >
      <TabPane
        title={hasPositions ? `Positions(${data.rows?.length})` : "Positions"}
        value="positions"
        className="orderly-px-3"
      >
        <PositionPane
          unPnlPriceBasis={unPnlPriceBasis}
          setUnPnlPriceBasic={setUnPnlPriceBasic}
        />
        {/* <div>Positions</div> */}
      </TabPane>
      <TabPane
        title={<MemoizedOrdersTabTitle />}
        value="orders"
        className="orderly-px-3"
      >
        {/* <OrdersPane /> */}
        <MyOrders status={OrderStatus.INCOMPLETE} />
      </TabPane>
      <TabPane title="Filled" value="filled" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <MyOrders status={OrderStatus.FILLED} />
      </TabPane>
      <TabPane title="Cancelled" value="cancelled" className="orderly-px-3">
        {/* <HistoryPane /> */}
        <MyOrders status={OrderStatus.CANCELLED} />
      </TabPane>
      <TabPane title="Rejected" value="rejected" className="orderly-px-3">
        <MyOrders status={OrderStatus.REJECTED} />
      </TabPane>
      <TabPane title="Order history" value="history" className="orderly-px-3">
        <HistoryView />
      </TabPane>
    </Tabs>
  );
};

export const MemoizedDataListView = memo(DataListView);
