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

export type SelectType = typeof SelectComponent & {
  options: typeof SelectWithOptions;
};

const Select = SelectComponent as SelectType;
Select.options = SelectWithOptions;

export { Select };

export type { SelectProps } from "./select";
export type { SelectWithOptionsProps } from "./withOptions";
