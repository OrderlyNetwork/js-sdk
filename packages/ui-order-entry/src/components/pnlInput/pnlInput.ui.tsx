import { useEffect, useMemo, useState } from "react";
import {
  CaretDownIcon,
  Input,
  MenuItem,
  Text,
  SimpleDropdownMenu,
} from "@kodiak-finance/orderly-ui";
import { inputFormatter } from "@kodiak-finance/orderly-ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";

export type PNLInputProps = PNLInputState & {
  testIds?: {
    input?: string;
    dropDown?: string;
  };
  quote: string;
  type: "TP" | "SL";
};

export const PNLInput = (props: PNLInputProps) => {
  const {
    mode,
    modes,
    modeLabelMap,
    onModeChange,
    onValueChange,
    quote,
    quote_dp,
    value,
    type,
    tips,
    onFocus,
    onBlur,
    setFocus,
  } = props;

  const [prefix, setPrefix] = useState<string>(mode);

  const [placeholder, setPlaceholder] = useState<string>(
    mode === PnLMode.PERCENTAGE ? "%" : quote,
  );

  useEffect(() => {
    setPrefix(mode);
    setPlaceholder(mode === PnLMode.PERCENTAGE ? "%" : quote);
  }, [mode]);

  useEffect(() => {
    setPrefix(!!value ? "" : mode);
  }, [value]);

  const id = useMemo(() => `${type.toLowerCase()}_${mode.toLowerCase()}`, []);

  return (
    <Input.tooltip
      prefix={modeLabelMap[prefix as keyof typeof modeLabelMap] || prefix}
      size={"md"}
      placeholder={placeholder}
      id={id}
      align={"right"}
      value={value}
      tooltip={tips}
      tooltipProps={{
        content: {
          side: props.type === "TP" ? "top" : "bottom",
        },
      }}
      data-testid={props.testIds?.input}
      autoComplete={"off"}
      onValueChange={onValueChange}
      formatters={[
        props.formatter({ dp: quote_dp, mode, type }),
        inputFormatter.currencyFormatter,
        // inputFormatter.identifierFormatter(),
      ]}
      classNames={{
        root: type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss",
        additional: "oui-text-base-contrast-54",
        input: "oui-text-inherit",
      }}
      onFocus={() => {
        setPrefix("");
        setPlaceholder("");
        setFocus(true);
        onFocus();
      }}
      onBlur={() => {
        setPrefix(!!value ? "" : mode);
        setPlaceholder(mode === PnLMode.PERCENTAGE ? "%" : quote);
        onBlur();
      }}
      suffix={
        <>
          {mode === PnLMode.PERCENTAGE && !!value && (
            <Text size={"2xs"} color="inherit" className="oui-ml-[2px]">
              %
            </Text>
          )}
          <PNLMenus
            mode={mode}
            modes={modes}
            onModeChange={(item) => onModeChange(item.value as PnLMode)}
            testId={props.testIds?.dropDown}
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
  testId?: string;
}) => {
  return (
    <SimpleDropdownMenu
      currentValue={props.mode}
      menu={props.modes}
      align={"end"}
      size={"xs"}
      className={"oui-min-w-[80px]"}
      onCloseAutoFocus={(event) => event.preventDefault()}
      onSelect={(item) => props.onModeChange(item as MenuItem)}
    >
      <button className={"oui-p-2"} data-testid={props.testId}>
        <CaretDownIcon size={12} color={"white"} />
      </button>
    </SimpleDropdownMenu>
  );
};
