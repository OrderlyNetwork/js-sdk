import { FC } from "react";
import { Slot } from "@radix-ui/react-slot";

interface FormattedDateProps {
  value: string | number | Date;
  format?: string;
  asChild?: boolean;
}

export const FormattedDate: FC<FormattedDateProps> = (props) => {
  const Comp = props.asChild ? Slot : "span";
  return <Comp></Comp>;
};
