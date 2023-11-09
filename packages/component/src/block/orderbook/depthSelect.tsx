import { Picker, Select } from "@/select";
import { FC, useMemo } from "react";

interface DepthSelectProps {
  depth: number[];
  value: number;
  onChange?: (depth: number) => void;
}

export const DepthSelect: FC<DepthSelectProps> = (props) => {
  const options = useMemo(() => {
    return props.depth.map((d) => ({
      value: d,
      label: `${d}`,
    }));
  }, [props.depth]);
  return (
    <div className={"py-2"}>
      {/* <Select size={"small"} value={"0.001"} /> */}
      <Picker
        options={options}
        fullWidth
        size={"small"}
        value={props.value}
        className="text-xs text-base-contrast-54"
        onValueChange={(value) => {
          //
          props.onChange?.(value.value);
        }}
      />
    </div>
  );
};
