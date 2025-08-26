import { forwardRef, useEffect, useRef } from "react";
import { EMPTY_LIST } from "@orderly.network/types";
import {
  inputFormatter,
  Input,
  InputProps,
  CheckIcon,
  cn,
} from "@orderly.network/ui";

export type CustomInputProps = {
  id?: string;
  className?: string;
  name?: string;
  onChange?: (value: string) => void;
  value?: InputProps["value"];
  error?: string;
  formatters?: InputProps["formatters"];
  overrideFormatters?: InputProps["formatters"];
  classNames?: InputProps["classNames"];
  readonly?: boolean;
  onClick: (e: any) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  handleKeyDown: (e: any) => void;
  placeholder?: string;
};

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const input = inputRef.current;
      if (input) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, [props.value]);

    return (
      <Input.tooltip
        ref={inputRef}
        tooltip={props.error}
        autoComplete="off"
        autoFocus
        type="text"
        size="sm"
        placeholder={props.readonly ? "" : props.placeholder || ""}
        id={props.id}
        name={props.name}
        color={props.error ? "danger" : undefined}
        value={props.readonly ? "" : props.value || ""}
        onValueChange={props.onChange}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.handleKeyDown}
        formatters={
          props.overrideFormatters || [
            ...(props.formatters ?? EMPTY_LIST),
            inputFormatter.numberFormatter,
            inputFormatter.decimalPointFormatter,
          ]
        }
        classNames={{
          root: "oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded",
          input: "oui-pr-2",
        }}
        readOnly={props.readonly}
        suffix={
          <button onClick={props.onClick} disabled={!!props.error}>
            <CheckIcon
              size={18}
              color="white"
              opacity={1}
              className={cn(
                "oui-opacity-50",
                props.error
                  ? "oui-cursor-not-allowed"
                  : "oui-cursor-pointer hover:oui-opacity-100",
              )}
            />
          </button>
        }
      />
    );
  },
);

CustomInput.displayName = "CustomInput";
