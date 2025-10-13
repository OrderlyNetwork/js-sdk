import { forwardRef, PropsWithChildren, ReactNode } from "react";
import { EMPTY_LIST } from "@kodiak-finance/orderly-types";
import { cn, inputFormatter, Input, InputProps } from "@kodiak-finance/orderly-ui";
import { useOrderEntryContext } from "../orderEntryContext";

export type CustomInputProps = {
  label: string;
  suffix?: ReactNode;
  placeholder?: string;
  id: string;
  className?: string;
  name?: string;
  onChange?: (value: string) => void;
  value?: InputProps["value"];
  autoFocus?: InputProps["autoFocus"];
  error?: string;
  onFocus?: InputProps["onFocus"];
  onBlur?: InputProps["onBlur"];
  formatters?: InputProps["formatters"];
  overrideFormatters?: InputProps["formatters"];
  classNames?: InputProps["classNames"];
  readonly?: boolean;
};

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => {
    const { placeholder = "0" } = props;
    const { errorMsgVisible } = useOrderEntryContext();

    return (
      <Input.tooltip
        ref={ref}
        tooltip={errorMsgVisible ? props.error : undefined}
        autoComplete={"off"}
        autoFocus={props.autoFocus}
        size={"lg"}
        placeholder={props.readonly ? "" : placeholder}
        id={props.id}
        name={props.name}
        color={props.error ? "danger" : undefined}
        prefix={
          <InputLabel id={props.id} className={props.classNames?.prefix}>
            {props.label}
          </InputLabel>
        }
        suffix={props.suffix}
        value={props.readonly ? "" : props.value || ""}
        // onChange={props.onChange}
        onValueChange={props.onChange}
        onFocus={(event) => {
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          props.onBlur?.(event);
        }}
        formatters={
          props.overrideFormatters || [
            ...(props.formatters ?? EMPTY_LIST),
            inputFormatter.numberFormatter,
            inputFormatter.currencyFormatter,
            inputFormatter.decimalPointFormatter,
          ]
        }
        classNames={{
          root: cn(
            "orderly-order-entry oui-relative oui-h-[54px] oui-rounded oui-border oui-border-solid oui-border-line oui-px-2 oui-py-1 group-first:oui-rounded-t-xl group-last:oui-rounded-b-xl",
            props.className,
            props.classNames?.root,
          ),
          input: cn("oui-mb-1 oui-mt-5 oui-h-5", props?.classNames?.input),
          // prefix: cn(props.classNames?.prefix),
          suffix: cn(
            "oui-absolute oui-right-0 oui-top-0 oui-justify-start oui-py-2 oui-text-2xs oui-text-base-contrast-36",
            props.classNames?.suffix,
          ),
        }}
        readOnly={props.readonly}
      />
    );
  },
);

CustomInput.displayName = "CustomInput";

const InputLabel = (
  props: PropsWithChildren<{ id: string; className?: string }>,
) => {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        "oui-absolute oui-left-2 oui-top-[7px] oui-text-2xs oui-text-base-contrast-36",
        props.className,
      )}
    >
      {props.children}
    </label>
  );
};
