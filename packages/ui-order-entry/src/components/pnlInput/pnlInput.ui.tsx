import {
  CaretDownIcon,
  Input,
  MenuItem,
  SimpleDropdownMenu,
} from "@orderly.network/ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";
import { inputFormatter } from "@orderly.network/ui";

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
  } = props;
  return (
    <Input
      prefix={mode}
      size={"md"}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      align={"right"}
      value={value}
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
