import { useState } from "react";
import { PositionType } from "@orderly.network/types";
import {
  CaretDownIcon,
  ExclamationFillIcon,
  Flex,
  MenuItem,
  Select,
  SimpleDropdownMenu,
  Tooltip,
} from "@orderly.network/ui";
import { useTPSLPositionTypeScript } from "./tpslPositionType.script";

type TPSLPositionTypeUIProps = ReturnType<typeof useTPSLPositionTypeScript>;

const positionTypeKey = "position_type";
export const TPSLPositionTypeUI = (props: TPSLPositionTypeUIProps) => {
  const options = [
    {
      label: "TP/SL: Partial position",
      value: PositionType.PARTIAL,
    },
    {
      label: "TP/SL: Full position",
      value: PositionType.FULL,
    },
  ];

  return (
    <Flex gap={1} itemAlign={"center"} justify={"start"}>
      <Tooltip
        className="oui-w-[280px] oui-p-3"
        content={
          props.value === PositionType.FULL
            ? "TPSL (full) applies to the full position. Newly activated TPSL (full) orders will overwrite previous orders. Full position will be market closed when the price is triggered."
            : "TP/SL triggers at the specified mark price and executes as a market order. By default, it applies to the entire position. Adjust settings in open positions for partial TP/SL."
        }
      >
        <ExclamationFillIcon
          className="oui-cursor-pointer oui-text-base-contrast-54"
          size={12}
        />
      </Tooltip>
      <Select.options
        value={props.value}
        options={options}
        onValueChange={(event) => {
          console.log("event", event);
          props.onChange(positionTypeKey, event as PositionType);
        }}
        size={"xs"}
        classNames={{
          trigger: " oui-bg-transparent oui-border-0 oui-w-auto oui-px-0",
        }}
        contentProps={{
          className: " oui-bg-base-8 oui-border-0",
        }}
      />
    </Flex>
  );
};
