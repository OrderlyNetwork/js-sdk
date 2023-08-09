import { Select } from "@/select";
import { FC } from "react";
import { BasePickerProps } from "./types";

export interface StatusPickerProps extends BasePickerProps<any> {}

export const StatusPicker: FC<StatusPickerProps> = (props) => {
  return <Select label="All Status" size={"small"} options={[]} />;
};
