import { ReactElement } from "react";
import { Slot } from "@radix-ui/react-slot";
import { ComponentPropsWithout } from "@/helpers/component-props";

type CaseProps<Props = {}> = { [key: string]: ReactElement<Props> };
type ValueTypes = string | number | (() => any);

type Props<Props = {}> = {
  value: ValueTypes;
  case: CaseProps<Props>;
  default?: ReactElement;
} & Props &
  ComponentPropsWithout<"div", "value" | "case" | "default">;

export const Match = <T,>(props: Props<T>) => {
  const { value, case: Case, default: Default, ...rest } = props;

  const _value = typeof value === "function" ? value() : value;

  const Element = Case[_value] || Default || "div";

  return <Slot children={Element} {...rest} />;
};
