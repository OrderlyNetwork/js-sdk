import { InputHTMLAttributes } from "react";

export interface BaseInputProps<T = string>
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "prefix" | "disabled" | "inputMode" | "color"
  > {}

export const BaseInput = () => {};
