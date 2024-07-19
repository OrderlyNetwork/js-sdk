import {
  CaretDownIcon,
  Input,
  MenuItem,
  SimpleDropdownMenu,
} from "@orderly.network/ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";

export type PNLInputProps = PNLInputState & { testId?: string; quote: string };

export const PNLInput = (props: PNLInputProps) => {
  const { mode, modes, onModeChange, onValueChange, quote, quote_db } = props;
  return (
    <Input
      prefix={mode}
      size={"md"}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      align={"right"}
      data-testid={props.testId}
      autoComplete={"off"}
      onValueChange={onValueChange}
      formatters={[props.formatter({ dp: quote_db, mode })]}
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
      onSelect={(item) => props.onModeChange(item as MenuItem)}
    >
      <button className={"oui-p-2"}>
        <CaretDownIcon size={12} color={"white"} />
      </button>
    </SimpleDropdownMenu>
  );
};
