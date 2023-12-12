import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { SymbolProvider } from "@/provider";
import { API } from "@orderly.network/types";
import { OrderHistoryListViewProps } from "../shared/types";
import { Header } from "./header";
import { Listview } from "./listview";

export const HistoryListViewFull: FC<OrderHistoryListViewProps> = (props) => {
  return (
    <>
      <Header
        status={props.status}
        side={props.side}
        onSideChange={props.onSideChange}
        onStatusChange={props.onStatusChange}
      />
      <Divider />
      <Listview dataSource={props.dataSource} loading={props.isLoading} />
    </>
  );
};
