import { FC, memo, useMemo } from "react";
import { Select, cn } from "@orderly.network/ui";

export type CallbackUnitValue = "quote" | "percentage";

type CallbackUnitProps = {
  quote: string;
  value: string;
  onValueChange: (value: CallbackUnitValue) => void;
};

export const CallbackUnit: FC<CallbackUnitProps> = memo((props) => {
  const { quote } = props;

  const options = useMemo(() => {
    return [
      { label: quote, value: "quote" },
      { label: "%", value: "percentage" },
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
});

CallbackUnit.displayName = "CallbackUnit";
