import { FC, useMemo } from "react";

interface DepthSelectProps {
  depth: string[];
  value?: string;
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
      <div id="oui-order-book-depth" className="oui-pt-2">
        {/* <Select size={"small"} value={"0.001"} /> */}
        {/* <Picker
          options={options}
          fullWidth
          size={"small"}
          value={props.value}
          className="oui-text-4xs oui-text-base-contrast-54"
          onValueChange={(value) => {
            //
            props.onChange?.(value.value);
          }}
        /> */}
      </div>
    );
};
