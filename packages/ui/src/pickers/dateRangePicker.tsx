import { FC } from "react";
import { Popover } from "../popover";

export type DateRangePickerProps = {
  from: Date;
  to: Date;
  onChange?: (from: Date, to: Date) => void;
};

export const DateRangePicker: FC<DateRangePickerProps> = (props) => {
  return <Popover></Popover>;
};
