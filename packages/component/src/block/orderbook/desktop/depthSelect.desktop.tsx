import { Picker, Select } from "@/select";
import { FC, useMemo } from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { SettingsIcon } from "@/icon";

interface DesktopDepthSelectProps {
  depth: string[];
  value?: string;
  onChange?: (depth: number) => void;
}

export const DesktopDepthSelect: FC<DesktopDepthSelectProps> = (props) => {
  const options = useMemo(() => {
    return props.depth.map((d) => ({
      value: d,
      label: `${d}`,
    }));
  }, [props.depth]);

 
  return (
    <div className="orderly-flex orderly-items-center orderly-justify-between orderly-pt-2 orderly-mr-3 orderly-pb-1">
      {/* <Select size={"small"} value={"0.001"} /> */}
      <Select
        options={options}
        fullWidth
        size={"small"}
        value={props.value}
        className="orderly-text-4xs orderly-text-base-contrast-54 orderly-w-[103px] orderly-bg-base-700"
        contentClassName="orderly-bg-base-800"
        onChange={(value: any) => {
          props.onChange?.(value);
        }}
        color={"default"}
      />

    {/* <SettingsIcon fill="currnet" fillOpacity={1} className="orderly-cursor-pointer orderly-fill-base-contrast-54 hover:orderly-fill-base-contrast" onClick={() => {
      console.log("xxx");
      
    }}/> */}
    </div>
  );
};
