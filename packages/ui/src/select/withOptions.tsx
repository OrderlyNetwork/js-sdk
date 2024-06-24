import React, { FC, PropsWithChildren, ReactElement } from "react";
import { Select, SelectProps } from "./select";
import { SelectGroup, SelectItem } from "./selectPrimitive";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectWithOptionsProps = SelectProps & {
  options: SelectOption[];
  optionRenderer?: (option: SelectOption) => ReactElement;
};

export const defaultOptionRenderer = (option: SelectOption) => (
  <SelectItem key={option.value} value={option.value}>
    {option.label}
  </SelectItem>
);

export const SelectWithOptions: FC<SelectWithOptionsProps> = (props) => {
  const {
    children,
    options,
    optionRenderer = defaultOptionRenderer,
    ...rest
  } = props;
  return (
    <Select {...rest}>
      <SelectGroup>
        {options.map((option, index) => {
          return React.cloneElement(optionRenderer(option), {
            size: props.size,
            key: index,
          });
        })}
      </SelectGroup>
    </Select>
  );
};
