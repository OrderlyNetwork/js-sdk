import { CombineSelect } from "./combine";

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

import { Select as SelectComponent } from "./select";

import { SelectWithOptions } from "./withOptions";
import { TokenSelect } from "./tokens";

export type SelectType = typeof SelectComponent & {
  options: typeof SelectWithOptions;
  tokens: typeof TokenSelect;
  combine: typeof CombineSelect;
};

const Select = SelectComponent as SelectType;
Select.options = SelectWithOptions;
Select.combine = CombineSelect;
Select.tokens = TokenSelect;

export { Select };

export type { SelectProps } from "./select";
export type { SelectWithOptionsProps } from "./withOptions";
export type { ChainSelectProps } from "./chains";
