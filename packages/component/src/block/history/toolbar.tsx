import { FC } from "react";
import { SidePicker, StatusPicker } from "../pickers";

type SearchParams = {
  side: string;
  status: string;
  date: string;
};

export interface HistoryToolbarProps {
  onSearch?: (query: Partial<SearchParams>) => void;
}

export const HistoryToolbar: FC<HistoryToolbarProps> = (props) => {
  return (
    <div className="flex gap-3">
      <SidePicker />
      <StatusPicker />
    </div>
  );
};
