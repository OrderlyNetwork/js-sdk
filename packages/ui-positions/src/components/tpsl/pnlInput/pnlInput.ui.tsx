import {
  CaretDownIcon,
  Input,
  MenuItem,
  SimpleDropdownMenu,
} from "@orderly.network/ui";
import { PNLInputState, PnLMode } from "./useBuilder.script";

export const PNLInput = (props: PNLInputState) => {
  const { mode, modes, onModeChange } = props;
  return (
    <Input
      prefix={mode}
      size={"md"}
      align={"right"}
      autoComplete={"off"}
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
      onSelect={(item) => props.onModeChange(item as MenuItem)}
    >
      <button className={"oui-p-2"}>
        <CaretDownIcon size={12} color={"white"} />
      </button>
    </SimpleDropdownMenu>
  );
};
