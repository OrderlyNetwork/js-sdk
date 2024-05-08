import React from "react";
import { Flex } from "../flex/flex";
import { Input, InputProps } from "./input";
import { InputLabel } from "./inputLabel";
import { InputHelpText } from "./inputHelpText";

export type TextFieldProps = InputProps & {
  label: string;
  helpText?: string;
  direction?: "row" | "column";
};

export const TextField: React.FC<TextFieldProps> = React.forwardRef<
  HTMLInputElement,
  TextFieldProps
>((props) => {
  const { label, helpText, direction = "column", ...inputProps } = props;

  return (
    <Flex direction={direction}>
      <InputLabel>{label}</InputLabel>
      <Input {...inputProps} />
      <InputHelpText color={inputProps.color}>{helpText}</InputHelpText>
    </Flex>
  );
});
