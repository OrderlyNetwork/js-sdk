import { FC, PropsWithChildren } from "react";
import { Select, SelectProps } from "./select";
import { SelectGroup, SelectItem } from "./selectPrimitive";

type SelectOption = {
  label: string;
  value: string;
};

export type SelectWithOptionsProps = SelectProps & {
  options: SelectOption[];
};

export const SelectWithOptions: FC<SelectWithOptionsProps> = (props) => {
  const { children, options, ...rest } = props;
  return (
    <Select {...rest}>
      <SelectGroup>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </Select>
  );
};
