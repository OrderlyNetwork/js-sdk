import {
  CaretDownIcon,
  cn,
  Flex,
  Input,
  MenuItem,
  Text,
  SimpleDropdownMenu,
} from "@orderly.network/ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";
import { inputFormatter } from "@orderly.network/ui";
import { useMemo, useState } from "react";

export type PNLInputProps = PNLInputState & {
  testId?: string;
  quote: string;
  type: "TP" | "SL";
};

export const PNLInput = (props: PNLInputProps) => {
  const {
    mode,
    modes,
    onModeChange,
    onValueChange,
    quote,
    quote_db,
    value,
    type,
    tips,
    onFocus,
    onBlur,
  } = props;

  const id = useMemo(() => `${type.toLowerCase()}_${mode.toLowerCase()}`, []);

  const tooltipEle = useMemo(() => {
    if (!tips) return null;

    return (
      <Flex>
        <span className={"oui-text-xs oui-text-base-contrast-54"}>
          {`Est.${tips.type}:`}
        </span>
        <Text.numeral
          className={cn(
            "oui-text-xs oui-ml-1",
            type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
          )}
        >
          {tips.msg}
        </Text.numeral>
      </Flex>
    );
  }, [tips?.msg]);

  return (
    <Input.tooltip
      prefix={mode}
      size={"md"}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      id={id}
      align={"right"}
      value={value}
      tooltip={tooltipEle}
      data-testid={props.testId}
      autoComplete={"off"}
      onValueChange={onValueChange}
      formatters={[
        props.formatter({ dp: quote_db, mode, type }),
        inputFormatter.currencyFormatter,
      ]}
      classNames={{
        additional: "oui-text-base-contrast-54",
        input: type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss",
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      suffix={
        <PNLMenus
          modes={modes}
          onModeChange={(item) => onModeChange(item.value as PnLMode)}
        />
      }
    />
  );
};

const PNLMenus = (props: {
  modes: MenuItem[];
  onModeChange: (value: MenuItem) => void;
}) => {
  return (
    <SimpleDropdownMenu
      menu={props.modes}
      align={"end"}
      size={"xs"}
      className={"oui-min-w-[80px]"}
      onCloseAutoFocus={(event) => event.preventDefault()}
      onSelect={(item) => props.onModeChange(item as MenuItem)}
    >
      <button className={"oui-p-2"}>
        <CaretDownIcon size={12} color={"white"} />
      </button>
    </SimpleDropdownMenu>
  );
};
