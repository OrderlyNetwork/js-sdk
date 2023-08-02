import { Select } from "@/select";
import { FC } from "react";

interface DepthSelectProps {
  depth: number[];
  value: number;
}

export const DepthSelect: FC<DepthSelectProps> = (props) => {
  return (
    <div className={"py-2"}>
      <Select size={"small"} />
    </div>
  );
};
