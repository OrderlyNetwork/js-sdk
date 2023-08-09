import { FC } from "react";
import { BasePickerProps } from "./types";
import { Select } from "@/select";

interface SidePickerProps extends BasePickerProps<any> {}

export const SidePicker: FC<SidePickerProps> = () => {
  return <Select size={"small"} options={[]} label="All Side"></Select>;
};
