import { ComponentPropsWithout, RemovedProps } from "@/helpers/component-props";
import { Slot } from "@radix-ui/react-slot";
import React, { PropsWithChildren, useMemo } from "react";
import { cnBase } from "tailwind-variants";
import { Flex } from "../flex";
import { Spinner } from "../spinner/spinner";

type BaseButtonElement = React.ElementRef<"button">;
export interface BaseButtonProps
  extends ComponentPropsWithout<"button", RemovedProps> {
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  asChild?: boolean;
  as?: "button" | "a";
}

export const BaseButton = React.forwardRef<
  BaseButtonElement,
  PropsWithChildren<BaseButtonProps>
>((props, forwardedRef) => {
  const {
    asChild = false,
    children,
    loading,
    leading,
    trailing,
    ...rest
  } = props;
  const Comp = asChild ? Slot : "button";

  const content = useMemo(() => {
    return (
      <>
        {leading}
        {children}
        {trailing}
      </>
    );
  }, [children, leading, trailing]);

  return (
    <Comp {...rest} ref={forwardedRef}>
      {loading ? (
        <>
          <span className="invisible">{content}</span>
          <Flex>
            <span>
              <Spinner />
            </span>
          </Flex>
        </>
      ) : (
        content
      )}
    </Comp>
  );
});
