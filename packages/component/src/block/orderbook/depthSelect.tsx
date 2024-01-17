import { Picker, Select } from "@/select";
import { FC, useMemo } from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { SettingsIcon } from "@/icon";

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

  const isTable = useMediaQuery(MEDIA_TABLET);

  if (isTable) {
    return (
      <div id="orderly-order-book-depth" className="orderly-pt-2">
        {/* <Select size={"small"} value={"0.001"} /> */}
        <Picker
          options={options}
          fullWidth
          size={"small"}
          value={props.value}
          className="orderly-text-4xs orderly-text-base-contrast-54"
          onValueChange={(value) => {
            //
            props.onChange?.(value.value);
          }}
        />
      </div>
    );
  }
  return (
    <div className="orderly-flex orderly-items-center orderly-justify-between orderly-pt-2">
      {/* <Select size={"small"} value={"0.001"} /> */}
      <Select
        options={options}
        fullWidth
        size={"small"}
        value={props.value}
        className="orderly-text-4xs orderly-text-base-contrast-54 orderly-w-[103px] orderly-bg-base-700 desktop:orderly-text-base-contrast"
        contentClassName="orderly-bg-base-800"
        onChange={(value: any) => {
          props.onChange?.(value);
        }}
      />

    <SettingsIcon fill="currnet" fillOpacity={1} className="orderly-cursor-pointer orderly-fill-base-contrast-54 hover:orderly-fill-base-contrast" onClick={() => {
      console.log("xxx");
      
    }}/>
    </div>
  );
};
