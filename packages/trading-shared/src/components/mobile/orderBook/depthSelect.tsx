import { FC, useMemo } from "react";
import { Box, Picker } from "@orderly.network/ui";

interface DepthSelectProps {
  depth: ReadonlyArray<string> | string[];
  value?: string;
  onChange?: (depth: number) => void;
  /** Renders the current value without the chevron or action sheet. */
  readOnly?: boolean;
}

export const DepthSelect: FC<DepthSelectProps> = (props) => {
  const options = useMemo(() => {
    return props.depth.map((d) => ({
      value: d,
      label: `${d}`,
    }));
  }, [props.depth]);
  return (
    <Box
      id="oui-order-book-depth"
      className="oui-orderBook-depth oui-w-full oui-pt-2"
    >
      {props.readOnly ? (
        // Mirrors the Picker trigger (size sm) minus the chevron and sheet.
        <div className="oui-flex oui-h-[22px] oui-w-full oui-items-center oui-rounded-md oui-border oui-border-line-6 oui-bg-line-4 oui-px-2 oui-text-2xs oui-text-base-contrast-54">
          {options.find((option) => option.value === props.value)?.label ??
            props.value}
        </div>
      ) : (
        <Picker
          options={options}
          fullWidth
          size={"sm"}
          value={props.value}
          className="oui-text-2xs oui-text-base-contrast-54"
          onValueChange={(value) => {
            //
            props.onChange?.(value);
          }}
        />
      )}
    </Box>
  );
};
