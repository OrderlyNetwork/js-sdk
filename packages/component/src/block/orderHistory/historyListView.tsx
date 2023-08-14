import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";

export interface OrderHistoryListViewProps {
  isLoading: boolean;
  dataSource: any[];
}

export const HistoryListView: FC<OrderHistoryListViewProps> = (props) => {
  return (
    <>
      <HistoryToolbar />
      <Divider />
      <ListView.separated
        isLoading={props.isLoading}
        dataSource={props.dataSource}
        renderSeparator={(_, index) => <Divider />}
        renderItem={(item, index) => <Cell item={item} />}
      />
    </>
  );
};
