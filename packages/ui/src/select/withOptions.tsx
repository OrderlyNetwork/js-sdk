import React, { FC, ReactElement } from "react";
import { Select, SelectProps } from "./select";
import { SelectGroup, SelectItem } from "./selectPrimitive";
import { Flex } from "../flex";
import { Box } from "../box";
import { cn } from "..";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectWithOptionsProps<T = string> = SelectProps<T> & {
  // options: SelectOption[] | (() => Promise<SelectOption[]>);
  currentValue?: string;
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

export const defaultOptionRenderer = (
  option: SelectOption,
  currentValue?: string
) => (
  <SelectItem key={option.value} value={option.value} className={cn("oui-relative")}>
    {option.label}
    {currentValue == option.value && (
      <Box
        width={4}
        height={4}
        gradient="primary"
        r="full"
        className="oui-absolute oui-right-2 oui-top-1/2 -oui-translate-y-1/2"
      />
    )}
  </SelectItem>
);

export const SelectWithOptions: FC<SelectWithOptionsProps> = (props) => {
  const {
    children,
    options,
    optionRenderer = defaultOptionRenderer,
    currentValue,
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
          return React.cloneElement(optionRenderer(option, currentValue), {
            size: props.size,
            key: index,
            index,
          });
        })}
      </SelectGroup>
    </Select>
  );
};
