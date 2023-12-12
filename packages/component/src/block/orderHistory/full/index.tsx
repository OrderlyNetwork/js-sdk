import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC, useContext } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";
import { OrderHistoryListViewProps } from "../shared/types";
import { Header } from "./header";
import { Listview } from "./listview";
import { TabContext } from "@/tab";

export const HistoryListViewFull: FC<OrderHistoryListViewProps> = (props) => {
  const { height } = useContext(TabContext);
  return (
    <>
      <Header
        status={props.status}
        side={props.side}
        onSideChange={props.onSideChange}
        onStatusChange={props.onStatusChange}
      />
      <Divider />
      <div
        className="orderly-overflow-y-auto"
        style={{ height: `${(height?.content ?? 100) - 55}px` }}
      >
        <Listview dataSource={props.dataSource} loading={props.isLoading} />
      </div>
    </>
  );
};
