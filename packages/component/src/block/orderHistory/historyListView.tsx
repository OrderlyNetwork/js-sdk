import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./historyToolbar";
import { Cell } from "./cell";
import { StatisticStyleProvider } from "@/statistic/defaultStaticStyle";

export interface OrderHistoryListViewProps {
  isLoading: boolean;
  dataSource: any[];
}

export const HistoryListView: FC<OrderHistoryListViewProps> = (props) => {
  return (
    <StatisticStyleProvider labelClassName={"text-sm text-base-contrast/30"}>
      <HistoryToolbar />
      <Divider />
      <ListView.separated
        isLoading={props.isLoading}
        dataSource={props.dataSource}
        renderSeparator={(_, index) => <Divider />}
        renderItem={(item, index) => <Cell item={item} />}
      />
    </StatisticStyleProvider>
  );
};
