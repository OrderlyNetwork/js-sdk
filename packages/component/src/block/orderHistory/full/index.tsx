import { Divider } from "@/divider";
import { FC, useContext } from "react";
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
      <div style={{ height: `${(height?.content ?? 100) - 55}px` }}>
        <Listview
          dataSource={props.dataSource}
          loading={props.isLoading}
          loadMore={props.loadMore}
        />
      </div>
    </>
  );
};
