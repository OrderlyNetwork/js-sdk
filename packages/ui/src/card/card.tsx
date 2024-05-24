import { PropsWithChildren, ReactElement, forwardRef } from "react";
import { CardBase, CardContent, CardHeader, CardTitle } from "./cardBase";
import type { ComponentPropsWithout } from "../helpers/component-props";

type CardProps = {
  title?: string | ReactElement;
  // color?: number;
} & ComponentPropsWithout<"div", "title" | "color">;

const Card = forwardRef<React.ElementRef<"div">, PropsWithChildren<CardProps>>(
  (props, ref) => {
    const { title, children, ...rest } = props;
    return (
      <CardBase {...rest} ref={ref}>
        <CardHeader>
          {typeof props.title === "string" ? (
            <CardTitle>{title}</CardTitle>
          ) : (
            title
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </CardBase>
    );
  }
);

Card.displayName = "Card";

export { Card };
