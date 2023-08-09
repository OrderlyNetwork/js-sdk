import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { FC } from "react";
import { HistoryToolbar } from "./toolbar";
import { HistoryCell } from "./cell";

export interface TradeHistoryViewProps {
  dataSource: any[];
  onSearch?: (query: any) => void;
}

export const TradeHistoryView: FC<TradeHistoryViewProps> = (props) => {
  return (
    <>
      <HistoryToolbar onSearch={props.onSearch} />
      <Divider />
      <ListView.separated
        dataSource={props.dataSource}
        renderSeparator={(_, index) => <Divider />}
        renderItem={(item, index) => <HistoryCell />}
      ></ListView.separated>
    </>
  );
};
