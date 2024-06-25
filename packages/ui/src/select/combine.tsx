import React, { KeyboardEvent, useCallback, useRef, useState } from "react";
import { SelectOption, SelectWithOptionsProps } from "./withOptions";

import { Input } from "../input";
import { CaretDownIcon } from "../icon";
import * as SelectPrimitive from "@radix-ui/react-select";
import { PopoverBase, PopoverAnchor, PopoverContent } from "../popover";
import { selectVariants } from "./selectPrimitive";
import { SizeType } from "../helpers/sizeType";

export type CombineSelectProps = {
  placeholder?: string;
} & SelectWithOptionsProps;

export const CombineSelect = (props: CombineSelectProps) => {
  const { options, ...rest } = props;
  const [keyword, setKeyword] = useState<string>(props.value);
  const [open, setOpen] = useState<boolean>(props.defaultOpen || false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [focused, setFocused] = useState<boolean>(false);

  const onFocus = (e) => {
    setFocused(true);
  };

  const filteredOptions = !keyword
    ? options
    : options.filter((option) => {
        if (option.value.includes(keyword)) return true;
      });

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      console.log(e.code);
    },
    [filteredOptions]
  );

  return (
    <PopoverBase open={open || focused} onOpenChange={setOpen}>
      <PopoverAnchor>
        <Input
          size={props.size}
          autoComplete={"off"}
          onFocus={onFocus}
          onBlur={() => {
            setFocused(false);
          }}
          placeholder={props.placeholder ?? "All"}
          value={keyword}
          onValueChange={(value) => {
            setKeyword(value);
            // props.onValueChange(value);
          }}
          onKeyDown={onKeyDown}
          className={"oui-min-w-48 oui-peer"}
          data-state={focused ? "open" : "closed"}
          suffix={
            <SelectPrimitive.Icon
              asChild
              className="oui-transition-transform peer-data-[state=open]:oui-rotate-180 peer-data-[state=closed]:oui-rotate-0 oui-mx-2"
            >
              <CaretDownIcon
                size={12}
                className="oui-text-inherit"
                // opacity={1}
              />
            </SelectPrimitive.Icon>
          }
        />
      </PopoverAnchor>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={"oui-w-[var(_--radix-popover-trigger-width)] oui-p-1"}
      >
        {filteredOptions.map((option, index) => {
          return (
            <SelectItem
              option={option}
              key={index}
              size={props.size}
              activated={selectedIndex === index}
              onClick={(value) => {
                props.onValueChange(value.value);
                setKeyword(value.value);
              }}
            />
          );
        })}
      </PopoverContent>
    </PopoverBase>
  );
};

const SelectItem = (props: {
  option: SelectOption;
  size: SizeType;
  activated: boolean;
  onClick: (item: SelectOption) => void;
}) => {
  const { item } = selectVariants({
    size: props.size,
  });
  return (
    <button
      className={item({
        className: "oui-text-base-contrast-54",
      })}
      onClick={() => {
        props.onClick(props.option);
      }}
    >
      {props.option.label}
    </button>
  );
};
