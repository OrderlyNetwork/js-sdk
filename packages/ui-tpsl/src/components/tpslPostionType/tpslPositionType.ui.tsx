import { useState } from "react";
import { PositionType } from "@orderly.network/types";
import {
  CaretDownIcon,
  MenuItem,
  Select,
  SimpleDropdownMenu,
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
    // <SimpleDropdownMenu
    //   currentValue={currentValue}
    //   menu={menus}
    //   align={"end"}
    //   size={"xs"}
    //   className={"oui-min-w-[80px]"}
    //   onCloseAutoFocus={(event) => event.preventDefault()}
    //   onSelect={(item) => onSelect(item)}
    // >
    //   <button className={"oui-p-2"}>
    //     <CaretDownIcon size={12} color={"white"} />
    //   </button>
    // </SimpleDropdownMenu>
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
  );
};
