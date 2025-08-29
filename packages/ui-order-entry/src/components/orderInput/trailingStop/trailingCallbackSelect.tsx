import { FC, memo, useMemo } from "react";
import { TrailingCallbackType } from "@orderly.network/types";
import { Select, cn } from "@orderly.network/ui";

type TrailingCallbackSelectProps = {
  quote: string;
  value: string;
  onValueChange: (value: TrailingCallbackType) => void;
};

export const TrailingCallbackSelect: FC<TrailingCallbackSelectProps> = memo(
  (props) => {
    const { quote } = props;

    const options = useMemo(() => {
      return [
        { label: quote, value: TrailingCallbackType.VALUE },
        { label: "%", value: TrailingCallbackType.RATE },
      ];
    }, [quote]);

    return (
      <Select.options
        variant="text"
        size="xs"
        options={options}
        classNames={{
          trigger: cn(
            "oui-absolute oui-right-0 oui-top-1",
            "oui-w-[124px] oui-justify-end",
            "oui-text-base-contrast-36",
          ),
        }}
        value={props.value}
        onValueChange={props.onValueChange}
        contentProps={{
          align: "end",
          alignOffset: -1,
          sideOffset: -4,
          className: "oui-border oui-border-line-6",
        }}
      />
    );
  },
);

TrailingCallbackSelect.displayName = "trailingCallbackSelect";
