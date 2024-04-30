import React, { useMemo } from "react";
import {
  ComponentPropsWithout,
  RemovedProps,
} from "../helpers/component-props";
import { Slot } from "@radix-ui/react-slot";
import { Flex } from "../flex";
import { Spinner } from "../spinner/spinner";
import { SizeType } from "../helpers/sizeType";

type BaseButtonElement = React.ElementRef<"button">;

export interface BaseButtonProps
  extends ComponentPropsWithout<"button", RemovedProps> {
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  asChild?: boolean;
  size: SizeType;
  as?: "button" | "a";
}

export const BaseButton = React.forwardRef<BaseButtonElement, BaseButtonProps>(
  (props, forwardedRef) => {
    const {
      asChild = false,
      children,
      loading,
      leading,
      trailing,
      size,
      ...rest
    } = props;
    const Comp = asChild ? Slot : "button";

    const content = useMemo(() => {
      if (!leading && !trailing) return children;
      return (
        <Flex as="span" itemAlign={"center"} className="oui-space-x-1">
          {leading}
          <span>{children}</span>
          {trailing}
        </Flex>
      );
    }, [children, leading, trailing]);

    return (
      <Comp {...rest} ref={forwardedRef}>
        {loading ? (
          <>
            <span className="oui-invisible">{content}</span>
            <Flex
              itemAlign={"center"}
              justify={"center"}
              position={"absolute"}
              as="span"
            >
              <Spinner size={size} />
            </Flex>
          </>
        ) : (
          content
        )}
      </Comp>
    );
  }
);
