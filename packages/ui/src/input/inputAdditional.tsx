import { FC, PropsWithChildren } from "react";
import { cnBase } from "tailwind-variants";
import { Slot } from "@radix-ui/react-slot";

export const InputAdditional: FC<
  PropsWithChildren<{
    className?: string;
    name?: string;
    asChild?: boolean;
    as?: string;
  }>
> = (props) => {
  const { asChild, as = "label" } = props;

  const Comp = asChild ? Slot : "label";

  return (
    <Comp
      htmlFor={props.name}
      className={cnBase(
        "oui-h-full oui-flex oui-flex-col oui-justify-center oui-px-3 oui-text-base-contrast/60",
        props.className
      )}
    >
      {props.children}
    </Comp>
  );
};
