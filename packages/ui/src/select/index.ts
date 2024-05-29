export {
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./selectPrimitive";

import { ChainSelect } from "./chains";
import { Select as SelectComponent } from "./select";

import { SelectWithOptions } from "./withOptions";

export type SelectType = typeof SelectComponent & {
  options: typeof SelectWithOptions;
  chains: typeof ChainSelect;
};

const Select = SelectComponent as SelectType;
Select.options = SelectWithOptions;
Select.chains = ChainSelect;

export { Select };

export type { SelectProps } from "./select";
export type { SelectWithOptionsProps } from "./withOptions";
