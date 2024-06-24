import { defaultOptionRenderer, SelectWithOptionsProps } from "./withOptions";
import {
  SelectContent,
  SelectGroup,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./selectPrimitive";
import React, { useState } from "react";
import { Input } from "../input";
import { CaretDownIcon } from "../icon";
import * as SelectPrimitive from "@radix-ui/react-select";

export type CombineSelectProps = {} & SelectWithOptionsProps;

export const CombineSelect = (props: CombineSelectProps) => {
  const { options, optionRenderer = defaultOptionRenderer, ...rest } = props;
  const [keyword, setKeyword] = useState(props.value);
  const [open, setOpen] = useState<boolean>(props.defaultOpen || true);

  const filteredOptions = !keyword
    ? options
    : options.filter((option) => {
        if (option.value.includes(keyword)) return true;
      });

  return (
    <SelectRoot open={open} onOpenChange={setOpen} {...rest}>
      <SelectTrigger asChild>
        <Input
          size={props.size}
          autoComplete={"off"}
          onFocus={() => setOpen(true)}
          className={"oui-min-w-16"}
          suffix={
            <SelectPrimitive.Icon
              asChild
              className="oui-transition-transform group-data-[state=open]:oui-rotate-180 group-data-[state=closed]:oui-rotate-0"
            >
              <CaretDownIcon
                size={12}
                className="oui-text-inherit"
                opacity={1}
              />
            </SelectPrimitive.Icon>
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {filteredOptions.map((option, index) => {
            return React.cloneElement(optionRenderer(option), {
              size: props.size,
              key: index,
            });
          })}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
};
