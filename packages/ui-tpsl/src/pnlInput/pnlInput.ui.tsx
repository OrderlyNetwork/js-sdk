import {
  CaretDownIcon,
  Input,
  MenuItem,
  SimpleDropdownMenu,
} from "@orderly.network/ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";
import { inputFormatter, Text } from "@orderly.network/ui";
import { useEffect, useMemo, useState } from "react";

export type PNLInputProps = PNLInputState & { testId?: string; quote: string };

export const PNLInput = (props: PNLInputProps) => {
  const {
    mode,
    modes,
    onModeChange,
    onValueChange,
    quote,
    quote_db,
    value,
    pnl,
  } = props;

  const [prefix, setPrefix] = useState<string>(mode);
  const [placeholder, setPlaceholder] = useState<string>(
    mode === PnLMode.PERCENTAGE ? "%" : quote
  );

  const color = useMemo(() => {
    const num = Number(pnl);

    if (isNaN(num) || num === 0) return "";

    if (num > 0) return "oui-text-trade-profit";
    if (num < 0) return "oui-text-trade-loss";
  }, [pnl]);

  useEffect(() => {
    setPrefix(mode);
    setPlaceholder(mode === PnLMode.PERCENTAGE ? "%" : quote);
  }, [mode]);

  

  return (
    <Input
      prefix={mode}
      size={{
        initial: "lg",
        lg: "md",
      }}
      placeholder={placeholder}
      align={"right"}
      value={value}
      data-testid={props.testId}
      autoComplete={"off"}
      onValueChange={onValueChange}
      formatters={[
        // inputFormatter.numberFormatter,
        props.formatter({ dp: quote_db, mode }),
        inputFormatter.currencyFormatter,
      ]}
      // className={color}
      classNames={{
        input: color,
        prefix: "oui-text-base-contrast-54",
        root:  "oui-outline-line-12 focus-within:oui-outline-primary-light",
      }}
      onFocus={() => {
        setPlaceholder("");
      }}
      onBlur={() => {
        setPlaceholder(mode === PnLMode.PERCENTAGE ? "%" : quote);
      }}
      // value={props.value}
      suffix={
        <>
          {mode === PnLMode.PERCENTAGE && !!value &&  (
            <Text size={"2xs"} color="inherit" className="oui-ml-[2px]">
              %
            </Text>
          )}
          <PNLMenus
            mode={mode}
            modes={modes}
            onModeChange={(item) => onModeChange(item.value as PnLMode)}
          />
        </>
      }
    />
  );
};

const PNLMenus = (props: {
  mode?: string;
  modes: MenuItem[];
  onModeChange: (value: MenuItem) => void;
}) => {
  return (
    <SimpleDropdownMenu
      currentValue={props.mode}
      menu={props.modes}
      align={"end"}
      size={"xs"}
      className={"oui-min-w-[80px]"}
      onSelect={(item) => props.onModeChange(item as MenuItem)}
    >
      <button className={"oui-p-2"}>
        <CaretDownIcon size={12} color={"white"} />
      </button>
    </SimpleDropdownMenu>
  );
};
