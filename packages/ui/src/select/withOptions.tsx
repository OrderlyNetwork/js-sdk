import React, { FC, ReactElement, useMemo, useState } from "react";
import { SizeType } from "../helpers/sizeType";
import { Select, SelectProps } from "./select";
import { SelectGroup, SelectItem } from "./selectPrimitive";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectWithOptionsProps<T = string> = SelectProps<T> & {
  // options: SelectOption[] | (() => Promise<SelectOption[]>);
  options: SelectOption[];
  optionRenderer?: (
    option: SelectOption
    // & {
    //   size?: SizeType;
    //   index: number;
    // }
  ) => ReactElement;
  // loading?: boolean;
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

  // const [] = useState<SelectOption[]>([]);

  return (
    <Select {...rest}>
      <SelectGroup>
        {options.map((option, index) => {
          // return optionRenderer({
          //   ...option,
          //   // value: option,
          //   size: props.size,
          //   index,
          // });
          return React.cloneElement(optionRenderer(option), {
            size: props.size,
            key: index,
            index,
          });
        })}
      </SelectGroup>
    </Select>
  );
};
